"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { getUser, AccountUpdate } from "@/services/auth-service";
import ChangePasswordModal from "../components/ChangePasswordModal"; // adjust path as needed
import ChangeEmailModal from "./ChangeEmailModal";

export default function AccountSetting() {
  const { user } = useAuth();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // ← NEW
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
          facebookLinked: data.facebook,
          googleLinked: data.googleLinked,
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

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    }
    if (!formData.gender) {
      nextErrors.gender = "Gender is required.";
    }
    if (!formData.birthday) {
      nextErrors.birthday = "Birthday is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        gender: formData.gender,
        birthday: formData.birthday,
        holidayMode: formData.holidayMode,
      };

      await AccountUpdate(Number(user?.id), payload);
      console.log("Profile Updated ✅");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- LOADING UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#cb6f4d]" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <ChangePasswordModal
          email={formData.email}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {showEmailModal && (
        <ChangeEmailModal
          email={formData.email}
          onClose={() => setShowEmailModal(false)}
          onEmailChanged={(newEmail: string) => handleChange("email", newEmail)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-6 animate-fadeIn"
      >
        {/* Email & Phone Section */}
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

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-t border-[#cb6f4d] pt-6 gap-2">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-700">Phone number</span>
              {errors.phoneNumber && (
                <span className="text-sm text-red-500">{errors.phoneNumber}</span>
              )}
            </div>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className={`w-full sm:max-w-[250px] border p-3 rounded-lg focus:outline-[#cb6f4d] text-gray-600 font-medium ${errors.phoneNumber ? "border-red-500" : "border-[#cb6f4d]"}`}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        {/* Personal Info Section */}
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
              required
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
              required
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
              required
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

        {/* Linked Accounts */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Social Links
          </h3>

          <div className="flex justify-between items-center border-b border-gray-50 pb-6">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">Facebook</span>
            </div>
            <button
              type="button"
              className="px-6 py-1.5 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all"
            >
              {formData.facebookLinked ? "Linked" : "Link"}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Google</span>
            <button
              type="button"
              className="px-6 py-1.5 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all"
            >
              {formData.googleLinked ? "Linked" : "Link"}
            </button>
          </div>
        </div>

        {/* Security — opens modal on click */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <span className="font-semibold text-gray-900">
            Password & Security
          </span>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)} // ← WIRED HERE
            className="w-full sm:w-auto px-6 py-2 border-2 border-[#cb6f4d] text-[#cb6f4d] rounded-lg text-sm font-bold hover:bg-[#fef5f1] transition-all cursor-pointer"
          >
            Change Password
          </button>
        </div>

        {/* Save Button */}
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
