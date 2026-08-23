"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ChevronDown, 
  Cookie, 
  Shield, 
  Settings, 
  BarChart3, 
  Megaphone,
  Users,
  Globe,
  Clock,
  FileText,
  Mail,
  BadgeInfo,
  Building2,
  Monitor,
  Info
} from "lucide-react";

const quickLinks = [
  { label: "What are cookies?", href: "#section-2" },
  { label: "Types of cookies", href: "#section-4" },
  { label: "Your choices", href: "#section-8" },
  { label: "Contact us", href: "#section-14" },
];

export default function CookiePolicyPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      id: 1,
      title: "Who We Are",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700">RELove is operated by:</p>
          <div className="mt-4 rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-5">
            <p className="font-semibold text-[#1a1816]">บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</p>
            <p className="mt-2 text-sm text-gray-700">Juristic Person Registration No.: 0115569025684</p>
            <div className="mt-4 pt-4 border-t border-[#eadfcd]">
              <p className="font-semibold text-[#1a1816] mb-2 text-sm">Registered Office:</p>
              <p className="text-sm text-gray-700">16 Moo 11, Suksawat Road</p>
              <p className="text-sm text-gray-700">Nai Khlong Bang Pla Kot Subdistrict</p>
              <p className="text-sm text-gray-700">Phra Samut Chedi District</p>
              <p className="text-sm text-gray-700">Samut Prakan Province, Thailand</p>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              Privacy Email: <span className="text-[#cb6f4d] font-medium">[PRIVACY EMAIL]</span>
            </p>
          </div>
        </>
      ),
    },
    {
      id: 2,
      title: "What Are Cookies?",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Cookies are small text files or pieces of information that may be stored on your browser or device when you visit a website or use an online service.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Cookies and similar technologies allow websites and applications to recognise devices, remember preferences, maintain sessions, understand how services are used and provide certain functionality.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
            <p className="font-semibold text-[#1a1816] mb-3 text-sm">
              Technologies similar to cookies include:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              {["Local storage", "Software development kits (SDKs)", "Pixels and tags", "Device identifiers", "Other similar technologies"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            For simplicity, this Cookie Policy generally refers to these technologies collectively as &quot;cookies&quot;.
          </p>
        </>
      ),
    },
    {
      id: 3,
      title: "Why RELove Uses Cookies",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">RELove may use cookies to:</p>
          <div className="space-y-2 text-sm text-gray-700">
            {[
              "Keep you signed in",
              "Authenticate your account",
              "Protect accounts and transactions",
              "Prevent fraud and abuse",
              "Remember your settings and preferences",
              "Operate marketplace functionality",
              "Maintain shopping and transaction sessions",
              "Understand how the Platform is used",
              "Identify and resolve technical problems",
              "Measure Platform performance",
              "Improve RELove",
              "Measure the effectiveness of communications or campaigns",
              "Provide advertising or personalised experiences where permitted"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 4,
      title: "Types of Cookies We Use",
      content: (
        <>
          <div className="space-y-5">
            {/* Strictly Necessary */}
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1816] flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1a1816]">
                  4.1 Strictly Necessary Cookies
                </h3>
              </div>
              <p className="text-sm leading-7 text-gray-700 mb-3">
                These cookies are required for RELove to operate properly and securely.
              </p>
              <p className="text-sm text-gray-700 mb-2">They may be used for purposes including:</p>
              <div className="space-y-1 text-sm text-gray-700 mb-3">
                {["Account authentication", "Maintaining login sessions", "Security", "Fraud prevention", "Transaction functionality", "Remembering privacy choices", "Load balancing", "Essential Platform functionality"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#eadfcd]">
                <p className="text-sm leading-6 text-gray-600">
                  These cookies cannot be disabled through RELove&apos;s Cookie Settings as they are necessary for the Platform to function.
                </p>
              </div>
            </div>

            {/* Functional */}
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1816] flex-shrink-0">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1a1816]">
                  4.2 Functional Cookies
                </h3>
              </div>
              <p className="text-sm leading-7 text-gray-700 mb-3">
                Functional cookies allow RELove to remember choices you make and provide enhanced functionality.
              </p>
              <p className="text-sm text-gray-700 mb-2">For example, they may remember:</p>
              <div className="space-y-1 text-sm text-gray-700 mb-3">
                {["Language preferences", "Display preferences", "Location or region preferences", "Previously selected settings", "Other customisation choices"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#eadfcd]">
                <p className="text-sm leading-6 text-gray-600">
                  Where required by law, these cookies will only be used after you provide consent.
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1816] flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1a1816]">
                  4.3 Analytics and Performance Cookies
                </h3>
              </div>
              <p className="text-sm leading-7 text-gray-700 mb-3">
                These cookies help us understand how users interact with RELove.
              </p>
              <p className="text-sm text-gray-700 mb-2">They may collect information concerning:</p>
              <div className="space-y-1 text-sm text-gray-700 mb-3">
                {["Pages or screens visited", "Features used", "Time spent on the Platform", "Navigation patterns", "Technical errors", "Application crashes", "Platform performance", "General usage statistics"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#eadfcd]">
                <p className="text-sm leading-6 text-gray-600">
                  We use this information to improve the Platform and user experience.
                </p>
              </div>
            </div>

            {/* Marketing */}
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1816] flex-shrink-0">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1a1816]">
                  4.4 Advertising and Marketing Cookies
                </h3>
              </div>
              <p className="text-sm leading-7 text-gray-700 mb-3">
                RELove may use advertising or marketing cookies to understand the effectiveness of marketing campaigns and, where applicable, provide more relevant advertising.
              </p>
              <p className="text-sm text-gray-700 mb-2">They may be used to:</p>
              <div className="space-y-1 text-sm text-gray-700 mb-3">
                {["Measure advertising campaigns", "Understand whether advertisements lead users to RELove", "Limit how frequently advertisements are displayed", "Build audiences for advertising campaigns", "Personalise advertising where permitted"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#eadfcd]">
                <p className="text-sm leading-6 text-gray-600">
                  Where consent is required, these cookies will not be activated unless you choose to accept them.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 5,
      title: "First-Party and Third-Party Cookies",
      content: (
        <>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">First-Party Cookies</h3>
              <p className="text-sm leading-7 text-gray-700">
                First-party cookies are placed directly by RELove and are generally used to provide and secure the Platform, remember preferences and understand how RELove operates.
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Third-Party Cookies</h3>
              <p className="text-sm leading-7 text-gray-700 mb-3">
                Some functionality may involve cookies or similar technologies provided by third parties.
              </p>
              <p className="text-sm text-gray-700 mb-2">These may include providers of:</p>
              <div className="flex flex-wrap gap-2">
                {["Analytics", "Advertising", "Payment", "Fraud prevention", "Support", "Authentication", "Social login"].map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border border-[#eadfcd]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 6,
      title: "Cookies Used by RELove",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            The specific cookies and similar technologies used by RELove may change as we develop or modify the Platform.
          </p>
          <div className="rounded-2xl border-2 border-[#eadfcd] bg-[#fbf6ea] p-5">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-[#cb6f4d] flex-shrink-0 mt-0.5" />
              <p className="font-semibold text-[#1a1816]">
                [INSERT COOKIE TABLE AFTER TECHNICAL AUDIT]
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              The final cookie register should identify, where applicable:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              {[
                { label: "Cookie / Technology", desc: "Name of the cookie" },
                { label: "Provider", desc: "RELove or third party" },
                { label: "Purpose", desc: "Why it's used" },
                { label: "Category", desc: "Necessary/Functional/Analytics/Marketing" },
                { label: "Duration", desc: "How long it remains active" },
                { label: "Type", desc: "First-party or third-party" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <div>
                    <strong>{item.label}:</strong> {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      id: 7,
      title: "Cookie Consent",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            When you first visit RELove, you may be presented with a cookie consent interface.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#1a1816] p-5 text-white">
            <h4 className="font-semibold mb-3">Your Consent Rights</h4>
            <div className="space-y-2 text-sm leading-6">
              {[
                "Where consent is required, you can choose whether RELove may use optional categories of cookies",
                "Strictly necessary cookies don't require consent when necessary to provide a service you requested",
                "RELove will not treat continued browsing, silence or inactivity as consent where affirmative consent is required"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      id: 8,
      title: "Your Cookie Choices",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where applicable, RELove provides controls that allow you to:
          </p>
          <div className="space-y-2 mb-5 text-sm text-gray-700">
            {[
              "Accept optional cookies",
              "Reject optional cookies",
              "Choose individual categories of optional cookies",
              "Change or withdraw your previous choices"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              You can review or change your choices at any time through:{" "}
              <span className="font-semibold text-[#1a1816]">[Cookie Settings]</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Withdrawing consent does not affect the lawfulness of processing carried out before consent was withdrawn.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 9,
      title: "Browser Controls",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Most web browsers allow you to manage cookies through browser settings.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4 mb-4">
            <p className="font-semibold text-[#1a1816] mb-3 text-sm">
              Depending on your browser, you may be able to:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              {["View cookies", "Delete cookies", "Block particular cookies", "Block third-party cookies", "Block all cookies"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Note:</strong> Blocking all cookies may affect RELove&apos;s functionality, including account login, security and transaction features.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 10,
      title: "Cookies and Personal Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Some cookies and similar technologies may collect or generate information that constitutes personal data under applicable law.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4 mb-4">
            <p className="font-semibold text-[#1a1816] mb-3 text-sm">This may include:</p>
            <div className="flex flex-wrap gap-2">
              {["IP address", "Device identifiers", "Cookie identifiers", "Browser information", "Usage information", "Account identifiers", "Interactions with RELove"].map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border border-[#eadfcd]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm leading-7 text-gray-700">
            Where information collected through cookies constitutes personal data, it will be processed in accordance with our{" "}
            <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
              Privacy Policy
            </Link>{" "}
            and applicable Thai data-protection law.
          </p>
        </>
      ),
    },
    {
      id: 11,
      title: "International Data Transfers",
      content: (
        <>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5">
            <p className="text-sm leading-7 text-gray-700 mb-4">
              Some third-party technology providers may process information collected through cookies outside Thailand.
            </p>
            <p className="text-sm leading-7 text-gray-700 mb-4">
              Where such processing involves the international transfer of personal data, RELove will take measures required under applicable Thai data-protection law.
            </p>
            <p className="text-sm leading-7 text-gray-700">
              For further information about international transfers, please see our{" "}
              <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </>
      ),
    },
    {
      id: 12,
      title: "How Long Cookies Remain on Your Device",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">Cookies may be either:</p>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Session Cookies</h3>
              <p className="text-sm leading-6 text-gray-700">
                These generally remain active only during a browsing session and expire when you close your browser or application.
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Persistent Cookies</h3>
              <p className="text-sm leading-6 text-gray-700">
                These remain on your device for a defined period or until they are deleted.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The duration depends on the purpose of the particular cookie. Where appropriate, the duration of individual cookies will be provided through our cookie register or Cookie Settings.
          </p>
        </>
      ),
    },
    {
      id: 13,
      title: "Changes to This Cookie Policy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            We may update this Cookie Policy from time to time to reflect:
          </p>
          <div className="space-y-2 mb-4 text-sm text-gray-700">
            {[
              "Changes to the technologies used by RELove",
              "Changes to third-party providers",
              "Changes to Platform functionality",
              "Changes to our data-processing activities",
              "Changes to applicable law or regulatory guidance"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              The <strong>Last updated</strong> date at the beginning of this Cookie Policy indicates when it was most recently revised.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Where required by law, we will provide appropriate notice or request renewed consent.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 14,
      title: "Contact Us",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            If you have questions about RELove&apos;s use of cookies or other tracking technologies, please contact:
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-5">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-5 h-5 text-[#cb6f4d] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1a1816]">
                  บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Juristic Person Registration No.: 0115569025684
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#eadfcd] p-4 mb-4">
              <p className="font-semibold text-[#1a1816] mb-2 text-sm">Registered Office:</p>
              <p className="text-sm text-gray-700">16 Moo 11, Suksawat Road</p>
              <p className="text-sm text-gray-700">Nai Khlong Bang Pla Kot Subdistrict</p>
              <p className="text-sm text-gray-700">Phra Samut Chedi District</p>
              <p className="text-sm text-gray-700">Samut Prakan Province, Thailand</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                Privacy Email:{" "}
                <span className="text-[#cb6f4d] font-semibold">[PRIVACY EMAIL]</span>
              </p>
              <p className="text-gray-700">
                Telephone:{" "}
                <span className="text-[#cb6f4d] font-semibold">[TELEPHONE NUMBER]</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-700 text-center">
            For more information about how RELove processes personal data, please read our{" "}
            <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f2eb]">
      {/* Decorative Background */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#cb6f4d]/20 blur-3xl animate-pulse" />
        <div className="absolute right-10 top-20 h-56 w-56 rounded-full bg-[#1a1816]/10 blur-3xl animate-pulse" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="relative overflow-hidden rounded-[2rem] border border-[#eadfcd] bg-[#fffaf2] px-5 py-8 shadow-[0_24px_80px_rgba(26,24,22,0.08)] sm:px-8 sm:py-10 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(203,111,77,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(26,24,22,0.06),transparent_28%)]" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white/70 px-3 py-1 text-xs font-semibold text-[#7f4f35] backdrop-blur">
              <BadgeInfo className="h-3.5 w-3.5" />
              Understanding how we use cookies
            </div>
            <div className="flex items-start gap-4 mb-4">
              <Cookie className="w-12 h-12 text-[#cb6f4d] flex-shrink-0" />
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                  Cookie Policy
                </h1>
                <p className="mt-2 text-sm text-gray-600">Last updated: [DATE]</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              This Cookie Policy explains how RELove uses cookies and similar technologies when you visit or use the RELove website, mobile application, marketplace and related services.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-4 py-2 text-sm font-medium text-[#1a1816] transition hover:-translate-y-0.5 hover:border-[#cb6f4d] hover:shadow-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </header>

        {/* Introduction Card */}
        <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6 mb-8">
          <p className="text-sm leading-7 text-gray-700">
            This Cookie Policy explains how <strong>บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</strong>{" "}
            (&quot;RELove&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar technologies when you visit or use the RELove Platform.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            This Cookie Policy should be read together with our{" "}
            <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
              Privacy Policy
            </Link>
            , which explains how RELove collects, uses, discloses and protects personal data.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const isOpen = openSection === index;
            
            return (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className={`scroll-mt-8 rounded-[1.5rem] border bg-[#fffdf8] shadow-sm transition duration-300 ${
                  isOpen ? "border-[#cb6f4d]" : "border-[#eadfcd] hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1816] text-sm font-semibold text-white flex-shrink-0">
                      {section.id}
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1a1816]">
                      {section.title}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-[#cb6f4d]" : ""
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-5 pt-0">
                    <div className="pl-12">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 rounded-[1.75rem] border border-[#eadfcd] bg-[#1a1816] px-5 py-5 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2d7c8] mb-3">
            Need help?
          </p>
          <p className="text-sm text-white/80 mb-4">
            If you have questions about our Cookie Policy or how we handle your data, please reach out.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Read Privacy Policy
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b35f3d]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
