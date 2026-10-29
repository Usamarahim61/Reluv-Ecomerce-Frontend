"use client";
import React, { useState, Suspense, useEffect, useRef, useMemo } from "react";
import {
  MapPin,
  Home,
  ChevronRight,
  Edit2,
  X,
  HelpCircle,
  Banknote,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { Lock as LockIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import PickupPointModal from "../components/PickupPointModal";
import PhoneField from "../components/PhoneField";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast, ToastContainer } from "react-toastify";
// @ts-ignore
import "react-toastify/dist/ReactToastify.css";
import { getUserAddress } from "@/services/auth-service";
import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as FALLBACK_STRIPE_KEY } from "@/constants";
import AddressModal, {
  type ThaiAddress,
  emptyThaiAddress,
  formatThaiAddress,
  hydrateThaiAddress,
} from "../components/AddressModal";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || FALLBACK_STRIPE_KEY;

// Only create the Stripe promise when a key exists, so a missing env var
// produces a clear on-screen message instead of a silently empty form.
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

// A valid PaymentIntent client secret looks like: pi_XXXX_secret_YYYY
const CLIENT_SECRET_PATTERN = /^pi_[^_]+_secret_.+$/;

// Pulls a readable message out of whatever shape the backend error takes.
const extractApiError = async (res: Response, fallback: string) => {
  try {
    const body = await res.json();
    const msg =
      body?.error?.message ??
      body?.message ??
      (typeof body?.error === "string" ? body.error : null);
    return (msg as string) || fallback;
  } catch {
    return fallback;
  }
};

const toastConfig = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProductData {
  title: string;
  brand: string;
  size: string;
  price: number;
  imageUrl: string;
  buyerProtectionFee: number;
  shippingFee: number;
  currency: string;
}

// ── Outer wrapper: owns address/delivery state + creates the PaymentIntent ─────

