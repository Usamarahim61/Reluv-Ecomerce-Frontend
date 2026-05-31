"use client";
import React, { useState, Suspense, useEffect, useRef } from "react";
import {
  CreditCard,
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
import {Lock as LockIcon} from "lucide-react";
import { useSearchParams } from "next/navigation";
import CardDetailsModal from "../components/AddCard";
import PickupPointModal from "../components/PickupPointModal";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast, ToastContainer } from "react-toastify";
// @ts-ignore
import "react-toastify/dist/ReactToastify.css";
import { getUser, getUserAddress } from "@/services/auth-service";
import { formatUserAddress, getGoogleAddress } from "@/lib/user-profile";

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

const CheckOutContent: React.FC = () => {
  const { user } = useAuth();
  const hasFetched = useRef(false);
  const [userAddress, setUserAddress] = useState("");
  const [openCardModal, setOpenCardModal] = useState(false);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "home">(
    "pickup",
  );
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [SameNumberForFutureOrders, setSameNumberForFutureOrders] =
    useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [openBuyerProtectionModal, setOpenBuyerProtectionModal] =
    useState(false);
  const [tempAddressForm, setTempAddressForm] = useState({
    country: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    city: "",
  });

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const full = `${tempAddressForm.addressLine1}, ${tempAddressForm.city}, ${tempAddressForm.country}`;
    setUserAddress(full);
    setOpenAddressModal(false);
  };

  const searchParams = useSearchParams();

  const data: ProductData = {
    title: searchParams.get("title") || "",
    brand: searchParams.get("brand") || "",
    size: searchParams.get("size") || "",
    price: Number(searchParams.get("price")) || 0,
    currency: searchParams.get("currency") || "TBH",
    imageUrl: searchParams.get("imageUrl") || "",
    buyerProtectionFee: Number(searchParams.get("buyerProtectionFee")) || 0,
    shippingFee: Number(searchParams.get("shippingFee")) || 0,
  };

  const totalToPay = data.price + data.buyerProtectionFee + data.shippingFee;

  const toastConfig = {
    position: "top-right" as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  useEffect(() => {
    if (!user?.id || hasFetched.current) return;

    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const userData = await getUserAddress(Number(user.id));

        const address = formatUserAddress(userData);
        const googleAddress = getGoogleAddress(userData);

        setUserAddress(address);
        setTempAddressForm((prev) => ({
          ...prev,
          country: prev.country || userData.country || googleAddress?.country || "",
          addressLine1:
            prev.addressLine1 || googleAddress?.street_address || googleAddress?.formatted || "",
          postcode: prev.postcode || googleAddress?.postal_code || "",
          city: prev.city || userData.city || googleAddress?.locality || "",
        }));
      } catch (error) {
        console.error("Failed to load profile data.", error);

        // if API fails and you want retry on next render
        hasFetched.current = false;
      }
    };

    fetchData();
  }, [user?.id]);
  const handlePlaceOrder = async () => {
    try {
      if (isPlacingOrder) return; // prevent double click

      // ❌ validations (same as yours)
      if (!cardDetails) {
        toast.error("Please add card details", toastConfig);
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

      if (deliveryMethod === "home" && !userAddress) {
        toast.error(
          "Your address is missing. Please update your profile.",
          toastConfig,
        );
        return;
      }

      setIsPlacingOrder(true); // 🔥 START LOADING

      const payload = {
        productId: searchParams.get("productId"),
        buyerId: user?.id,
        sellerId: searchParams.get("sellerId"),
        productImage: searchParams.get("imageUrl") || "",
        productPrice: data.price,
        productTitle: searchParams.get("title"),
        deliveryMethod,
        ...(deliveryMethod === "home" && { address: userAddress }),
        ...(deliveryMethod === "pickup" && pickupAddress && { pickupAddress }),
        phoneNumber: deliveryMethod === "home" ? phoneNumber : null,
        SameNumberForFutureOrders,
        buyerProtectionFee: data.buyerProtectionFee,
        shippingFee: data.shippingFee,
        OrderStatus: "placed",
        currencyCode: data.currency,
        total: totalToPay,
        cardDetails: {
          cardName: cardDetails.cardName,
          cardNumber: cardDetails.cardNumber,
          expiry: cardDetails.expiry,
          cvv: cardDetails.cvv,
        },
      };

      const res = await fetch(`${API_BASE_URL}/api/orders/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result?.message || "Failed to place order. Please try again.",
          toastConfig,
        );
        return;
      }

      // If this order is from an accepted offer, mark it as completed
      const offerId = searchParams.get("offerId");
      if (offerId && result?.data?.id) {
        await fetch(`${API_BASE_URL}/api/offers/${offerId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: result.data.id,
            buyerId: user?.id,
          }),
        });
      }

      toast.success("Order placed successfully!", toastConfig);

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        window.location.href = "/Orders";
      }, 2000);
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Something went wrong. Please try again.", toastConfig);
    } finally {
      setIsPlacingOrder(false); // 🔥 STOP LOADING (always runs)
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
                <p className="font-semibold mt-1">
                  TBH {data.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Address Section */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Address</h2>
              <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start border-l-4 border-[#cb6f4d]">
                <div>
                  <p className="font-bold text-gray-800">{user?.username}</p>
                  <p className="text-gray-600 text-sm">
                    {userAddress || "No address on file"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {tempAddressForm.postcode} {tempAddressForm.city}
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
                        TBH {data.shippingFee.toFixed(2)}
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
                      <p className="text-gray-500 text-sm">TBH 16.25</p>
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
                  <h2 className="text-lg font-semibold mb-2">
                    Delivery details
                  </h2>
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
                    <h2 className="text-lg font-semibold mb-2">
                      Delivery details
                    </h2>
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-[#FFCC00] px-1 rounded-sm flex items-center">
                          <span className="text-[10px] font-black text-red-600">
                            DHL
                          </span>
                        </div>
                        <span className="font-medium text-sm">DHL Express</span>
                      </div>
                      <p className="font-semibold text-sm">TBH 16.25</p>
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xs">
                          Home delivery, 2 - 4 business days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Your contact details
                    </h2>
                    <div className="bg-white p-4 rounded-sm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between border border-gray-200 gap-4">
                      <div className="flex items-center flex-1 w-full border-b md:border-b-0 pb-2 md:pb-0 border-gray-100">
                        <input
                          type="tel"
                          placeholder="Enter Phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="flex-1 outline-none text-sm md:text-base text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 cursor-pointer select-none">
                        <label
                          htmlFor="save-number"
                          className="text-[11px] md:text-xs text-gray-500 text-right leading-tight"
                        >
                          <span className="font-bold">
                            Same for future orders
                          </span>
                        </label>
                        <input
                          id="save-number"
                          type="checkbox"
                          checked={SameNumberForFutureOrders}
                          onChange={(e) =>
                            setSameNumberForFutureOrders(e.target.checked)
                          }
                          className="w-5 h-5 accent-[#cb6f4d] rounded border-gray-300 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Payment Section */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Payment</h2>
              <div
                className="bg-white p-4 rounded-sm shadow-sm flex items-center justify-between cursor-pointer border border-gray-200"
                onClick={() => setOpenCardModal(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-gray-100 rounded">
                    <CreditCard className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">Bank card</p>
                    <p className="text-xs text-gray-500">
                      Use a credit or debit card
                    </p>
                    {cardDetails ? (
                      <p className="text-xs text-[#cb6f4d] mt-1 font-medium">
                        •••• •••• ••••{" "}
                        {String(cardDetails.cardNumber).slice(-4)}
                      </p>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center">
                          <div className="flex -space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                            <div className="w-3 h-3 rounded-full bg-orange-500 opacity-80" />
                          </div>
                        </div>
                        <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-blue-800 italic">
                          VISA
                        </div>
                        <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center">
                          <div className="flex -space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                            <div className="w-3 h-3 rounded-full bg-blue-500 opacity-80" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-gray-300" />
              </div>
            </section>
          </div>

          {/* -- Right Column: Price Summary -- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-sm shadow-sm sticky top-8">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-500">
                Price summary
              </h2>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order</span>
                  <span>TBH {data.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-gray-600">
                    <span className="underline decoration-dotted">
                      Buyer Protection fee
                    </span>
                    <button
                      onClick={() => setOpenBuyerProtectionModal(true)}
                      aria-label="Help"
                      className="flex items-center"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </span>
                  <span>TBH {data.buyerProtectionFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>TBH {data.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total to pay</span>
                  <span>TBH {totalToPay.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!cardDetails || isPlacingOrder}
                className="w-full bg-[#cb6f4d] hover:bg-[#a85a3c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors mb-4 flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></span>
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

      {/* -- Modals -- */}
      <CardDetailsModal
        isOpen={openCardModal}
        onClose={() => setOpenCardModal(false)}
        onSave={(card) => setCardDetails(card)}
      />

      <PickupPointModal
        isOpen={openPickupModal}
        onClose={() => setOpenPickupModal(false)}
        onConfirm={(address, lat, lng) => {
          setPickupAddress(address);
          console.log("Pickup coords:", lat, lng);
        }}
      />
      {/* Address Modal */}
      {openAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[95vh]">
            <div className="relative p-4 border-b border-gray-100 flex items-center justify-center">
              <h2 className="text-lg font-medium text-gray-900">Address</h2>
              <button
                type="button"
                onClick={() => setOpenAddressModal(false)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSaveAddress}
              className="p-6 overflow-y-auto space-y-5"
            >
              {[
                { label: "Country", key: "country", required: true },
                {
                  label: "Address line 1",
                  key: "addressLine1",
                  required: true,
                },
                {
                  label: "Address line 2 (optional)",
                  key: "addressLine2",
                  required: false,
                },
                { label: "Postcode", key: "postcode", required: true },
                { label: "City/Town", key: "city", required: true },
              ].map(({ label, key, required }) => (
                <div
                  key={key}
                  className="relative border-b border-gray-200 py-1 focus-within:border-[#cb6f4d] transition-colors"
                >
                  <label className="block text-xs font-normal text-gray-400">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={tempAddressForm[key as keyof typeof tempAddressForm]}
                    onChange={(e) =>
                      setTempAddressForm({
                        ...tempAddressForm,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-none outline-none p-0 text-[15px] text-gray-800 mt-0.5 focus:ring-0"
                    required={required}
                  />
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-[#cb6f4d] hover:bg-[#b05b3b] text-white font-medium py-3 rounded-lg transition-colors text-[15px]"
                >
                  Save address
                </button>
                <button
                  type="button"
                  onClick={() => setOpenAddressModal(false)}
                  className="w-full text-[#cb6f4d] hover:text-[#b05b3b] font-medium py-2 text-center text-[15px] block"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Protection Modal */}
      {openBuyerProtectionModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Close Button Only (as per image layout) */}
        <div className="relative p-4 flex items-center justify-end">
          <button
            onClick={() => setOpenBuyerProtectionModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="px-6 pb-6 overflow-y-auto space-y-6">
          
          {/* Main Top Header */}
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

          {/* Intro Text */}
          <p className="text-gray-600 text-[15px] leading-relaxed text-center">
            For every purchase made with us, we make sure you're covered.
          </p>

          {/* Feature List */}
          <div className="space-y-6 text-[14px] text-gray-600 leading-relaxed">
            
            {/* Section 1: Refund Policy */}
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
                  You have <span className="font-semibold text-gray-900">2 days to submit your claim</span> from when you're notified that an item was delivered, even if the item never arrived. Buyers cover the cost of returning an item unless agreed otherwise. Learn more in our{' '}
                  <button className="text-[#cb6f4d] underline font-medium hover:text-[#b05b3b]">
                    Refund Policy
                  </button>
                  .
                </p>
              </div>
            </div>

            {/* Section 2: Secure Transactions */}
            <div className="flex gap-4 items-start">
              <div className="mt-0.5 p-1 rounded bg-[#fdf0eb]/50">
                <LockIcon className="w-5 h-5 text-[#cb6f4d]" strokeWidth={2} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px]">Secure transactions</h3>
                <p>
                  Your money is held securely throughout the entire transaction. We won't release it to the seller until you receive your order and confirm everything is OK.
                </p>
                <p>
                  Payments are encrypted by our payment partner, so your money is always sent and received safely. <span className="font-semibold text-gray-900">The seller will never see your payment details.</span>
                </p>
              </div>
            </div>

            {/* Section 3: Our Support */}
            <div className="flex gap-4 items-start">
              <div className="mt-0.5 p-1 rounded bg-[#fdf0eb]/50">
                <MessageSquare className="w-5 h-5 text-[#cb6f4d]" strokeWidth={2} />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px]">Our support</h3>
                <p>
                  Reach out to our support team at any time – they're available to assist you with any issues.
                </p>
              </div>
            </div>

          </div>

          {/* Action Button */}
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
