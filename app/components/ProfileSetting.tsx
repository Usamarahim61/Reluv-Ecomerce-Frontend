"use client";

import { useAuth } from "@/context/AuthContext";
import {
  getUser,
  getUserAvatr,
  updateUserProfile,
} from "@/services/auth-service";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../constants/api";

const MAX_AVATAR_SIZE_MB = 10;

/* ---------------- UTILITY ---------------- */

const renameFile = (file: File): File => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop();
  const newName = `avatar_${timestamp}_${random}.${ext}`;
  return new File([file], newName, { type: file.type });
};

export default function ProfileSetting() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);
  const hasFetched = useRef(false);

  const [formData, setFormData] = useState({
    username: "",
    about: "",
    country: "",
    city: "",
    showCity: true,
    language: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countries = ["Thailand", "Cambodia", "Laos", "Vietnam", "Myanmar"];

  const cityByCountry: { [key: string]: string[] } = {
    Thailand: [
      "Bangkok", "Chiang Mai", "Phuket", "Pattaya",
      "Rayong", "Chiang Rai", "Khon Kaen", "Udon Thani",
    ],
    Cambodia: ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kompong Cham"],
    Laos: ["Vientiane", "Luang Prabang", "Savannakhet", "Pakse", "Vang Vieng"],
    Vietnam: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Ha Long", "Ho Tay"],
    Myanmar: ["Yangon", "Mandalay", "Naypyidaw", "Bagan", "Inle Lake"],
  };

  const cities = formData.country ? cityByCountry[formData.country] : [];
  const languages = ["en", "th"];

  /* ---------------- FETCH USER DATA (fires once) ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        const data = await getUser(Number(user.id));
        const userAvatar = await getUserAvatr(Number(user.id));

        setFormData({
          username: data.username || "",
          about: data.about || "",
          country: data.country || "",
          city: data.city || "",
          showCity: data.isShowCity ?? true,
          language: data.language || "",
        });

        if (userAvatar.avatar?.url) {
          setAvatarPreview(userAvatar.avatar.url);
          avatarPreviewRef.current = userAvatar.avatar.url;
        }
      } catch {
        hasFetched.current = false;
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  /* ---------------- INPUT HANDLER ---------------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "country") updated.city = "";
      return updated;
    });
  };

  /* ---------------- PHOTO HANDLER ---------------- */

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.warn(`"${file.name}" exceeds the ${MAX_AVATAR_SIZE_MB}MB size limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (avatarPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    avatarPreviewRef.current = previewUrl;
    setSelectedFile(file);
    setAvatarPreview(previewUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* Revoke blob URL on unmount */
  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    };
  }, []);

  /* ---------------- UPDATE PROFILE ---------------- */

  const handleUpdate = async () => {
    if (!user?.id) return;

    try {
      setIsUpdating(true);
      let avatarId: number | null = null;

      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("files", renameFile(selectedFile)); // ← renamed file
        
        const storedJwt = localStorage.getItem("jwt");
        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedJwt}`,
          },
          body: uploadForm,
        });
        const uploadPayload = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadPayload?.error?.message ||
              `Image upload failed: ${uploadResponse.status}`,
          );
        }

        const file = Array.isArray(uploadPayload) ? uploadPayload[0] : null;
        avatarId = file?.id ? Number(file.id) : null;

        if (!avatarId) throw new Error("Upload succeeded but no file ID returned.");
      }

      const payload = new FormData();
      payload.append("username", formData.username || "");
      payload.append("country", formData.country || "");
      payload.append("city", formData.city || "");
      payload.append("about", formData.about || "");
      payload.append("isShowCity", String(formData.showCity));
      payload.append("language", formData.language || "");
      if (avatarId) payload.append("avatar", String(avatarId));

      await updateUserProfile(Number(user.id), payload);

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setIsUpdating(false);
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
    <div className="max-w-2xl mx-auto p-4 animate-fadeIn">
      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
        {/* PHOTO */}
        <div className="flex items-center justify-between border-b pb-6">
          <span className="font-medium">Your Photo</span>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  👤
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 border border-[#cb6f4d] text-[#cb6f4d] rounded text-sm hover:bg-[#fef5f1] transition-all"
            >
              Change Photo
            </button>
          </div>
        </div>

        {/* USERNAME */}
        <div className="flex items-center justify-between gap-4 border-b pb-6">
          <span className="font-medium">Username</span>
          <input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="flex-1 max-w-[200px] border-none text-right focus:ring-0 text-gray-700 font-semibold"
          />
        </div>

        {/* ABOUT */}
        <div className="space-y-2">
          <span className="font-medium">About You</span>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* LOCATION */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4 mt-6">
        <h3 className="text-gray-400 text-xs font-bold uppercase">My location</h3>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Country</span>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="border-none focus:ring-0"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Town/City</span>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="border-none focus:ring-0"
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="font-medium">Show city in profile</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="showCity"
              checked={formData.showCity}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[#cb6f4d] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Language</span>
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="border-none focus:ring-0"
          >
            <option value="">Select Language</option>
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* UPDATE BUTTON */}
      <div className="text-right mt-6">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-[#cb6f4d] text-white px-10 py-2.5 rounded shadow hover:bg-[#d08f77] disabled:opacity-50 transition-all font-medium"
        >
          {isUpdating ? "Saving..." : "Update profile"}
        </button>
      </div>
    </div>
  );
}