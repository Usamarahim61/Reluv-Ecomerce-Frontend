"use client";
import React, { useState } from "react";

// 1. Define the shape of the settings state
interface NotificationSettings {
  updates: boolean;
  marketing: boolean;
  messages: boolean;
  feedback: boolean;
  reduced: boolean;
  favourited: boolean;
  newItems: boolean;
  email: boolean;
}

// 2. Define props for the Row sub-component
interface NotificationRowProps {
  title: string;
  description?: string; // Optional description
  active: boolean;
  onToggle: () => void;
  isLast?: boolean; // Optional flag for bottom borders
}

export default function Notification(): React.ReactElement {
  // 3. Initialize state with the defined interface
  const [settings, setSettings] = useState<NotificationSettings>({
    updates: true,
    marketing: true,
    messages: true,
    feedback: true,
    reduced: true,
    favourited: true,
    newItems: true,
    email: true,
  });

  // 4. Use 'keyof' to ensure only valid keys can be toggled
  const toggle = (key: keyof NotificationSettings): void => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 bg-white text-[#111111]">
      {/* News Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase font-medium ml-1">News</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <NotificationRow
            title="Reluv Updates"
            description="Be the first to know about our newest features, updates, and changes"
            active={settings.updates}
            onToggle={() => toggle("updates")}
          />
          <NotificationRow
            title="Marketing communications"
            description="Receive personalised offers, news, and recommendations"
            active={settings.marketing}
            onToggle={() => toggle("marketing")}
            isLast
          />
        </div>
      </section>

      {/* High-priority Section */}
      <section className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase font-medium ml-1">High-priority notifications</h3>
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
        <h3 className="text-xs text-gray-500 uppercase font-medium ml-1">Other notifications</h3>
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
            <p className="text-xs text-gray-400 mb-1">Set a daily limit for each notification type</p>
            <div className="relative">
              <select className="w-full text-sm text-gray-700 bg-transparent appearance-none focus:outline-none cursor-pointer">
                <option>Up to 2 notifications</option>
                <option>Up to 5 notifications</option>
                <option>Unlimited</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
    </div>
  );
}

/* Typed Sub-component */
function NotificationRow({ 
  title, 
  description, 
  active, 
  onToggle, 
  isLast 
}: NotificationRowProps): React.ReactElement {
  return (
    <div className={`flex items-center justify-between p-4 bg-white ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="pr-4">
        <p className="font-medium text-gray-900 text-[15px]">{title}</p>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
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