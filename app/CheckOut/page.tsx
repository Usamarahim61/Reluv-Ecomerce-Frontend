"use client";
import React, { useState } from "react";
import { CreditCard, MapPin, Home, ChevronRight, Edit2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import CardDetailsModal from "../components/AddCard";
import PickupPointModal from "../components/PickupPointModal";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const CheckOut: React.FC = () => {
  const { user } = useAuth();
  const userAddress = `${user?.city ?? ""} ${user?.country ?? ""}`.trim();

  const [openCardModal, setOpenCardModal] = useState(false);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "home">("pickup");
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [SameNumberForFutureOrders, setSameNumberForFutureOrders] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");

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

  const handlePlaceOrder = async () => {
    try {
      // ❌ Card validation
      if (!cardDetails) {
        toast.error("Please add card details", toastConfig);
        return;
      }

      // ❌ Pickup address validation
      if (deliveryMethod === "pickup" && !pickupAddress) {
        toast.error("Please select a pick-up point", toastConfig);
        return;
      }

      // ❌ Phone validation for home delivery
      if (deliveryMethod === "home" && !phoneNumber) {
        toast.error("Phone number is required for home delivery", toastConfig);
        return;
      }

      // ❌ Address validation for home delivery
      if (deliveryMethod === "home" && !userAddress) {
        toast.error("Your address is missing. Please update your profile.", toastConfig);
        return;
      }

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
        OrderStatus: "In Progress",
        currencyCode: data.currency,
        total: totalToPay,
        cardDetails: {
          cardName: cardDetails.cardName,
          cardNumber: cardDetails.cardNumber,
          expiry: cardDetails.expiry,
          cvv: cardDetails.cvv,
        },
      };

      console.log("Order Payload:", payload);

      const PLACE_ORDER_ENDPOINT = `${API_BASE_URL}/api/orders/place-order`;
      const res = await fetch(PLACE_ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Failed to place order. Please try again.", toastConfig);
        return;
      }

      toast.success("Order placed successfully!", toastConfig);
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Something went wrong. Please try again.", toastConfig);
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
                <h1 className="font-medium text-gray-900 text-sm md:text-base">{data.title}</h1>
                <p className="text-gray-500 text-sm">{data.brand}</p>
                <p className="text-gray-500 text-sm">{data.size}</p>
                <p className="font-semibold mt-1">TBH {data.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Address Section */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Address</h2>
              <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start border-l-4 border-teal-600">
                <div>
                  <p className="font-bold text-gray-800">{user?.username}</p>
                  <p className="text-gray-600 text-sm">
                    {userAddress || "No address on file"}
                  </p>
                  <p className="text-gray-600 text-sm">47330, Traspinedo</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
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
                      ? "border-teal-600"
                      : "border-transparent shadow-sm"
                  }`}
                  onClick={() => setDeliveryMethod("pickup")}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-500" />
                    <div>
                      <p className="font-medium">Ship to pick-up point</p>
                      <p className="text-gray-500 text-sm">TBH {data.shippingFee.toFixed(2)}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="w-5 h-5 accent-teal-600"
                  />
                </label>

                {/* Home */}
                <label
                  className={`flex items-center justify-between p-4 bg-white border-2 rounded-sm cursor-pointer transition-all ${
                    deliveryMethod === "home"
                      ? "border-teal-600"
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
                    className="w-5 h-5 accent-teal-600"
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
                    className="bg-white p-4 rounded-sm shadow-sm flex items-center justify-between border border-gray-200 cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    {pickupAddress ? (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-teal-600 shrink-0" />
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
                      <p className="font-semibold text-sm">TBH 16.25</p>
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
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
                          <span className="font-bold">Same for future orders</span>
                        </label>
                        <input
                          id="save-number"
                          type="checkbox"
                          checked={SameNumberForFutureOrders}
                          onChange={(e) => setSameNumberForFutureOrders(e.target.checked)}
                          className="w-5 h-5 accent-[#007782] rounded border-gray-300 cursor-pointer"
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
                    <p className="text-xs text-gray-500">Use a credit or debit card</p>
                    {cardDetails ? (
                      <p className="text-xs text-teal-600 mt-1 font-medium">
                        •••• •••• •••• {String(cardDetails.cardNumber).slice(-4)}
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

          {/* ── Right Column: Price Summary ── */}
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
                  <span className="text-gray-600 underline decoration-dotted">
                    Buyer Protection fee
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
                disabled={!cardDetails}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors mb-4"
              >
                Pay
              </button>

              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 uppercase tracking-tight">
                <span className="mb-0.5">🔒</span> Your payment details are encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
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
    </>
  );
};

export default CheckOut;