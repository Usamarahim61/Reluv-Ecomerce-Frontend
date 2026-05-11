"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUser, AccountUpdate } from "@/services/auth-service";

export default function AccountSetting() {
   const { user } = useAuth();

  const [loading, setLoading] = useState(false);
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
      if (!user?.id) return;

      try {
        setLoading(true);
        const data: any= await getUser(Number(user.id));
        setFormData({
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          fullName: data.fullName || "",
          gender: data.gender || "",
          birthday: data.birthday || "",
          holidayMode: data.holidayMode || false,
          facebookLinked: data.facebook,
          googleLinked: data.google,
        });
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();

    if (!user?.id) return;

    try {
      setLoading(true);

    const payload = {
      // email: formData.email,
      phoneNumber: formData.phoneNumber,
      fullName: formData.fullName,
      gender: formData.gender,
      birthday: formData.birthday,
      holidayMode: formData.holidayMode,
      // facebook: formData.facebookLinked,
      // google: formData.googleLinked,
    };

    console.log("Payload:", payload);
     await AccountUpdate(Number(user?.id), payload);

      console.log("Profile Updated ✅");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

    /* ---------------- LOADING UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-teal-600" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-4 space-y-4 bg-gray-50"
    >
      {/* Email & Phone Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-gray-900">
              {formData.email}
            </p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              Verified <span>✓</span>
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-1 border border-[#cb6f4d] text-[#cb6f4d] rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Change
          </button>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <span className="font-medium text-gray-900">
            Phone number
          </span>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) =>
              handleChange("phoneNumber", e.target.value)
            }
            className="bg-gray-50 p-2 focus:outline-none text-gray-600"
            placeholder="Enter phone"
          />
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b pb-4">
          <label className="font-medium text-gray-700">
            Full name
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              handleChange("fullName", e.target.value)
            }
            className="bg-gray-50 p-3 focus:outline-none text-gray-600"
          />
        </div>

        <div className="flex justify-between items-center border-b pb-4">
          <label className="font-medium text-gray-700">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) =>
              handleChange("gender", e.target.value)
            }
            className="text-gray-500 bg-transparent focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">
            Birthday
          </label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) =>
              handleChange("birthday", e.target.value)
            }
            className="text-gray-500 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Holiday Mode */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
        <span className="font-medium text-gray-900">
          Holiday mode
        </span>
        <input
          type="checkbox"
          checked={formData.holidayMode}
          onChange={() =>
            handleChange(
              "holidayMode",
              !formData.holidayMode
            )
          }
          className="w-5 h-5"
        />
      </div>

      {/* Linked Accounts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="font-medium text-gray-900">
            Facebook
          </span>
          <button
            type="button"
            className="px-4 py-1 border border-[#cb6f4d] text-[#cb6f4d] rounded-md text-sm font-medium"
          >
            {formData.facebookLinked
              ? "Linked"
              : "Link"}
          </button>
        </div>

            <div className="flex justify-between items-center border-b pb-4">
          <span className="font-medium text-gray-900">
            Google
          </span>
          <button
            type="button"
            className="px-4 py-1 border border-[#cb6f4d] text-[#cb6f4d] rounded-md text-sm font-medium"
          >
            {formData.googleLinked
              ? "Linked"
              : "Link"}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
        <span className="font-medium text-gray-900">
          Change password
        </span>
        <button
          type="button"
          className="px-4 py-1 border border-[#cb6f4d] text-[#cb6f4d] rounded-md text-sm font-medium"
        >
          Change
        </button>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#cb6f4d] text-white px-8 py-2 rounded font-medium hover:bg-[#005f68] transition-colors"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