const CheckOutContent: React.FC = () => {
  const { user } = useAuth();
  const hasFetched = useRef(false);

  const [savedAddress, setSavedAddress] = useState<ThaiAddress>(emptyThaiAddress);
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "home">("pickup");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [SameNumberForFutureOrders, setSameNumberForFutureOrders] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [openBuyerProtectionModal, setOpenBuyerProtectionModal] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Surfaces ad-blocker / network failures that stop Stripe.js from loading.
  useEffect(() => {
    if (!stripePromise) return;
    stripePromise
      .then((stripe) => {
        if (!stripe) setStripeLoadError("Stripe.js could not be initialised.");
      })
      .catch((err) => {
        console.error("Stripe.js failed to load:", err);
        setStripeLoadError(
          "Stripe.js failed to load. Check your connection and disable any ad blocker or extension that blocks js.stripe.com, then reload.",
        );
      });
  }, []);
  // Increments after every successful create/update so the Payment Element
  // knows when to call elements.fetchUpdates().
  const [syncCount, setSyncCount] = useState(0);

  // Guards against creating more than one PaymentIntent (React Strict Mode
  // runs effects twice in dev) and against overlapping sync requests.
  const paymentIntentIdRef = useRef<string | null>(null);
  const inFlight = useRef(false);
  const needsResync = useRef(false);

  const searchParams = useSearchParams();

  const data: ProductData = {
    title: searchParams.get("title") || "",
    brand: searchParams.get("brand") || "",
    size: searchParams.get("size") || "",
    price: Number(searchParams.get("price")) || 0,
    currency: searchParams.get("currency") || "thb",
    imageUrl: searchParams.get("imageUrl") || "",
    buyerProtectionFee: Number(searchParams.get("buyerProtectionFee")) || 0,
    shippingFee: Number(searchParams.get("shippingFee")) || 0,
  };

  const shippingCost = deliveryMethod === "home" ? 16.25 : (data?.shippingFee ?? 0);
  const totalToPay = data.price + data.buyerProtectionFee + shippingCost;

  // Always holds the latest shipping cost so a queued re-sync never uses a stale value.
  const latestShipping = useRef(shippingCost);
  latestShipping.current = shippingCost;

  // ── Fetch saved address ──────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const userData = await getUserAddress(Number(user.id));
        setSavedAddress(hydrateThaiAddress(userData));
      } catch (error) {
        console.error("Failed to load profile data.", error);
        hasFetched.current = false;
      }
    };

    fetchData();
  }, [user?.id]);

  // ── Create / update the PaymentIntent ────────────────────────────────────
  // First run creates the intent. Later runs (delivery method changed) update
  // that same intent. Only one request is ever in flight; if the delivery
  // method changes meanwhile, we run once more afterwards with the latest value.

  useEffect(() => {
    if (!user?.id) return;

    const syncPaymentIntent = async () => {
      if (inFlight.current) {
        needsResync.current = true;
        return;
      }
      inFlight.current = true;

      try {
        do {
          needsResync.current = false;

          const body = {
            productId: searchParams.get("productId"),
            buyerId: user.id,
            sellerId: searchParams.get("sellerId"),
            buyerProtectionFee: data.buyerProtectionFee,
            shippingFee: latestShipping.current,
            currencyCode: data.currency,
            paymentIntentId: paymentIntentIdRef.current ?? undefined,
          };

          const res = await fetch(`${API_BASE_URL}/api/orders/sync-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const message = await extractApiError(res, "Could not prepare payment.");
            console.error("sync-payment-intent failed:", res.status, message);
            throw new Error(message);
          }

          const result = await res.json();
          console.log("sync-payment-intent response keys:", Object.keys(result ?? {}));

          const newIntentId: string | undefined =
            result?.paymentIntentId ?? result?.data?.paymentIntentId;
          const newClientSecret: string | undefined =
            result?.clientSecret ??
            result?.client_secret ??
            result?.data?.clientSecret;

          if (!newIntentId) {
            throw new Error("The server did not return a paymentIntentId.");
          }

          const isFirstCreate = !paymentIntentIdRef.current;
          if (isFirstCreate) {
            if (!newClientSecret || !CLIENT_SECRET_PATTERN.test(newClientSecret)) {
              throw new Error(
                "The server returned an invalid payment client secret. It must be the client_secret of a PaymentIntent (pi_..._secret_...).",
              );
            }
            setClientSecret(newClientSecret);
          }

          paymentIntentIdRef.current = newIntentId;
          setPaymentIntentId(newIntentId);
          setSyncCount((c) => c + 1);
        } while (needsResync.current);
      } catch (error) {
        console.error("Payment intent error:", error);
        setIntentError(
          error instanceof Error && error.message
            ? error.message
            : "Could not initialize payment.",
        );
      } finally {
        inFlight.current = false;
      }
    };

    syncPaymentIntent();
    // Only re-sync when the amount-affecting delivery method changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, deliveryMethod, retryKey]);

  const elementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret as string,
      appearance: { theme: "stripe" as const },
    }),
    [clientSecret],
  );

  const handleRetry = () => {
    paymentIntentIdRef.current = null;
    inFlight.current = false;
    needsResync.current = false;
    setClientSecret(null);
    setPaymentIntentId(null);
    setIntentError(null);
    setSyncCount(0);
    setRetryKey((k) => k + 1);
  };

  if (!stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-red-500">
        Stripe is not configured: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing.
        Add it to your .env file and restart the dev server.
      </div>
    );
  }

  if (stripeLoadError || intentError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-red-500 max-w-md">{stripeLoadError || intentError}</p>
        <button
          onClick={stripeLoadError ? () => window.location.reload() : handleRetry}
          className="bg-[#cb6f4d] hover:bg-[#a85a3c] text-white font-medium px-5 py-2 rounded"
        >
          {stripeLoadError ? "Reload page" : "Try again"}
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading checkout...
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckOutInner
        data={data}
        totalToPay={totalToPay}
        shippingCost={shippingCost}
        deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod}
        savedAddress={savedAddress}
        setSavedAddress={setSavedAddress}
        openAddressModal={openAddressModal}
        setOpenAddressModal={setOpenAddressModal}
        openPickupModal={openPickupModal}
        setOpenPickupModal={setOpenPickupModal}
        pickupAddress={pickupAddress}
        setPickupAddress={setPickupAddress}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        SameNumberForFutureOrders={SameNumberForFutureOrders}
        setSameNumberForFutureOrders={setSameNumberForFutureOrders}
        openBuyerProtectionModal={openBuyerProtectionModal}
        setOpenBuyerProtectionModal={setOpenBuyerProtectionModal}
        paymentIntentId={paymentIntentId}
        syncCount={syncCount}
        userId={user?.id}
        username={user?.username}
      />
    </Elements>
  );
};

// ── Inner component: rendered inside <Elements>, owns the Stripe confirm + submit ─

interface InnerProps {
  data: ProductData;
  totalToPay: number;
  shippingCost: number;
  deliveryMethod: "pickup" | "home";
  setDeliveryMethod: (m: "pickup" | "home") => void;
  savedAddress: ThaiAddress;
  setSavedAddress: (a: ThaiAddress) => void;
  openAddressModal: boolean;
  setOpenAddressModal: (v: boolean) => void;
  openPickupModal: boolean;
  setOpenPickupModal: (v: boolean) => void;
  pickupAddress: string;
  setPickupAddress: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  SameNumberForFutureOrders: boolean;
  setSameNumberForFutureOrders: (v: boolean) => void;
  openBuyerProtectionModal: boolean;
  setOpenBuyerProtectionModal: (v: boolean) => void;
  paymentIntentId: string | null;
  syncCount: number;
  userId?: string | number;
  username?: string;
}

const CheckOutInner: React.FC<InnerProps> = ({
  data,
  totalToPay,
  shippingCost,
  deliveryMethod,
  setDeliveryMethod,
  savedAddress,
  setSavedAddress,
  openAddressModal,
  setOpenAddressModal,
  openPickupModal,
  setOpenPickupModal,
  pickupAddress,
  setPickupAddress,
  phoneNumber,
  setPhoneNumber,
  SameNumberForFutureOrders,
  setSameNumberForFutureOrders,
  openBuyerProtectionModal,
  setOpenBuyerProtectionModal,
  paymentIntentId,
  syncCount,
  userId,
  username,
}) => {
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentUiState, setPaymentUiState] = useState<"loading" | "ready" | "error">("loading");
  const [paymentUiError, setPaymentUiError] = useState<string | null>(null);
  const [slowLoad, setSlowLoad] = useState(false);

  // If the Payment Element hasn't reported ready after 8s, warn the buyer.
  useEffect(() => {
    if (paymentUiState !== "loading") return;
    const timer = setTimeout(() => setSlowLoad(true), 8000);
    return () => clearTimeout(timer);
  }, [paymentUiState]);

  const displayedAddress = formatThaiAddress(savedAddress);

  // After the server updates the PaymentIntent amount (delivery method changed),
  // tell the Payment Element to pull the new amount. The first sync is the
  // initial creation, so we skip it.
  useEffect(() => {
    if (syncCount > 1 && elements) {
      elements.fetchUpdates().catch((err) => {
        console.error("Failed to refresh Payment Element:", err);
      });
    }
  }, [syncCount, elements]);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || !stripe || !elements || !paymentIntentId) return;

    if (paymentUiState !== "ready") {
      toast.error(
        "The payment form hasn't loaded. Please wait or reload the page.",
        toastConfig,
      );
      return;
    }

    if (deliveryMethod === "pickup" && !pickupAddress) {
      toast.error("Please select a pick-up point", toastConfig);
      return;
    }

    if (deliveryMethod === "home" && !phoneNumber) {
      toast.error("Phone number is required for home delivery", toastConfig);
      return;
    }

    const formattedAddress = formatThaiAddress(savedAddress);
    if (deliveryMethod === "home" && !formattedAddress) {
      toast.error("Your address is missing. Please update your address.", toastConfig);
      return;
    }

    setIsPlacingOrder(true);
    let paidIntentId: string | null = null;

    try {
      // Validates the Payment Element's fields before we attempt to confirm
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || "Please check your payment details", toastConfig);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/Orders` },
        redirect: "if_required",
      });

      if (confirmError) {
        toast.error(confirmError.message || "Payment failed. Please try again.", toastConfig);
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        toast.error(
          `Payment was not completed (status: ${paymentIntent?.status ?? "unknown"}).`,
          toastConfig,
        );
        return;
      }

      paidIntentId = paymentIntent.id;

      const payload = {
        productId: searchParams.get("productId"),
        buyerId: userId,
        sellerId: searchParams.get("sellerId"),
        productImage: searchParams.get("imageUrl") || "",
        productPrice: data.price,
        productTitle: searchParams.get("title"),
        username,
        deliveryMethod,
        ...(deliveryMethod === "home" && { address: formattedAddress }),
        ...(deliveryMethod === "pickup" && pickupAddress && { pickupAddress }),
        phoneNumber: deliveryMethod === "home" ? phoneNumber : null,
        SameNumberForFutureOrders,
        buyerProtectionFee: data.buyerProtectionFee,
        shippingFee: shippingCost,
        OrderStatus: "placed",
        currencyCode: data.currency,
        total: totalToPay,
        paymentIntentId: paymentIntent.id,
      };

      const res = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        // The backend is authoritative: if another buyer completed the
        // purchase first, tell the user clearly instead of a generic error.
        if (result?.error?.code === "PRODUCT_SOLD" || res.status === 409) {
          toast.error(
            "This product has already been purchased and is no longer available.",
            toastConfig,
          );
          setTimeout(() => { window.location.href = "/"; }, 2500);
          return;
        }
        console.error("place-order failed after successful payment:", paymentIntent.id, result);
        toast.error(
          result?.message || result?.error?.message || `Your payment went through but we couldn't create the order. Please contact support with reference ${paymentIntent.id}.`,
          { ...toastConfig, autoClose: false },
        );
        return;
      }

      const offerId = searchParams.get("offerId");
      if (offerId && result?.data?.id) {
        await fetch(`${API_BASE_URL}/api/offers/${offerId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.data.id, buyerId: userId }),
        });
      }

      toast.success("Order placed successfully!", toastConfig);
      setTimeout(() => {
        window.location.href = "/Orders";
      }, 2000);
    } catch (error) {
      console.error("Order Error:", error);
      if (paidIntentId) {
        toast.error(
          `Your payment went through but we couldn't finish the order. Please contact support with reference ${paidIntentId}.`,
          { ...toastConfig, autoClose: false },
        );
      } else {
        toast.error("Something went wrong. Please try again.", toastConfig);
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header */}
            <div className="flex gap-4 bg-white p-4 rounded-sm shadow-sm">
              <img
                src={data.imageUrl}
                alt={data.title}
                className="w-20 h-24 object-cover rounded-sm"
              />
              <div>
                <h1 className="font-medium text-gray-900 text-sm md:text-base">
                  {data.title}
                </h1>
                <p className="text-gray-500 text-sm">{data.brand}</p>
                <p className="text-gray-500 text-sm">{data.size}</p>
                <p className="font-semibold mt-1">thb {data.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Address Section */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Address</h2>
              <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start border-l-4 border-[#cb6f4d]">
                <div>
                  <p className="font-bold text-gray-800">{username}</p>
                  <p className="text-gray-600 text-sm">
                    {displayedAddress || "No address on file"}
                  </p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setOpenAddressModal(true)}
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </section>

            {/* Delivery Options */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Delivery option</h2>
              <div className="space-y-3">
                {/* Pickup */}
                <label
                  className={`flex items-center justify-between p-4 bg-white border-2 rounded-sm cursor-pointer transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-[#cb6f4d]"
                      : "border-transparent shadow-sm"
                  }`}
                  onClick={() => setDeliveryMethod("pickup")}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-500" />
                    <div>
                      <p className="font-medium">Ship to pick-up point</p>
                      <p className="text-gray-500 text-sm">
                        thb {data.shippingFee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="w-5 h-5 accent-[#cb6f4d]"
                  />
                </label>

                {/* Home */}
                <label
                  className={`flex items-center justify-between p-4 bg-white border-2 rounded-sm cursor-pointer transition-all ${
                    deliveryMethod === "home"
                      ? "border-[#cb6f4d]"
                      : "border-transparent shadow-sm"
                  }`}
                  onClick={() => setDeliveryMethod("home")}
                >
                  <div className="flex items-center gap-3">
                    <Home className="text-gray-500" />
                    <div>
                      <p className="font-medium">Ship to home</p>
                      <p className="text-gray-500 text-sm">thb 16.25</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "home"}
                    onChange={() => setDeliveryMethod("home")}
                    className="w-5 h-5 accent-[#cb6f4d]"
                  />
                </label>
              </div>
            </section>

            {/* Conditional Delivery Details */}
            <section className="mt-6 space-y-6">
              {deliveryMethod === "pickup" ? (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Delivery details</h2>
                  <div
                    onClick={() => setOpenPickupModal(true)}
                    className="bg-white p-4 rounded-sm shadow-sm flex items-center justify-between border border-gray-200 cursor-pointer hover:border-[#cb6f4d] transition-colors"
                  >
                    {pickupAddress ? (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#cb6f4d] shrink-0" />
                        <span className="text-gray-900 text-sm md:text-base">
                          {pickupAddress}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-900 text-sm md:text-base">
                        Choose a pick-up point
                      </span>
                    )}
                    <span className="text-2xl font-light text-gray-400">+</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* DHL Delivery Details */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Delivery details</h2>
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-[#FFCC00] px-1 rounded-sm flex items-center">
                          <span className="text-[10px] font-black text-red-600">DHL</span>
                        </div>
                        <span className="font-medium text-sm">DHL Express</span>
                      </div>
                      <p className="font-semibold text-sm">thb 16.25</p>
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs">Home delivery, 2 - 4 business days</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Your contact details</h2>
                    <div className="bg-white p-4 rounded-sm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between border border-gray-200 gap-4">
                      <div className="flex items-center flex-1 w-full border-b md:border-b-0 pb-2 md:pb-0 border-gray-100">
                        <PhoneField
                          value={phoneNumber}
                          onChange={(val) => setPhoneNumber(val)}
                          hasError={false}
                          placeholder="81 234 5678"
                          width="60%"
                        />
                      </div>
                      <div className="flex items-center gap-2 cursor-pointer select-none">
                        <label
                          htmlFor="save-number"
                          className="text-[11px] md:text-xs text-gray-500 text-right leading-tight"
                        >
                          <span className="font-bold">Same for future orders</span>
                        </label>
                        <input
                          id="save-number"
                          type="checkbox"
                          checked={SameNumberForFutureOrders}
                          onChange={(e) => setSameNumberForFutureOrders(e.target.checked)}
                          className="w-5 h-5 accent-[#cb6f4d] rounded border-gray-300 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Payment Section — Stripe Payment Element replaces manual card entry */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Payment</h2>
              <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                {paymentUiState === "error" && (
                  <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-medium">The payment form couldn't be loaded.</p>
                    <p className="mt-1">{paymentUiError}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-2 underline"
                    >
                      Reload page
                    </button>
                  </div>
                )}
                {paymentUiState === "loading" && slowLoad && (
                  <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    The payment form is taking longer than expected. If it stays
                    empty, check your connection, disable any ad blocker, and
                    reload the page.
                  </div>
                )}
                <PaymentElement
                  onReady={() => {
                    setPaymentUiState("ready");
                    setPaymentUiError(null);
                  }}
                  onLoadError={(e) => {
                    console.error("Payment Element load error:", e.error);
                    setPaymentUiError(
                      e.error?.message ||
                        "Stripe could not load the available payment methods.",
                    );
                    setPaymentUiState("error");
                  }}
                />
              </div>
            </section>
          </div>

          {/* ── Right Column: Price Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-sm shadow-sm sticky top-8">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-500">
                Price summary
              </h2>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order</span>
                  <span>thb {data.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-gray-600">
                    <span className="underline decoration-dotted">Buyer Protection fee</span>
                    <button
                      onClick={() => setOpenBuyerProtectionModal(true)}
                      aria-label="Help"
                      className="flex items-center"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </span>
                  <span>thb {data.buyerProtectionFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total to pay</span>
                  <span>thb {totalToPay.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!stripe || !elements || isPlacingOrder || paymentUiState !== "ready"}
                className="w-full bg-[#cb6f4d] hover:bg-[#a85a3c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors mb-4 flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                    Processing...
                  </>
                ) : (
                  "Pay"
                )}
              </button>

              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 uppercase tracking-tight">
                <span className="mb-0.5">🔒</span> Your payment details are
                encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <PickupPointModal
        isOpen={openPickupModal}
        onClose={() => setOpenPickupModal(false)}
        onConfirm={(address, lat, lng) => {
          setPickupAddress(address);
          console.log("Pickup coords:", lat, lng);
        }}
      />

      <AddressModal
        isOpen={openAddressModal}
        onClose={() => setOpenAddressModal(false)}
        initialAddress={savedAddress}
        onSave={(addr) => setSavedAddress(addr)}
        title="Delivery Address"
        submitLabel="Save Address"
      />

      {/* ── Buyer Protection Modal ── */}
      {openBuyerProtectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative p-4 flex items-center justify-end">
              <button
                onClick={() => setOpenBuyerProtectionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#fdf0eb] mx-auto">
                  <ShieldCheck className="w-9 h-9 text-[#cb6f4d]" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-950 tracking-tight pt-2">
                  Buyer Protection
                </h2>
                <button className="text-xs font-medium text-[#cb6f4d] hover:underline block mx-auto">
                  Learn how we calculate the Buyer Protection fee
                </button>
              </div>

              <p className="text-gray-600 text-[15px] leading-relaxed text-center">
                For every purchase made with us, we make sure you're covered.
              </p>

              <div className="space-y-6 text-[14px] text-gray-600 leading-relaxed">
                <div className="flex gap-4 items-start">
                  <div className="mt-0.5 p-1 rounded bg-[#fdf0eb]/50">
                    <Banknote className="w-5 h-5 text-[#cb6f4d]" strokeWidth={2} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-gray-900 text-[15px]">Refund policy</h3>
                    <p>You can receive a refund if your order:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>was never shipped or is lost</li>
                      <li>arrives damaged</li>
                      <li>is significantly not as described.</li>
                    </ul>
                    <p className="pt-1">
                      You have{" "}
                      <span className="font-semibold text-gray-900">2 days to submit your claim</span>{" "}
                      from when you're notified that an item was delivered. Learn more in our{" "}
                      <button className="text-[#cb6f4d] underline font-medium hover:text-[#b05b3b]">
                        Refund Policy
                      </button>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-0.5 p-1 rounded bg-[#fdf0eb]/50">
                    <LockIcon className="w-5 h-5 text-[#cb6f4d]" strokeWidth={2} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-gray-900 text-[15px]">Secure transactions</h3>
                    <p>
                      Your money is held securely throughout the entire transaction.
                      We won't release it to the seller until you receive your order and confirm
                      everything is OK.
                    </p>
                    <p>
                      Payments are encrypted by our payment partner.{" "}
                      <span className="font-semibold text-gray-900">
                        The seller will never see your payment details.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-0.5 p-1 rounded bg-[#fdf0eb]/50">
                    <MessageSquare className="w-5 h-5 text-[#cb6f4d]" strokeWidth={2} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-gray-900 text-[15px]">Our support</h3>
                    <p>
                      Reach out to our support team at any time – they're available to assist
                      you with any issues.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpenBuyerProtectionModal(false)}
                className="w-full bg-[#cb6f4d] hover:bg-[#b05b3b] text-white font-medium py-3.5 rounded-xl transition-colors text-[15px] font-semibold tracking-wide mt-4"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Wrapper with Suspense ──────────────────────────────────────────────────────

const CheckOut: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading checkout...
        </div>
      }
    >
      <CheckOutContent />
    </Suspense>
  );
};

export default CheckOut;