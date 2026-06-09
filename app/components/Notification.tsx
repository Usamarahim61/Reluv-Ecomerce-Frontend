"use client";
import { BACKEND_URL } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect } from "react";

interface NotificationSettings {
  updates: boolean;
  messages: boolean;
  feedback: boolean;
  reduced: boolean;
  favourited: boolean;
  newItems: boolean;
  email: boolean;
}

type DailyLimitType = "limit_2" | "limit_5" | "unlimited";

interface NotificationRowProps {
  title: string;
  description?: string;
  active: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

const APIPath = BACKEND_URL ?? "";

export default function Notification(): React.ReactElement {
  // Destructure token from useAuth to authentic requests with Strapi
  const { user } = useAuth();

  // State for toggles
  const [settings, setSettings] = useState<NotificationSettings>({
    updates: true,
    messages: true,
    feedback: true,
    reduced: true,
    favourited: true,
    newItems: true,
    email: true,
  });

  // State for daily limits dropdown
  const [dailyLimit, setDailyLimit] = useState<DailyLimitType>("unlimited");

  // UX Status States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // 1. Fetch existing settings when the component mounts or user updates
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem("jwt"); // Assuming token is stored in localStorage after login
        const response = await fetch(`${APIPath}/api/users/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             Authorization: `Bearer ${token}` ,
          },
        });

        if (!response.ok) throw new Error("Failed to load settings");

        const data = await response.json();

        // Hydrate state if properties exist in your Strapi DB
        if (data?.notificationSettings) {
          setSettings(data.notificationSettings);
        }
        if (data?.notificationDailyLimit) {
          setDailyLimit(data.notificationDailyLimit as DailyLimitType);
        }
      } catch (error) {
        setToast({
          message: "Failed to load preferences from server.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [user?.id]);

  // Auto-clear toaster after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggle = (key: keyof NotificationSettings): void => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 2. Handle Save Operation (PUT /api/users/:id)
  const handleSaveChanges = async () => {
    if (!user?.id) {
      setToast({ message: "You must be logged in to save.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${APIPath}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
         Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          notificationSettings: settings,
          notificationDailyLimit: dailyLimit,
        }),
      });

      if (!response.ok) throw new Error("Failed to save data");

      setToast({
        message: "Notification preferences updated!",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Render a clean loading indicator while state hydrates
  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#cb6f4d]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 bg-white text-[#111111] relative p-4">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-y-0 ${
            toast.type === "success" ? "bg-[#cb6f4d]" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* News Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase font-medium ml-1">
          News
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <NotificationRow
            title="Reluv Updates"
            description="Be the first to know about our newest features, updates, and changes"
            active={settings.updates}
            onToggle={() => toggle("updates")}
            isLast
          />
        </div>
      </section>

      {/* High-priority Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase font-medium ml-1">
          High-priority notifications
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <NotificationRow
            title="New messages"
            active={settings.messages}
            onToggle={() => toggle("messages")}
          />
          <NotificationRow
            title="New feedback"
            active={settings.feedback}
            onToggle={() => toggle("feedback")}
          />
          <NotificationRow
            title="Reduced items"
            active={settings.reduced}
            onToggle={() => toggle("reduced")}
            isLast
          />
        </div>
      </section>

      {/* Other notifications Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase font-medium ml-1">
          Other notifications
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <NotificationRow
            title="Favourited items"
            active={settings.favourited}
            onToggle={() => toggle("favourited")}
          />
          <NotificationRow
            title="New items"
            active={settings.newItems}
            onToggle={() => toggle("newItems")}
          />

          {/* Limit Selector */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <p className="text-xs text-gray-400 mb-1">
              Set a daily limit for each notification type
            </p>
            <div className="relative">
              <select
                value={dailyLimit}
                onChange={(e) =>
                  setDailyLimit(e.target.value as DailyLimitType)
                }
                className="w-full text-sm text-gray-700 bg-transparent appearance-none focus:outline-none cursor-pointer"
              >
                <option value="limit_2">Up to 2 notifications</option>
                <option value="limit_5">Up to 5 notifications</option>
                <option value="unlimited">Unlimited</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <NotificationRow
            title="Enable email notifications"
            active={settings.email}
            onToggle={() => toggle("email")}
            isLast
          />
        </div>
      </section>

      {/* Action / Save Changes Button Group */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#cb6f4d] hover:bg-[#b55f3f] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center gap-2 shadow-sm shadow-[#cb6f4d]/20"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}

/* Typed Sub-component */
function NotificationRow({
  title,
  description,
  active,
  onToggle,
  isLast,
}: NotificationRowProps): React.ReactElement {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <div className="pr-4">
        <p className="font-medium text-gray-900 text-[15px]">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={active}
          onChange={onToggle}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#cb6f4d] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
      </label>
    </div>
  );
}
