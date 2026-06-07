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
import ImageCropModal from "../components/ImageCropModal"; 
import { getGoogleAddress, getUserAvatarUrl } from "@/lib/user-profile";

const MAX_AVATAR_SIZE_MB = 10;

// ISO 2-letter codes for flagcdn.com images
const COUNTRY_CODES: { [key: string]: string } = {
  "Thailand": "th",
  "United States": "us",
  "United Kingdom": "gb",
  "China": "cn",
  "Pakistan": "pk",
  "Philippines": "ph",
  "Cambodia": "kh",
  "Laos": "la",
  "Vietnam": "vn",
  "Myanmar": "mm",
};

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
  const dropdownRef = useRef<HTMLDivElement>(null); // To close dropdown when clicking outside

  const [formData, setFormData] = useState({
    username: "",
    about: "",
    country: "",
    city: "",
    showCity: true,
    language: "",
  });

  const [avatarPreview, setAvatarPreview]     = useState<string | null>(null);
  const [selectedFile, setSelectedFile]       = useState<File | null>(null);
  const [cropSrc, setCropSrc]                 = useState<string | null>(null);
  const [showCropModal, setShowCropModal]     = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [isUpdating, setIsUpdating]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [isOpen, setIsOpen]                   = useState(false); // Custom dropdown state

 const baseCountries = ["Thailand", "Cambodia", "Laos", "Vietnam", "Pakistan", "Myanmar"];
  const countries =
    formData.country && !baseCountries.includes(formData.country)
      ? [...baseCountries, formData.country]
      : baseCountries;

  const cityByCountry: { [key: string]: string[] } = {
    Thailand: [
      "Bangkok", 
      "Chiang Mai", 
      "Phuket", 
      "Pattaya", 
      "Nonthaburi", 
      "Hat Yai", 
      "Khon Kaen", 
      "Nakhon Ratchasima"
    ],
    Cambodia: [
      "Phnom Penh", 
      "Siem Reap", 
      "Battambang", 
      "Sihanoukville", 
      "Poipet", 
      "Kampong Cham"
    ],
    Laos: [
      "Vientiane", 
      "Luang Prabang", 
      "Savannakhet", 
      "Pakse", 
      "Vang Vieng", 
      "Thakhek"
    ],
    Vietnam: [
      "Hanoi", 
      "Ho Chi Minh City", 
      "Da Nang", 
      "Haiphong", 
      "Nha Trang", 
      "Can Tho", 
      "Hue"
    ],
    Pakistan: [
      "Islamabad", 
      "Karachi", 
      "Lahore", 
      "Faisalabad", 
      "Rawalpindi", 
      "Multan", 
      "Peshawar", 
      "Quetta"
    ],
    Myanmar: [
      "Naypyidaw", 
      "Yangon", 
      "Mandalay", 
      "Taunggyi", 
      "Bago", 
      "Mawlamyine"
    ],
  };

  const baseCities = formData.country ? cityByCountry[formData.country] || [] : [];
  const cities =
    formData.city && !baseCities.includes(formData.city)
      ? [...baseCities, formData.city]
      : baseCities;
  const languages = ["en", "th"];

  // Close custom dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- fetch user (once) ---------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || hasFetched.current) return;
      hasFetched.current = true;
      try {
        setLoading(true);
        const data       = await getUser(Number(user.id));
        const userAvatar = await getUserAvatr(Number(user.id));
        const mergedUser = { ...data, ...userAvatar };
        const googleAddress = getGoogleAddress(mergedUser);
        setFormData({
          username: data.username || "",
          about:    data.about    || "",
          country:  data.country  || googleAddress?.country || "",
          city:     data.city     || googleAddress?.locality || "",
          showCity: data.isShowCity ?? true,
          language: data.language || "",
        });
        const avatarUrl = getUserAvatarUrl(mergedUser);
        if (avatarUrl) {
          setAvatarPreview(avatarUrl);
          avatarPreviewRef.current = avatarUrl;
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

  /* ---------- revoke blob on unmount ---------- */
  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current?.startsWith("blob:"))
        URL.revokeObjectURL(avatarPreviewRef.current);
      if (cropSrc?.startsWith("blob:"))
        URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  /* ---------- input handler ---------- */
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

  // Dedicated handler for the custom country selection
  const handleCountrySelect = (countryName: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      city: "", // Reset city when country changes
    }));
    setIsOpen(false);
  };

  /* ---------- photo change → open crop modal ---------- */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.warn(`"${file.name}" exceeds the ${MAX_AVATAR_SIZE_MB}MB size limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);

    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setShowCropModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------- crop saved ---------- */
  const handleCropSave = (croppedBlob: Blob, croppedDataUrl: string) => {
    if (avatarPreviewRef.current?.startsWith("blob:"))
      URL.revokeObjectURL(avatarPreviewRef.current);

    const croppedFile = new File([croppedBlob], `avatar_${Date.now()}.png`, {
      type: "image/png",
    });

    avatarPreviewRef.current = croppedDataUrl;
    setAvatarPreview(croppedDataUrl);
    setSelectedFile(croppedFile);
    setShowCropModal(false);

    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  /* ---------- update profile ---------- */
  const handleUpdate = async () => {
    if (!user?.id) return;
    try {
      setIsUpdating(true);
      let avatarId: number | null = null;

      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("files", renameFile(selectedFile));

        const storedJwt    = localStorage.getItem("jwt");
        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${storedJwt}` },
          body: uploadForm,
        });
        const uploadPayload = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadPayload?.error?.message || `Image upload failed: ${uploadResponse.status}`);
        }

        const file = Array.isArray(uploadPayload) ? uploadPayload[0] : null;
        avatarId   = file?.id ? Number(file.id) : null;
        if (!avatarId) throw new Error("Upload succeeded but no file ID returned.");
      }

      const payload = new FormData();
      payload.append("username",   formData.username  || "");
      payload.append("country",    formData.country   || "");
      payload.append("city",       formData.city      || "");
      payload.append("about",      formData.about     || "");
      payload.append("isShowCity", String(formData.showCity));
      payload.append("language",   formData.language  || "");
      if (avatarId) payload.append("avatar", String(avatarId));

      await updateUserProfile(Number(user.id), payload);

      toast.success("Profile updated successfully!", {
        position:        "top-right",
        autoClose:       3000,
        hideProgressBar: false,
        closeOnClick:    true,
        pauseOnHover:    true,
        draggable:       true,
      });

      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setIsUpdating(false);
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
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {showCropModal && cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
        />
      )}

      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
        {/* PHOTO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
          <span className="font-medium">Your Photo</span>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>
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
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 border border-[#cb6f4d] text-[#cb6f4d] rounded text-sm hover:bg-[#fef5f1] transition-all"
            >
              Change Photo
            </button>
          </div>
        </div>

        {/* USERNAME */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b pb-6">
          <span className="font-medium">Username</span>
          <input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full sm:max-w-[200px] border border-gray-100 sm:border-none p-2 sm:p-0 text-left sm:text-right focus:ring-0 text-gray-700 font-semibold rounded"
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
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-[#cb6f4d] outline-none"
          />
        </div>
      </div>

      {/* LOCATION */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-4 mt-6">
        <h3 className="text-gray-400 text-xs font-bold uppercase">My location</h3>

        {/* CUSTOM DESIGNED COUNTRY SELECT WITH FLAG IMAGE */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1 sm:gap-4">
          <span className="font-medium">Country</span>
          
          <div className="relative w-full sm:max-w-[240px]" ref={dropdownRef}>
            {/* Main Selection Display Window */}
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between border border-[#cb6f4d] rounded p-2 text-sm cursor-pointer bg-white hover:border-[#cb6f4d] h-9 transition-all"
            >
              <div className="flex items-center gap-2">
                {formData.country && COUNTRY_CODES[formData.country] ? (
                  <img
                    src={`https://flagcdn.com/16x12/${COUNTRY_CODES[formData.country]}.png`}
                    alt={formData.country}
                    className="w-4 h-3 object-cover rounded-sm inline-block shrink-0"
                  />
                ) : null}
                <span className="text-[#cb6f4d] ">{formData.country || "Select country"}</span>
              </div>
              <span className="text-[#cb6f4d]  text-xs">▼</span>
            </div>

            {/* Floating Dropdown Panel */}
            {isOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto z-50 animate-fadeIn">
                <div
                  onClick={() => handleCountrySelect("")}
                  className="p-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  Select country
                </div>
                {countries.map((c) => {
                  const code = COUNTRY_CODES[c];
                  return (
                    <div
                      key={c}
                      onClick={() => handleCountrySelect(c)}
                      className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-[#fef5f1] hover:text-[#cb6f4d] cursor-pointer transition-colors"
                    >
                      {code && (
                        <img
                          src={`https://flagcdn.com/16x12/${code}.png`}
                          alt={c}
                          className="w-4 h-3 object-cover rounded-sm shrink-0"
                        />
                      )}
                      <span>{c}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1 sm:gap-4">
          <span className="font-medium">Town/City</span>
          <select name="city" value={formData.city} onChange={handleInputChange} className="cs-select">
            <option value="">Select city</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="font-medium">Show city in profile</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="showCity" checked={formData.showCity} onChange={handleInputChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[#cb6f4d] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-1 sm:gap-4">
          <span className="font-medium">Language</span>
          <select name="language" value={formData.language} onChange={handleInputChange} className="cs-select">
            <option value="">Select Language</option>
            {languages.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* UPDATE */}
      <div className="text-right mt-6">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full sm:w-auto bg-[#cb6f4d] text-white px-10 py-2.5 rounded shadow hover:bg-[#d08f77] disabled:opacity-50 transition-all font-medium"
        >
          {isUpdating ? "Saving..." : "Update profile"}
        </button>
      </div>
    </div>
  );
}