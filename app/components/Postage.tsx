"use client";
import { useAuth } from "@/context/AuthContext";
import { getUserAddress } from "@/services/auth-service";
import {
  Info,
  Home,
  MapPin,
  Edit2,
  X,
  Check,
  Truck,
  Package,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../constants/api";
import PickupPointModal from "./PickupPointModal";

interface AddressForm {
  // country: string;
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
      // {
      //   id: "dropoff-locker",
      //   label: "Smart Locker",
      //   description: "24/7 locker drop-off available",
      //   price: "£2.99",
      //   carrier: "Amazon Locker",
      //   enabled: false,
      // },
    ],
  },
];

export default function Postage() {
  const { user } = useAuth();
  const hasFetched = useRef(false);

  const [savedAddress, setSavedAddress] = useState<AddressForm>({
    // country: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    city: "",
  });
  const [tempAddressForm, setTempAddressForm] = useState<AddressForm>({
    // country: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    city: "",
  });
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);

  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [shippingSections, setShippingSections] = useState<ShippingSection[]>(
    defaultShippingSections,
  );
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({ "from-address": true, "drop-off": true });

  const [isSavingAll, setIsSavingAll] = useState(false);

  // ── Hydrate Preferences on Mount with Toaster Loading ──────────────────────
  useEffect(() => {
    if (!user?.id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await getUserAddress(Number(user.id));

        const fetchedAddress: AddressForm = {
          // country: userData.country ?? "",
          addressLine1: userData.addressLine1 ?? "",
          addressLine2: userData.addressLine2 ?? "",
          postcode: userData.postcode ?? "",
          city: userData.city ?? "",
        };
        setSavedAddress(fetchedAddress);
        setTempAddressForm(fetchedAddress);

        if (userData.pickupAddress) {
          setPickupAddress(userData.pickupAddress);
        }

        if (userData.shippingSettings) {
          const settings = userData.shippingSettings;
          setShippingSections((prevSections) =>
            prevSections.map((section) => {
              if (
                section.id === "from-address" &&
                settings.fromAddressOptions
              ) {
                return {
                  ...section,
                  options: section.options.map((o) => ({
                    ...o,
                    enabled: settings.fromAddressOptions[o.id] ?? o.enabled,
                  })),
                };
              }
              if (section.id === "drop-off" && settings.dropOffOptions) {
                return {
                  ...section,
                  options: section.options.map((o) => ({
                    ...o,
                    enabled: settings.dropOffOptions[o.id] ?? o.enabled,
                  })),
                };
              }
              return section;
            }),
          );
        }
        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to load profile postage components config layer",
          error,
        );
        hasFetched.current = false;
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleOpenModal = () => {
    setTempAddressForm({ ...savedAddress });
    setAddressSuccess(false);
    setOpenAddressModal(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAddress({ ...tempAddressForm });
    setAddressSuccess(true);
    setTimeout(() => {
      setOpenAddressModal(false);
      setAddressSuccess(false);
    }, 600);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setVisibleSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // ── Save Settings Configuration Processing Layer ───────────────────────────
  const handleSaveAllSettings = async () => {
    setIsSavingAll(true);
    const saveToastId = toast.loading("Saving changes…");

    try {
      const homeSection = shippingSections.find((s) => s.id === "from-address");
      const dropOffSection = shippingSections.find((s) => s.id === "drop-off");

      const fromAddressMap: Record<string, boolean> = {};
      homeSection?.options.forEach((opt) => {
        fromAddressMap[opt.id] = opt.enabled;
      });

      const dropOffMap: Record<string, boolean> = {};
      dropOffSection?.options.forEach((opt) => {
        dropOffMap[opt.id] = opt.enabled;
      });

      const finalPayload = {
        // country: savedAddress.country,
        addressLine1: savedAddress.addressLine1,
        addressLine2: savedAddress.addressLine2,
        postcode: savedAddress.postcode,
        city: savedAddress.city,
        pickupAddress: pickupAddress || null,
        shippingSettings: {
          fromAddressOptions: fromAddressMap,
          dropOffOptions: dropOffMap,
        },
      };

      await updateUserSettingsAndPostage(Number(user?.id), finalPayload);

      toast.update(saveToastId, {
        render: "All adjustments successfully saved!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Failed to save configuration profile updates", error);
      toast.update(saveToastId, {
        render: "Update failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  const displayAddress = () => {
    const parts = [
      savedAddress.addressLine1,
      savedAddress.addressLine2,
      savedAddress.city,
      savedAddress.postcode,
      // savedAddress.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address on file";
  };

  const toggleOption = (sectionId: string, optionId: string) => {
    setShippingSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              options: section.options.map((opt) =>
                opt.id === optionId ? { ...opt, enabled: !opt.enabled } : opt,
              ),
            }
          : section,
      ),
    );
  };
    if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#cb6f4d]" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 bg-white pb-12">
        <section>
          <h2 className="text-lg font-semibold mb-2">From Address</h2>
          <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start border-l-4 border-l-[#cb6f4d] border border-gray-100">
            <div>
              <p className="font-bold text-gray-800">{user?.username}</p>
              <p className="text-gray-600 text-sm">{displayAddress()}</p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleOpenModal}
            >
              <Edit2 size={18} />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">drop off Point</h2>
          {pickupAddress ? (
            <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start border-l-4 border-l-[#cb6f4d] border border-gray-100">
              <div>
                <p className="font-bold text-gray-800">
                  Selected Pickup Location
                </p>
                <p className="text-gray-600 text-sm">{pickupAddress}</p>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setOpenPickupModal(true)}
              >
                <Edit2 size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpenPickupModal(true)}
              className="w-full flex gap-3 items-center justify-between p-4 bg-blue-50/60 hover:bg-blue-55 border-l-4 border-blue-400 rounded-r-lg group text-left"
            >
              <span className="text-gray-900 text-sm md:text-base font-medium">
                Choose a pick-up point
              </span>
              <span className="text-2xl font-light text-[#cb6f4d] group-hover:scale-110 transition-transform pr-1">
                +
              </span>
            </button>
          )}
        </section>

        {/* <div className="flex gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="mt-0.5 shrink-0">
            <Info className="w-5 h-5 text-[#cb6f4d]" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Disabling shipping options may reduce sales.{" "}
            <a href="#" className="text-[#cb6f4d] underline">
              Learn more.
            </a>
          </p>
        </div> */}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Shipping as a seller
          </h2>
          {shippingSections.map((section) => {
            const isExpanded = visibleSections[section.id];
            return (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs"
              >
                <div
                  onClick={() => toggleSectionVisibility(section.id)}
                  className="w-full flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-gray-50 border border-gray-100 rounded-full">
                      {section.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {section.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 pl-2">
                    {isExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="divide-y divide-gray-100 bg-white">
                    {section.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-55/30"
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOption(section.id, option.id);
                          }}
                          className={`shrink-0 ${option.enabled ? "text-[#cb6f4d]" : "text-gray-300"}`}
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

        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSaveAllSettings}
            disabled={isSavingAll}
            className="px-8 bg-[#cb6f4d] hover:bg-[#b05b3b] text-white font-medium py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isSavingAll ? "Saving Changes…" : "Save Settings"}
          </button>
        </div>
      </div>

      {openAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[400px] bg-white rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-medium text-gray-900 text-center">
              Edit Address
            </h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {(
                [
                  // { label: "Country", key: "country" },
                  { label: "Address line 1", key: "addressLine1" },
                  { label: "Address line 2 (optional)", key: "addressLine2" },
                  { label: "Postcode", key: "postcode" },
                  { label: "City / Town", key: "city" },
                ] as const
              ).map(({ label, key }) => (
                <div
                  key={key}
                  className="border-b border-gray-200 py-1 focus-within:border-[#cb6f4d] transition-colors"
                >
                  <label className="block text-xs text-gray-400">{label}</label>
                  <input
                    type="text"
                    value={tempAddressForm[key]}
                    onChange={(e) =>
                      setTempAddressForm({
                        ...tempAddressForm,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full bg-transparent outline-none mt-0.5 text-gray-800 text-[15px]"
                    required={key !== "addressLine2"}
                  />
                </div>
              ))}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-[#cb6f4d] hover:bg-[#b05b3b] transition-colors text-white py-3 rounded-lg"
                >
                  {addressSuccess ? "Done" : "Apply Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenAddressModal(false)}
                  className="w-full text-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PickupPointModal
        isOpen={openPickupModal}
        onClose={() => setOpenPickupModal(false)}
        onConfirm={(address) => {
          setPickupAddress(address);
          setOpenPickupModal(false);
        }}
      />
    </>
  );
}

async function updateUserSettingsAndPostage(
  userId: number,
  payload: {
    // country: string;
    addressLine1: string;
    addressLine2: string;
    postcode: string;
    city: string;
    pickupAddress: string | null;
    shippingSettings: {
      fromAddressOptions: Record<string, boolean>;
      dropOffOptions: Record<string, boolean>;
    };
  },
) {
  const storedJwt = localStorage.getItem("jwt");
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedJwt}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      "Could not sync complete schema elements to backend profile dataset",
    );
  }
}
