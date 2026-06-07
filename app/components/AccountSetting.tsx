"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  getUser,
  AccountUpdate,
  loginWithGoogle,
} from "@/services/auth-service";
import ChangePasswordModal from "../components/ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import PhoneField from "../components/PhoneField";
import { toast } from "react-toastify";
import { BACKEND_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID } from "@/constants";

const GOOGLE_CLIENT_ID = NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const API = BACKEND_URL ?? "";
function openPopup(url: string, title: string) {
  const w = 500,
    h = 600;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  return window.open(
    url,
    title,
    `width=${w},height=${h},left=${left},top=${top}`,
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
export default function AccountSetting() {
  const { user } = useAuth();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isUnlinkingGoogle, setIsUnlinkingGoogle] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    fullName?: string;
    gender?: string;
    birthday?: string;
  }>({});

  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    fullName: "",
    gender: "",
    birthday: "",
    holidayMode: false,
    facebookLinked: false,
    googleLinked: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id || hasFetched.current) return;
      hasFetched.current = true;
      try {
        setLoading(true);
        const data: any = await getUser(Number(user.id));
        setFormData({
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          fullName: data.fullName || "",
          gender: data.gender || "",
          birthday: data.birthday || "",
          holidayMode: data.holidayMode || false,
          facebookLinked: data.facebookLinked || false,
          googleLinked: data.googleLinked || false,
        });
      } catch (error) {
        hasFetched.current = false;
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user?.id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: typeof errors = {};
    if (!formData.fullName.trim())
      nextErrors.fullName = "Full name is required.";
    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\+\d{7,15}$/.test(formData.phoneNumber)) {
      nextErrors.phoneNumber = "Please enter a valid phone number.";
    }
    if (!formData.gender) nextErrors.gender = "Gender is required.";
    if (!formData.birthday) nextErrors.birthday = "Birthday is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !validateForm()) return;

    const toastId = toast.loading("Saving changes…");
    setIsSubmitting(true);
    try {
      await AccountUpdate(Number(user.id), {
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        gender: formData.gender,
        birthday: formData.birthday,
        holidayMode: formData.holidayMode,
      });
      toast.update(toastId, {
        render: "Profile updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Update failed", error);
      toast.update(toastId, {
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
      setIsSubmitting(false);
    }
  };

  // ── Link Google ───────────────────────────────────────────────
  // Opens the same popup as SignUpLogin. The /api/auth/google controller
  // matches by email → finds the existing user → sets googleLinked=true.
  // No separate "link" endpoint needed.
  const handleLinkGoogle = useCallback(() => {
    if (!user?.id) return;
    setIsLinkingGoogle(true);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback/google`,
      response_type: "token",
      scope: "openid email profile address phone",
      prompt: "select_account",
    });

    const popup = openPopup(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      "Link Google Account",
    );

    if (!popup) {
      toast.error(
        "Popup blocked. Please allow popups for this site and try again.",
      );
      setIsLinkingGoogle(false);
      return;
    }

    const toastId = toast.loading("Waiting for Google…");

    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "GOOGLE_AUTH_SUCCESS") return;
      window.removeEventListener("message", handler);
      clearInterval(poll);
      try {
        // POST /api/auth/google with the access token.
        // Controller finds user by email → updates googleLinked=true + google fields.
        await loginWithGoogle(event.data.token);
        handleChange("googleLinked", true);
        popup.close();
        toast.update(toastId, {
          render: "Google linked successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err: any) {
        toast.update(toastId, {
          render: err?.message || "Failed to link Google. Try again.",
          type: "error",
          isLoading: false,
          autoClose: 4000,
          closeOnClick: true,
        });
      } finally {
        setIsLinkingGoogle(false);
      }
    };

    window.addEventListener("message", handler);

    // If user closes the popup manually
    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", handler);
        setIsLinkingGoogle(false);
        toast.dismiss(toastId);
      }
    }, 500);
  }, [user?.id]);

  // ── Unlink Google ─────────────────────────────────────────────
  const handleUnlinkGoogle = () => {
    if (!user?.id) return;
    setShowPasswordModal(true);
  };

  const doUnlinkGoogle = async (newPassword: string) => {
    setIsUnlinkingGoogle(true);
    const toastId = toast.loading("Unlinking Google…");
    try {
      const res = await fetch(`${API}/api/auth/google/unlink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message || "Unlink failed.");
      }
      handleChange("googleLinked", false);
      toast.update(toastId, {
        render: "Google unlinked successfully.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message || "Failed to unlink Google.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsUnlinkingGoogle(false);
    }
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
      {showPasswordModal && (
        <ChangePasswordModal
          email={formData.email}
          onClose={() => {
            setShowPasswordModal(false);
            setIsUnlinkingGoogle(false);
          }}
          onSuccess={async (newPassword: string) => {
            setShowPasswordModal(false);
            toast.success("Password changed successfully!", {
              position: "top-right",
              autoClose: 3000,
              closeOnClick: true,
            });
            await doUnlinkGoogle(newPassword); // ← pass password through
          }}
          onError={() =>
            toast.error("Password change failed. Try again.", {
              position: "top-right",
              autoClose: 3000,
              closeOnClick: true,
            })
          }
        />
      )}
      {showEmailModal && (
        <ChangeEmailModal
          email={formData.email}
          onClose={() => setShowEmailModal(false)}
          onEmailChanged={(newEmail: string) => {
            handleChange("email", newEmail);
            toast.success("Email updated successfully!", {
              position: "top-right",
              autoClose: 3000,
              closeOnClick: true,
            });
          }}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-6 animate-fadeIn"
      >
        {/* Email & Phone */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {formData.email}
              </p>
              <p className="text-xs text-[#cb6f4d] font-medium flex items-center gap-1 mt-1">
                Verified Account <span className="p-0.5">✓</span>
              </p>
            </div>
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-2 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all"
              onClick={() => setShowEmailModal(true)}
            >
              Change Email
            </button>
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-t border-[#cb6f4d] pt-6 gap-2">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-700">Phone number</span>
              {errors.phoneNumber && (
                <span className="text-sm text-red-500">
                  {errors.phoneNumber}
                </span>
              )}
            </div>
            <div className="w-full sm:max-w-[280px]">
              <PhoneField
                value={formData.phoneNumber}
                onChange={(val) => handleChange("phoneNumber", val)}
                hasError={!!errors.phoneNumber}
              />
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-[#cb6f4d] text-xs font-bold uppercase tracking-wider">
            Identity Details
          </h3>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-50 pb-6 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Full name</label>
              {errors.fullName && (
                <span className="text-sm text-red-500">{errors.fullName}</span>
              )}
            </div>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Your full name"
              className={`w-full sm:max-w-[300px] border p-3 rounded-lg focus:outline-[#cb6f4d] text-gray-600 font-medium ${errors.fullName ? "border-red-500" : "border-[#cb6f4d]"}`}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-50 pb-6 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Gender</label>
              {errors.gender && (
                <span className="text-sm text-red-500">{errors.gender}</span>
              )}
            </div>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className={`cs-select ${errors.gender ? "border-red-500" : ""}`}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Birthday</label>
              {errors.birthday && (
                <span className="text-sm text-red-500">{errors.birthday}</span>
              )}
            </div>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange("birthday", e.target.value)}
              className={`w-full sm:w-auto text-gray-600 sm:bg-transparent p-3 sm:p-0 rounded-lg focus:outline-[#cb6f4d] font-medium sm:text-right ${errors.birthday ? "border border-red-500" : ""}`}
            />
          </div>
        </div>

        {/* Holiday Mode */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 flex justify-between items-center shadow-sm">
          <div>
            <span className="font-semibold text-gray-900">Holiday mode</span>
            <p className="text-xs text-gray-400">
              Hide your items while you're away.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.holidayMode}
              onChange={() =>
                handleChange("holidayMode", !formData.holidayMode)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[#cb6f4d] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Social Links
          </h3>

          {/* Facebook */}
          <div className="flex justify-between items-center border-b border-gray-50 pb-6">
            <span className="font-semibold text-gray-900">Facebook</span>
            <button
              type="button"
              className="px-6 py-1.5 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all"
            >
              {formData.facebookLinked ? "Linked" : "Link"}
            </button>
          </div>

          {/* Google */}
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-900">Google</span>
              {formData.googleLinked ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  Unlink to use email & password only
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">
                  Link your Google account for faster sign-in
                </p>
              )}
            </div>
            {formData.googleLinked ? (
              <button
                type="button"
                disabled={isUnlinkingGoogle}
                onClick={handleUnlinkGoogle}
                className="px-6 py-1.5 border-2 border-[#cb6f4d] cursor-pointer text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnlinkingGoogle ? "Unlinking…" : "Unlink"}
              </button>
            ) : (
              <button
                type="button"
                disabled={isLinkingGoogle}
                onClick={handleLinkGoogle}
                className="px-6 py-1.5 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinkingGoogle ? "Linking…" : "Link"}
              </button>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <span className="font-semibold text-gray-900">
            Password & Security
          </span>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full sm:w-auto px-6 py-2 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all cursor-pointer"
          >
            Change Password
          </button>
        </div>

        {/* Save */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
          <p className="text-xs text-gray-400 italic order-2 sm:order-1">
            Remember to save your changes before leaving.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2 bg-[#cb6f4d] text-white px-12 py-3 rounded-lg font-bold shadow-md hover:bg-[#b55d3e] transition-all disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
