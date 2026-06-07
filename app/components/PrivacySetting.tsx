"use client";
import React, { useState } from "react";
import { ChevronRight, X, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUser, getUserAvatr } from "@/services/auth-service";

// Define the shape of the privacy settings state
interface PrivacySettingsState {
  featureItems: boolean;
  notifyOwners: boolean;
  thirdPartyTracking: boolean;
  personaliseFeed: boolean;
  displayRecentlyViewed: boolean;
}

// Define props for the individual setting rows
interface PrivacyRowProps {
  title: string;
  description?: string;
  active: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

type ExportFormat = "xlsx" | "csv";

// Strapi User Schema Interface
interface StrapiUser {
  id?: number;
  username?: string;
  email?: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: { id: number; name: string } | null;
  products?: Array<{ id: number; title?: string; price?: number }>;
  fav_products?: Array<{ id: number; title?: string; price?: number }>;
  received_reviews?: Array<{ id: number; rating?: number; comment?: string }>;
  written_reviews?: Array<{ id: number; rating?: number; comment?: string }>;
  rating_avg?: number;
  country?: string;
  followers?: Array<{ id: number; username?: string }>;
  following?: Array<{ id: number; username?: string }>;
  avatar?: { url?: string; name?: string } | string | null;
  city?: string;
  isShowCity?: boolean;
  about?: string;
  gender?: "Male" | "Female" | "other";
  birthday?: string;
  holidayMode?: boolean;
  facebookLinked?: boolean;
  googleLinked?: boolean;
  fullName?: string;
  phoneNumber?: string;
  accountType?: "user" | "admin";
  language?: "en" | "th";
  createdAt?: string;
  updatedAt?: string;
}

export default function PrivacySettings(): React.ReactElement {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettingsState>({
    featureItems: true,
    notifyOwners: true,
    thirdPartyTracking: true,
    personaliseFeed: true,
    displayRecentlyViewed: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("xlsx");
  const [isDownloading, setIsDownloading] = useState(false);

  const toggle = (key: keyof PrivacySettingsState): void => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDownloading(false);
  };

  const handleDownload = async () => {
    if (!user?.id) return;
    setIsDownloading(true);

    try {
      const userData: StrapiUser = await getUser(Number(user.id));
      const userAvatar = await getUserAvatr(Number(user.id));
      if (userAvatar) {
        userData.avatar = userAvatar;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `reluv_account_data_${userData.username || "user"}_${timestamp}`;

      if (selectedFormat === "csv") {
        const csvContent = generateCSV(userData);
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        triggerDownload(blob, `${filename}.csv`);
      } else if (selectedFormat === "xlsx") {
        const xlsxContent = generateXLSX(userData);
        const blob = new Blob([xlsxContent], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        triggerDownload(blob, `${filename}.xlsx`);
      }
    } catch (error) {
      console.error("Failed to download user data:", error);
    } finally {
      setIsDownloading(false);
      closeModal();
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Helper to safely get string value
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      if (Array.isArray(value)) return `${value.length} item(s)`;
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Helper to get avatar URL
  const getAvatarUrl = (avatar: any): string => {
    if (!avatar) return "N/A";
    if (typeof avatar === "string") return avatar;
    if (avatar?.url) return avatar.url;
    if (avatar?.data?.attributes?.url) return avatar.data.attributes.url;
    return "N/A";
  };

  const generateCSV = (data: StrapiUser): string => {
    const rows: string[][] = [];

    // Section: Account Information
    rows.push(["ACCOUNT INFORMATION"]);
    rows.push(["Field", "Value"]);
    rows.push(["User ID", safeString(data.id)]);
    rows.push(["Username", safeString(data.username)]);
    rows.push(["Email", safeString(data.email)]);
    rows.push(["Full Name", safeString(data.fullName)]);
    rows.push(["Phone Number", safeString(data.phoneNumber)]);
    rows.push(["Account Type", safeString(data.accountType)]);
    rows.push(["Account Status", data.blocked ? "Blocked" : data.confirmed ? "Confirmed" : "Unconfirmed"]);
    rows.push(["Provider", safeString(data.provider)]);
    rows.push(["Language", safeString(data.language)]);
    rows.push(["Role", safeString(data.role?.name)]);
    rows.push([""]);

    // Section: Profile Information
    rows.push(["PROFILE INFORMATION"]);
    rows.push(["Field", "Value"]);
    rows.push(["About", safeString(data.about)]);
    rows.push(["Gender", safeString(data.gender)]);
    rows.push(["Birthday", safeString(data.birthday)]);
    rows.push(["Country", safeString(data.country)]);
    rows.push(["City", safeString(data.city)]);
    rows.push(["Show City Publicly", safeString(data.isShowCity)]);
    rows.push(["Avatar URL", getAvatarUrl(data.avatar)]);
    rows.push(["Average Rating", safeString(data.rating_avg)]);
    rows.push([""]);

    // Section: Social & Settings
    rows.push(["SOCIAL & SETTINGS"]);
    rows.push(["Field", "Value"]);
    rows.push(["Facebook Linked", safeString(data.facebookLinked)]);
    rows.push(["Google Linked", safeString(data.googleLinked)]);
    rows.push(["Holiday Mode", safeString(data.holidayMode)]);
    rows.push(["Followers Count", safeString(data.followers?.length)]);
    rows.push(["Following Count", safeString(data.following?.length)]);
    rows.push([""]);

    // Section: Products
    if (data.products && data.products.length > 0) {
      rows.push(["MY LISTINGS"]);
      rows.push(["ID", "Title", "Price"]);
      data.products.forEach((product) => {
        rows.push([safeString(product.id), safeString(product.title), safeString(product.price)]);
      });
      rows.push([""]);
    }

    // Section: Favorite Products
    if (data.fav_products && data.fav_products.length > 0) {
      rows.push(["FAVORITE PRODUCTS"]);
      rows.push(["ID", "Title", "Price"]);
      data.fav_products.forEach((product) => {
        rows.push([safeString(product.id), safeString(product.title), safeString(product.price)]);
      });
      rows.push([""]);
    }

    // Section: Received Reviews
    if (data.received_reviews && data.received_reviews.length > 0) {
      rows.push(["RECEIVED REVIEWS"]);
      rows.push(["ID", "Rating", "Comment"]);
      data.received_reviews.forEach((review) => {
        rows.push([safeString(review.id), safeString(review.rating), safeString(review.comment)]);
      });
      rows.push([""]);
    }

    // Section: Written Reviews
    if (data.written_reviews && data.written_reviews.length > 0) {
      rows.push(["WRITTEN REVIEWS"]);
      rows.push(["ID", "Rating", "Comment"]);
      data.written_reviews.forEach((review) => {
        rows.push([safeString(review.id), safeString(review.rating), safeString(review.comment)]);
      });
      rows.push([""]);
    }

    // Section: Followers List
    if (data.followers && data.followers.length > 0) {
      rows.push(["FOLLOWERS"]);
      rows.push(["User ID", "Username"]);
      data.followers.forEach((follower) => {
        rows.push([safeString(follower.id), safeString(follower.username)]);
      });
      rows.push([""]);
    }

    // Section: Following List
    if (data.following && data.following.length > 0) {
      rows.push(["FOLLOWING"]);
      rows.push(["User ID", "Username"]);
      data.following.forEach((follow) => {
        rows.push([safeString(follow.id), safeString(follow.username)]);
      });
      rows.push([""]);
    }

    // Section: Metadata
    rows.push(["ACCOUNT METADATA"]);
    rows.push(["Field", "Value"]);
    rows.push(["Created At", safeString(data.createdAt)]);
    rows.push(["Updated At", safeString(data.updatedAt)]);
    rows.push(["Export Generated At", new Date().toISOString()]);

    // Escape CSV values
    const escapeCSV = (value: string): string => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    return rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
  };

  const generateXLSX = (data: StrapiUser): string => {
    const accentColor = "#cb6f4d";
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Reluv Account Data</title>
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th { background-color: ${accentColor}; color: white; font-weight: bold; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
          .section-header { background-color: #f3f4f6; font-weight: bold; color: #111827; }
          .label { font-weight: 600; color: #374151; width: 200px; }
          .value { color: #111827; }
          .empty-row { height: 12px; }
        </style>
      </head>
      <body>
        <table>`;

    // Title
    html += `<tr><th colspan="2" style="font-size:18px; text-align:center;">Reluv Account Data Export</th></tr>`;
    html += `<tr><td colspan="2" style="text-align:center; color:#6b7280; font-size:12px; padding-bottom:16px;">Generated on ${new Date().toLocaleString()}</td></tr>`;

    // Account Information
    html += `<tr><td colspan="2" class="section-header">ACCOUNT INFORMATION</td></tr>`;
    html += row("User ID", data.id);
    html += row("Username", data.username);
    html += row("Email", data.email);
    html += row("Full Name", data.fullName);
    html += row("Phone Number", data.phoneNumber);
    html += row("Account Type", data.accountType);
    html += row("Account Status", data.blocked ? "Blocked" : data.confirmed ? "Confirmed" : "Unconfirmed");
    html += row("Provider", data.provider);
    html += row("Language", data.language);
    html += row("Role", data.role?.name);
    html += emptyRow();

    // Profile Information
    html += `<tr><td colspan="2" class="section-header">PROFILE INFORMATION</td></tr>`;
    html += row("About", data.about);
    html += row("Gender", data.gender);
    html += row("Birthday", data.birthday);
    html += row("Country", data.country);
    html += row("City", data.city);
    html += row("Show City Publicly", data.isShowCity ? "Yes" : "No");
    html += row("Avatar URL", getAvatarUrl(data.avatar));
    html += row("Average Rating", data.rating_avg);
    html += emptyRow();

    // Social & Settings
    html += `<tr><td colspan="2" class="section-header">SOCIAL & SETTINGS</td></tr>`;
    html += row("Facebook Linked", data.facebookLinked);
    html += row("Google Linked", data.googleLinked);
    html += row("Holiday Mode", data.holidayMode);
    html += row("Followers Count", data.followers?.length);
    html += row("Following Count", data.following?.length);
    html += emptyRow();

    // Products
    if (data.products && data.products.length > 0) {
      html += `<tr><td colspan="2" class="section-header">MY LISTINGS (${data.products.length})</td></tr>`;
      html += `<tr><th>ID</th><th>Title</th><th>Price</th></tr>`;
      data.products.forEach((p) => {
        html += `<tr><td>${p.id}</td><td>${p.title || "N/A"}</td><td>${p.price !== undefined ? `$${p.price}` : "N/A"}</td></tr>`;
      });
      html += emptyRow();
    }

    // Favorite Products
    if (data.fav_products && data.fav_products.length > 0) {
      html += `<tr><td colspan="2" class="section-header">FAVORITE PRODUCTS (${data.fav_products.length})</td></tr>`;
      html += `<tr><th>ID</th><th>Title</th><th>Price</th></tr>`;
      data.fav_products.forEach((p) => {
        html += `<tr><td>${p.id}</td><td>${p.title || "N/A"}</td><td>${p.price !== undefined ? `$${p.price}` : "N/A"}</td></tr>`;
      });
      html += emptyRow();
    }

    // Received Reviews
    if (data.received_reviews && data.received_reviews.length > 0) {
      html += `<tr><td colspan="2" class="section-header">RECEIVED REVIEWS (${data.received_reviews.length})</td></tr>`;
      html += `<tr><th>ID</th><th>Rating</th><th>Comment</th></tr>`;
      data.received_reviews.forEach((r) => {
        html += `<tr><td>${r.id}</td><td>${r.rating || "N/A"}/5</td><td>${r.comment || "N/A"}</td></tr>`;
      });
      html += emptyRow();
    }

    // Written Reviews
    if (data.written_reviews && data.written_reviews.length > 0) {
      html += `<tr><td colspan="2" class="section-header">WRITTEN REVIEWS (${data.written_reviews.length})</td></tr>`;
      html += `<tr><th>ID</th><th>Rating</th><th>Comment</th></tr>`;
      data.written_reviews.forEach((r) => {
        html += `<tr><td>${r.id}</td><td>${r.rating || "N/A"}/5</td><td>${r.comment || "N/A"}</td></tr>`;
      });
      html += emptyRow();
    }

    // Followers
    if (data.followers && data.followers.length > 0) {
      html += `<tr><td colspan="2" class="section-header">FOLLOWERS (${data.followers.length})</td></tr>`;
      html += `<tr><th>User ID</th><th>Username</th></tr>`;
      data.followers.forEach((f) => {
        html += `<tr><td>${f.id}</td><td>${f.username || "N/A"}</td></tr>`;
      });
      html += emptyRow();
    }

    // Following
    if (data.following && data.following.length > 0) {
      html += `<tr><td colspan="2" class="section-header">FOLLOWING (${data.following.length})</td></tr>`;
      html += `<tr><th>User ID</th><th>Username</th></tr>`;
      data.following.forEach((f) => {
        html += `<tr><td>${f.id}</td><td>${f.username || "N/A"}</td></tr>`;
      });
      html += emptyRow();
    }

    // Metadata
    html += `<tr><td colspan="2" class="section-header">ACCOUNT METADATA</td></tr>`;
    html += row("Created At", data.createdAt);
    html += row("Updated At", data.updatedAt);
    html += row("Export Generated At", new Date().toISOString());

    html += `</table></body></html>`;
    return html;

    function row(label: string, value: any): string {
      const displayValue =
        value === null || value === undefined
          ? "N/A"
          : typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : String(value);
      return `<tr><td class="label">${label}</td><td class="value">${displayValue}</td></tr>`;
    }

    function emptyRow(): string {
      return `<tr class="empty-row"><td colspan="2"></td></tr>`;
    }
  };

  const formatOptions: {
    value: ExportFormat;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: "xlsx",
      label: "Excel (.xlsx)",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      description: "Best for spreadsheets",
    },
    {
      value: "csv",
      label: "CSV (.csv)",
      icon: <FileText className="w-5 h-5" />,
      description: "Universal compatibility",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-2 bg-white text-[#111111] relative">
      {/* Header */}
      <h3 className="text-xs text-gray-500 font-medium ml-1 mb-2">Privacy settings</h3>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <PrivacyRow
          title="Feature my items in marketing campaigns for a chance to sell faster"
          description="This allows Reluv to showcase my items on social media and other websites. The increased visibility could lead to quicker sales."
          active={settings.featureItems}
          onToggle={() => toggle("featureItems")}
        />

        <PrivacyRow
          title="Notify owners when I favourite their items"
          active={settings.notifyOwners}
          onToggle={() => toggle("notifyOwners")}
        />

        <PrivacyRow
          title="Allow third-party tracking"
          active={settings.thirdPartyTracking}
          onToggle={() => toggle("thirdPartyTracking")}
        />

        {/* <PrivacyRow
          title="Allow Reluv to personalise my feed and search results by evaluating my preferences, settings, previous purchases and usage of Reluv website and app"
          active={settings.personaliseFeed}
          onToggle={() => toggle("personaliseFeed")}
          isLast
        /> */}
      </div>

      {/* Second Section: Recently Viewed */}
      {/* <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
        <PrivacyRow
          title="Allow Reluv to display my recently viewed items on my Homepage."
          description="If you turn this option off but allow personalised content, these items will still be used to personalise your Feed."
          active={settings.displayRecentlyViewed}
          onToggle={() => toggle("displayRecentlyViewed")}
          isLast
        />
      </div> */}

      {/* Manage Account Data Link */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
        <button
          onClick={openModal}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
        >
          <div>
            <p className="font-medium text-gray-900 text-[15px]">Manage account data</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Request and download a copy of your Reluv account data.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Download your data</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Choose a format for your account export
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="p-5 space-y-2.5">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFormat(option.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all text-left ${
                    selectedFormat === option.value
                      ? "border-[#cb6f4d] bg-[#cb6f4d]/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedFormat === option.value
                        ? "bg-[#cb6f4d] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium text-[15px] ${
                        selectedFormat === option.value ? "text-[#cb6f4d]" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  {selectedFormat === option.value && (
                    <div className="w-5 h-5 rounded-full bg-[#cb6f4d] flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Info Box */}
            <div className="mx-5 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                Your download will include your profile info, listings, favorites, reviews,
                followers, and account activity. The file will be generated instantly.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading || !user?.id}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#cb6f4d] text-white font-medium hover:bg-[#b86242] active:bg-[#a5553a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* TypeScript sub-component for rows */
function PrivacyRow({
  title,
  description,
  active,
  onToggle,
  isLast,
}: PrivacyRowProps): React.ReactElement {
  return (
    <div
      className={`flex items-start justify-between p-4 bg-white ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="pr-6">
        <p className="font-medium text-gray-900 text-[15px] leading-tight">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1.5 leading-normal">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
        <input type="checkbox" className="sr-only peer" checked={active} onChange={onToggle} />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#cb6f4d] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
      </label>
    </div>
  );
}