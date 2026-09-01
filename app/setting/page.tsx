"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  Truck,
  CreditCard,
  Gift,
  Bell,
  Eye,
  Shield,
  ChevronRight,
} from "lucide-react";
import ProfileSetting from "../components/ProfileSetting";
import AccountSetting from "../components/AccountSetting";
import Postage from "../components/Postage";
import Notification from "../components/Notification";
import PrivacySetting from "../components/PrivacySetting";
import SecuritySetting from "../components/Security";
import Payments from "../components/Payments";
import BundleDiscount from "../components/BundleDiscount";
import Footer from "../components/Footer";

// ?tab=<key> in the URL -> which sidebar label to preselect
const TAB_PARAM_TO_LABEL: Record<string, string> = {
  profile: "Profile Setting",
  account: "Account Setting",
  postage: "Postage",
  payments: "Payments",
  notification: "Notification",
  privacy: "Privacy Setting",
  security: "Security",
};

import React, { Suspense } from "react";
import SettingsClient from "./SettingsClient";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <SettingsClient />
    </Suspense>
  );
}
