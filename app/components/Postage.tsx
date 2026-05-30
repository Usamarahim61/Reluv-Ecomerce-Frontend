"use client";
import { useAuth } from "@/context/AuthContext";
import { getUserAddress } from "@/services/auth-service";
import {
  Plus,
  Info,
  Home,
  MapPin,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Check,
  Truck,
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../constants/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressForm {
  country: string;
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  city: string;
}

interface ShippingOption {
  id: string;
  label: string;
  description: string;
  price: string;
  carrier: string;
  enabled: boolean;
}

interface ShippingSection {
  id: "from-address" | "drop-off";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: ShippingOption[];
}

// ─── Default shipping options ─────────────────────────────────────────────────

const defaultShippingSections: ShippingSection[] = [
  {
    id: "from-address",
    title: "From your address",
    subtitle: "A courier collects the order from you.",
    icon: <Home className="w-5 h-5 text-gray-600" />,
    options: [
      {
        id: "home-standard",
        label: "Standard Collection",
        description: "Collected within 2–3 business days",
        price: "£3.99",
        carrier: "Royal Mail",
        enabled: true,
      },
      {
        id: "home-express",
        label: "Express Collection",
        description: "Next-day collection available",
        price: "£6.99",
        carrier: "DPD",
        enabled: true,
      },
      {
        id: "home-economy",
        label: "Economy Collection",
        description: "Collected within 5–7 business days",
        price: "£1.99",
        carrier: "Hermes",
        enabled: false,
      },
    ],
  },
  {
    id: "drop-off",
    title: "From a drop-off point",
    subtitle: "You take the order to a location like a locker or parcel shop.",
    icon: <MapPin className="w-5 h-5 text-gray-600" />,
    options: [
      {
        id: "dropoff-parcel",
        label: "Parcel Shop Drop-off",
        description: "Drop off at a nearby store or locker",
        price: "£2.49",
        carrier: "InPost",
        enabled: true,
      },
      {
        id: "dropoff-locker",
        label: "Smart Locker",
        description: "24/7 locker drop-off available",
        price: "£2.99",
        carrier: "Amazon Locker",
        enabled: false,
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Postage() {
  const { user } = useAuth();
  const hasFetched = useRef(false);

  // Address state
  const [savedAddress, setSavedAddress] = useState<AddressForm>({
    country: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    city: "",
  });
  const [tempAddressForm, setTempAddressForm] = useState<AddressForm>({
    country: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    city: "",
  });
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuccess, setAddressSuccess] = useState(false);

  // Shipping sections state
  const [shippingSections, setShippingSections] = useState<ShippingSection[]>(
    defaultShippingSections
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "from-address": false,
    "drop-off": false,
  });

  // ── Fetch address on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const userData = await getUserAddress(Number(user.id));
        const fetched: AddressForm = {
          country: userData.country ?? "",
          addressLine1: userData.addressLine1 ?? "",
          addressLine2: userData.addressLine2 ?? "",
          postcode: userData.postcode ?? "",
          city: userData.city ?? "",
        };
        setSavedAddress(fetched);
        setTempAddressForm(fetched);
      } catch (error) {
        console.error("Failed to load address.", error);
        hasFetched.current = false;
      }
    };

    fetchData();
  }, [user?.id]);

  // ── Open modal: populate temp form with current saved values ───────────────
  const handleOpenModal = () => {
    setTempAddressForm({ ...savedAddress });
    setAddressError(null);
    setAddressSuccess(false);
    setOpenAddressModal(true);
  };

  // ── Save address ───────────────────────────────────────────────────────────
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError(null);

    try {
      // Call API to persist the address to the user's account
      await updateUserAddress(Number(user?.id), tempAddressForm);
      setSavedAddress({ ...tempAddressForm });
      setAddressSuccess(true);
      setTimeout(() => {
        setOpenAddressModal(false);
        setAddressSuccess(false);
      }, 800);
    } catch (error) {
      console.error("Failed to save address.", error);
      setAddressError("Failed to save address. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  // ── Display helper ─────────────────────────────────────────────────────────
  const displayAddress = () => {
    const parts = [
      savedAddress.addressLine1,
      savedAddress.addressLine2,
      savedAddress.city,
      savedAddress.postcode,
      savedAddress.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address on file";
  };

  // ── Toggle shipping section expand ────────────────────────────────────────
  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Toggle individual shipping option ─────────────────────────────────────
  const toggleOption = (sectionId: string, optionId: string) => {
    setShippingSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              options: section.options.map((opt) =>
                opt.id === optionId ? { ...opt, enabled: !opt.enabled } : opt
              ),
            }
          : section
      )
    );
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const enabledCount = (section: ShippingSection) =>
    section.options.filter((o) => o.enabled).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 bg-white">
        {/* ── Address Section ── */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Address</h2>
          <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start border-l-4 border-[#cb6f4d]">
            <div>
              <p className="font-bold text-gray-800">{user?.username}</p>
              <p className="text-gray-600 text-sm">{displayAddress()}</p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleOpenModal}
              aria-label="Edit address"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </section>

        {/* ── Info Banner ── */}
        <div className="flex gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="mt-0.5 shrink-0">
            <Info className="w-5 h-5 text-[#cb6f4d]" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Disabling shipping options may reduce sales. If a member can only
            buy from you with a disabled option, we may still offer it.{" "}
            <a
              href="#"
              className="text-[#cb6f4d] underline hover:text-[#b05b3b]"
            >
              Learn more about disabled options.
            </a>
          </p>
        </div>

        {/* ── Shipping Sections ── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping as a seller
            </h2>
            <p className="text-sm text-gray-500">
              Choose which options you'd like to use for each shipping type.
            </p>
          </div>

          {shippingSections.map((section) => {
            const isOpen = expandedSections[section.id];
            const active = enabledCount(section);

            return (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-gray-50 rounded-full shrink-0">
                      {section.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {section.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {section.subtitle}
                      </p>
                      <p className="text-xs text-[#cb6f4d] mt-0.5">
                        {active} of {section.options.length} option
                        {section.options.length !== 1 ? "s" : ""} enabled
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Options list */}
                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {section.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between px-4 py-3 bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {option.id.startsWith("home") ? (
                              <Truck className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {option.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {option.carrier} · {option.price}
                            </p>
                          </div>
                        </div>

                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleOption(section.id, option.id)}
                          className={`shrink-0 transition-colors ${
                            option.enabled
                              ? "text-[#cb6f4d]"
                              : "text-gray-300"
                          }`}
                          aria-label={`${option.enabled ? "Disable" : "Enable"} ${option.label}`}
                        >
                          {option.enabled ? (
                            <ToggleRight className="w-8 h-8" />
                          ) : (
                            <ToggleLeft className="w-8 h-8" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="space-y-1 pt-4">
          <p className="text-xs text-gray-500">
            Some shipping options are enabled for all sellers on our platform
            and can't be turned off.
          </p>
          <span>
            <a
              href="#"
              className="text-xs text-[#cb6f4d] underline hover:text-[#b05b3b]"
            >
              See compensation information
            </a>
            <span className="text-xs text-gray-500">
              {" "}
              for sellers using integrated shipping.
            </span>
          </span>
        </div>
      </div>

      {/* ── Address Modal ── */}
      {openAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[95vh]">
            {/* Modal header */}
            <div className="relative p-4 border-b border-gray-100 flex items-center justify-center">
              <h2 className="text-lg font-medium text-gray-900">
                Edit Address
              </h2>
              <button
                type="button"
                onClick={() => setOpenAddressModal(false)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleSaveAddress}
              className="p-6 overflow-y-auto space-y-5"
            >
              {(
                [
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
                  { label: "City / Town", key: "city", required: true },
                ] as { label: string; key: keyof AddressForm; required: boolean }[]
              ).map(({ label, key, required }) => (
                <div
                  key={key}
                  className="relative border-b border-gray-200 py-1 focus-within:border-[#cb6f4d] transition-colors"
                >
                  <label className="block text-xs font-normal text-gray-400">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={tempAddressForm[key]}
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

              {/* Error message */}
              {addressError && (
                <p className="text-sm text-red-500">{addressError}</p>
              )}

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="w-full bg-[#cb6f4d] hover:bg-[#b05b3b] disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors text-[15px] flex items-center justify-center gap-2"
                >
                  {addressSaving ? (
                    "Saving…"
                  ) : addressSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Saved!
                    </>
                  ) : (
                    "Save address"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenAddressModal(false)}
                  className="w-full text-[#cb6f4d] hover:text-[#b05b3b] font-medium py-2 text-center text-[15px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

async function updateUserAddress(userId: number, tempAddressForm: AddressForm) {
    const storedJwt = localStorage.getItem("jwt"); // adjust to however you store the JWT
       const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
         method: "PUT",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${storedJwt}`,
         },
         body: JSON.stringify({ city: tempAddressForm.city, country: tempAddressForm.country }),
       });
}
