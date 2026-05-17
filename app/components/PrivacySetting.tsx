"use client";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

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

export default function PrivacySettings(): React.ReactElement {
  const [settings, setSettings] = useState<PrivacySettingsState>({
    featureItems: true,
    notifyOwners: true,
    thirdPartyTracking: true,
    personaliseFeed: true,
    displayRecentlyViewed: true,
  });

  const toggle = (key: keyof PrivacySettingsState): void => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto  space-y-2 bg-white text-[#111111]">
      {/* Header */}
      <h3 className="text-xs text-gray-500 font-medium ml-1 mb-2">Privacy settings</h3>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Feature Items */}
        <PrivacyRow
          title="Feature my items in marketing campaigns for a chance to sell faster"
          description="This allows Reluv to showcase my items on social media and other websites. The increased visibility could lead to quicker sales."
          active={settings.featureItems}
          onToggle={() => toggle("featureItems")}
        />

        {/* Notify Owners */}
        <PrivacyRow
          title="Notify owners when I favourite their items"
          active={settings.notifyOwners}
          onToggle={() => toggle("notifyOwners")}
        />

        {/* Third-party Tracking */}
        <PrivacyRow
          title="Allow third-party tracking"
          active={settings.thirdPartyTracking}
          onToggle={() => toggle("thirdPartyTracking")}
        />

        {/* Personalise Feed */}
        <PrivacyRow
          title="Allow Reluv to personalise my feed and search results by evaluating my preferences, settings, previous purchases and usage of Reluv website and app"
          active={settings.personaliseFeed}
          onToggle={() => toggle("personaliseFeed")}
          isLast
        />
      </div>

      {/* Second Section: Recently Viewed */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
        <PrivacyRow
          title="Allow Reluv to display my recently viewed items on my Homepage."
          description="If you turn this option off but allow personalised content, these items will still be used to personalise your Feed."
          active={settings.displayRecentlyViewed}
          onToggle={() => toggle("displayRecentlyViewed")}
          isLast
        />
      </div>

      {/* Manage Account Data Link */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
        <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left">
          <div>
            <p className="font-medium text-gray-900 text-[15px]">Manage account data</p>
            <p className="text-sm text-gray-500 mt-0.5">Request and download a copy of your Reluv account data.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
      </div>
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
    <div className={`flex items-start justify-between p-4 bg-white ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="pr-6">
        <p className="font-medium text-gray-900 text-[15px] leading-tight">{title}</p>
        {description && <p className="text-sm text-gray-500 mt-1.5 leading-normal">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
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