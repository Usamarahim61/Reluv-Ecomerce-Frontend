"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ChevronDown, 
  ShieldCheck, 
  BadgeInfo,
  Building2,
  FileText,
  Lock,
  Users,
  Globe,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Mail
} from "lucide-react";

const quickLinks = [
  { label: "What data we collect", href: "#section-3" },
  { label: "How we use your data", href: "#section-9" },
  { label: "Your rights", href: "#section-18" },
  { label: "Contact us", href: "#section-24" },
];

export default function PrivacyPolicyPage() {
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
          <p className="text-sm leading-7 text-gray-700 mb-4">RELove is operated by:</p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-5">
            <p className="font-semibold text-[#1a1816]">บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</p>
            <p className="mt-2 text-sm text-gray-700">Juristic Person Registration No.: 0115569025684</p>
            <div className="mt-4 pt-4 border-t border-[#eadfcd]">
              <p className="font-semibold text-[#1a1816] mb-2 text-sm">Registered Office:</p>
              <p className="text-sm text-gray-700">16 Moo 11, Suksawat Road</p>
              <p className="text-sm text-gray-700">Nai Khlong Bang Pla Kot Subdistrict</p>
              <p className="text-sm text-gray-700">Phra Samut Chedi District</p>
              <p className="text-sm text-gray-700">Samut Prakan Province, Thailand</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#eadfcd]">
              <p className="font-semibold text-[#1a1816] mb-2 text-sm">Privacy Contact:</p>
              <p className="text-sm text-gray-700">Email: <span className="text-[#cb6f4d] font-medium">[PRIVACY EMAIL]</span></p>
              <p className="text-sm text-gray-700">Telephone: <span className="text-[#cb6f4d] font-medium">[TELEPHONE NUMBER]</span></p>
              <p className="text-sm text-gray-700">Data Protection Officer: <span className="text-[#cb6f4d] font-medium">[IF APPLICABLE]</span></p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            For processing activities where RELove determines the purposes and means of processing personal data, Relove Co., Ltd. acts as the Personal Data Controller under the PDPA.
          </p>
        </>
      ),
    },
    {
      id: 2,
      title: "Scope of This Privacy Policy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            This Privacy Policy applies to personal data processed through RELove, including when you:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {[
              "Visit our website",
              "Use our mobile application",
              "Create or manage an account",
              "Create, edit or publish a listing",
              "Upload photographs or other content",
              "Buy or sell an item",
              "Make or receive an offer",
              "Make or receive a payment",
              "Arrange shipment or delivery",
              "Communicate with another user",
              "Contact customer support",
              "Report another user or listing",
              "Participate in promotions or surveys",
              "Use our AI-powered features",
              "Otherwise interact with RELove"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Certain third-party services may process personal data under their own privacy policies. Where appropriate, we will identify those third parties or categories of third parties.
          </p>
        </>
      ),
    },
    {
      id: 3,
      title: "Personal Data We Collect",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-5">
            The personal data we collect depends on how you use RELove.
          </p>

          {/* Account and Profile */}
          <div className="mb-5">
            <h3 className="font-semibold text-[#1a1816] mb-2">3.1 Account and Profile Information</h3>
            <p className="text-sm leading-7 text-gray-700 mb-2">When you create or maintain an account, we may collect:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {["First and last name", "Username", "Email address", "Telephone number", "Profile photograph", "Password or authentication credentials", "Preferred language", "Account settings", "Account status", "Date and time of account creation"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              If you register using a third-party authentication service, we may receive information made available through that service according to your settings.
            </p>
          </div>

          {/* Identity and Verification */}
          <div className="mb-5">
            <h3 className="font-semibold text-[#1a1816] mb-2">3.2 Identity and Verification Information</h3>
            <p className="text-sm leading-7 text-gray-700 mb-2">
              Where necessary for security, fraud prevention, or legal compliance, we may process:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {["Full legal name", "Date of birth", "Identity-verification status", "Government-issued identification", "Verification photographs or selfies", "Verification results"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Listing and Product */}
          <div className="mb-5">
            <h3 className="font-semibold text-[#1a1816] mb-2">3.3 Listing and Product Information</h3>
            <p className="text-sm leading-7 text-gray-700 mb-2">When you create or interact with listings, we may process:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {["Product photographs", "Videos", "Listing title", "Description", "Category and subcategory", "Brand, size, colour, condition", "Price", "Product attributes", "Location information", "Listing history and status", "Offers", "AI-generated information"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Listing information you publish may be visible to other RELove users and potentially to visitors who are not logged in.
            </p>
          </div>

          {/* Transaction */}
          <div className="mb-5">
            <h3 className="font-semibold text-[#1a1816] mb-2">3.4 Transaction Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {["Items purchased or sold", "Transaction amount", "Transaction date and time", "Buyer and seller identifiers", "Offers and accepted prices", "Platform fees", "Payment and payout status", "Refunds and cancellations", "Dispute information", "Transaction history"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold text-[#1a1816] mb-2">3.5 Payment and Payout Information</h3>
            <p className="text-sm leading-7 text-gray-700 mb-2">
              Payments may be processed by third-party providers. We may receive:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {["Payment method type", "Payment status", "Transaction reference", "Limited payment account information", "Payout account information", "Billing information", "Refund information"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              RELove does not store complete payment-card numbers or security codes on its own systems where payments are processed by authorized third-party providers.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 4,
      title: "Shipping and Delivery Information",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where RELove facilitates shipping or delivery, we may process:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {["Sender and recipient name", "Telephone number", "Pickup information", "Delivery address", "Pickup or drop-off location", "Shipping provider", "Shipment identifier", "Tracking number", "Shipment status", "Delivery confirmation", "Lost, delayed, or damaged shipment information"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Necessary information may be shared with the relevant shipping or logistics provider to complete the transaction.
          </p>
        </>
      ),
    },
    {
      id: 5,
      title: "Communications",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            We may process communications made through or concerning RELove, including:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Messages between buyers and sellers", "Messages to customer support", "Complaints", "Reports", "Dispute communications", "Feedback", "Survey responses", "Communications relating to transactions"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              Where necessary and permitted by law, communications may be reviewed using automated systems or by authorized personnel for fraud prevention, user safety, dispute resolution, enforcement and detection of prohibited activity.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 6,
      title: "Device, Technical and Usage Information",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            When you use RELove, certain information may be collected automatically, including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {["IP address", "Device type and identifiers", "Operating system", "Browser type and version", "Application version", "Language and time zone", "Login activity", "Pages or screens viewed", "Searches", "Listings viewed", "Platform feature interactions", "Referral information", "Crash and diagnostic information", "Security logs", "Cookie identifiers"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            We use this information to operate, secure, analyze and improve RELove.
          </p>
        </>
      ),
    },
    {
      id: 7,
      title: "Cookies and Similar Technologies",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may use cookies, SDKs, pixels, local storage and similar technologies for purposes including:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Authentication", "Security", "Remembering preferences", "Platform functionality", "Analytics", "Performance measurement", "Advertising or marketing, where permitted"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700">
            Where consent is legally required for non-essential technologies, RELove will request consent before using them. Find additional information in our{" "}
            <Link href="/cookie-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
              Cookie Policy
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      id: 8,
      title: "AI-Powered Features",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may use artificial intelligence and machine-learning systems to provide or improve Platform functionality. When you upload photographs, they may be analyzed to suggest:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Product category", "Product type", "Brand", "Colour", "Size", "Condition or attributes", "Listing title", "Listing description", "Estimated or suggested price"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            AI systems may also assist with:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Search and recommendation systems", "Detection of prohibited listings", "Spam detection", "Fraud and abuse prevention", "Content moderation", "Platform security"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Important:</strong> AI-generated results may be inaccurate or incomplete. Sellers are responsible for reviewing and confirming listing information before publishing. See our{" "}
              <Link href="/ai-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                AI Features & Disclosure Policy
              </Link>
              .
            </p>
          </div>
        </>
      ),
    },
    {
      id: 9,
      title: "How We Use Personal Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            We may process personal data for purposes including:
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Providing RELove</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {["Create and maintain accounts", "Authenticate users", "Publish and manage listings", "Connect buyers and sellers", "Facilitate transactions", "Process orders", "Facilitate payments and payouts", "Provide shipping functionality", "Provide messaging", "Provide customer support", "Maintain transaction records"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Safety and Fraud Prevention</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {["Protect accounts", "Detect suspicious activity", "Prevent scams and fraud", "Detect prohibited goods", "Prevent payment abuse", "Investigate reports", "Enforce Platform rules", "Protect users and third parties"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Improving RELove</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {["Understand Platform interactions", "Troubleshoot technical issues", "Develop new functionality", "Improve search and recommendations", "Improve usability", "Analyze performance", "Improve AI features"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Communications</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {["Send transaction notifications", "Provide account notifications", "Communicate about payments and shipping", "Respond to support requests", "Provide security warnings", "Communicate Platform changes", "Send marketing communications where permitted"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Legal and Regulatory Compliance</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {["Comply with applicable laws", "Maintain required records", "Respond to lawful requests", "Establish or defend legal claims", "Investigate unlawful activity", "Comply with authority requirements"].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#cb6f4d] mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 10,
      title: "Legal Bases for Processing",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Under the PDPA, RELove will process personal data only where an appropriate legal basis applies:
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Contractual Necessity</h3>
              <p className="text-sm leading-6 text-gray-700 mb-2">
                Processing necessary to perform our contract with you, such as:
              </p>
              <div className="text-sm text-gray-700">
                Creating accounts, publishing listings, facilitating transactions, payments, shipping, customer support.
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Legal Obligation</h3>
              <p className="text-sm leading-6 text-gray-700">
                Processing necessary for RELove to comply with applicable law, including accounting, tax, regulatory records, fraud prevention obligations, and responses to lawful requests.
              </p>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Legitimate Interests</h3>
              <p className="text-sm leading-6 text-gray-700 mb-2">
                Where permitted by law, processing necessary for legitimate interests, such as:
              </p>
              <div className="text-sm text-gray-700">
                Preventing fraud, maintaining security, preventing abuse, improving RELove, protecting users, resolving disputes, defending legal claims, measuring performance.
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Consent</h3>
              <p className="text-sm leading-6 text-gray-700 mb-2">
                Where required, RELove may ask for your consent for:
              </p>
              <div className="text-sm text-gray-700 mb-2">
                Certain marketing activities, optional cookies, certain uses of sensitive personal data, or other processing requiring consent.
              </div>
              <p className="text-sm text-gray-600">
                You may withdraw consent at any time. Withdrawal does not affect lawful processing before withdrawal.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 11,
      title: "Marketing Communications",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where permitted by law, RELove may send information about:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Platform features", "Promotions", "Offers", "Campaigns", "New services", "RELove news"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where consent is required, we will obtain it before sending such communications. You can unsubscribe using the mechanism provided in the communication or through account settings.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              Account, security, transaction, legal and service-related communications are not marketing and may still be sent where necessary.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 12,
      title: "How We Share Personal Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove may disclose personal data to the following categories of recipients:
          </p>

          <div className="space-y-4">
            {[
              { title: "Other Users", desc: "Information shared with buyers or sellers where necessary to facilitate transactions. Public profile and listing information may be visible to other users." },
              { title: "Payment Providers", desc: "Information necessary to process payments, payouts, refunds, fraud checks, and payment verification." },
              { title: "Shipping and Logistics Providers", desc: "Information necessary to create shipments, generate labels, arrange pickup/delivery, and provide tracking." },
              { title: "Technology Providers", desc: "Including providers of hosting, cloud infrastructure, databases, communications, authentication, analytics, security, customer support, and AI technologies." },
              { title: "Professional Advisers", desc: "Including accountants, auditors, lawyers, insurers, and other professional advisers where necessary." },
              { title: "Authorities", desc: "Courts, regulators, government agencies, tax authorities, law enforcement, or other competent authorities where required or permitted by law." },
              { title: "Corporate Transactions", desc: "If RELove is involved in a merger, acquisition, restructuring, financing, or sale, personal data may be disclosed subject to appropriate safeguards." }
            ].map((category, idx) => (
              <div key={idx} className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
                <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">{category.title}</h3>
                <p className="text-sm leading-6 text-gray-700">{category.desc}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 13,
      title: "International Transfers of Personal Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Some of RELove's technology and service providers may operate or store information outside Thailand. Where RELove transfers personal data internationally, we will take measures required by applicable Thai data-protection law, which may include:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["An adequate level of data protection recognized under applicable law", "Appropriate contractual or organizational safeguards", "An applicable statutory exception", "Another legally permitted transfer mechanism"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where required, additional information concerning relevant international transfers may be provided upon request.
          </p>
        </>
      ),
    },
    {
      id: 14,
      title: "Data Retention",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove retains personal data only for as long as reasonably necessary for the purposes for which it was collected or as required by law. Retention periods may depend on:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Duration of your RELove account", "Nature of the personal data", "Transaction history", "Accounting or tax requirements", "Fraud-prevention requirements", "Disputes or complaints", "Legal limitation periods", "Regulatory obligations", "Need to defend legal claims"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            When personal data is no longer required, we will delete, destroy, anonymize or securely dispose of it in accordance with applicable law and our retention procedures.
          </p>
        </>
      ),
    },
    {
      id: 15,
      title: "Account Deletion",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            You may request deletion of your RELove account using available account functionality or by contacting us.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 mb-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Important:</strong> Deleting your account does not necessarily require RELove to immediately delete every record associated with you.
            </p>
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Certain personal data may continue to be retained where necessary or permitted for:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {["Completing outstanding transactions", "Resolving disputes", "Preventing fraud", "Enforcing Platform restrictions", "Maintaining financial records", "Complying with tax or accounting obligations", "Complying with legal obligations", "Establishing, exercising or defending legal claims"].map((item, idx) => (
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
      id: 16,
      title: "Security",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove implements appropriate technical and organizational measures designed to protect personal data from risks including:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Accidental loss", "Unauthorized access", "Unlawful disclosure", "Alteration", "Destruction", "Misuse"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Measures may include:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Encryption", "Access controls", "Authentication", "Monitoring", "Logging", "Secure development practices", "Backups", "Incident-response procedures", "Access restrictions based on business need"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              No electronic system can provide absolute security. Users are responsible for protecting their account credentials and should immediately contact RELove if they suspect unauthorized account access.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 17,
      title: "Personal Data Breaches",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove maintains procedures for identifying, assessing and responding to personal data breaches.
          </p>
          <p className="text-sm leading-7 text-gray-700">
            Where a personal data breach triggers notification requirements under applicable law, RELove will notify the relevant supervisory authority and affected data subjects as required.
          </p>
        </>
      ),
    },
    {
      id: 18,
      title: "Your Rights Under the PDPA",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Subject to applicable legal requirements, conditions and exceptions, you may have the right to:
          </p>

          <div className="space-y-3">
            {[
              { title: "Right of Access", desc: "Request access to personal data concerning you and information regarding its processing." },
              { title: "Right to Data Portability", desc: "Where applicable, request personal data in a readable format and request transmission where legally available." },
              { title: "Right to Object", desc: "Object to certain processing of your personal data in circumstances provided by law." },
              { title: "Right to Erasure", desc: "Request deletion, destruction or anonymization of personal data where the legal requirements are satisfied." },
              { title: "Right to Restriction", desc: "Request restriction of the use of your personal data in circumstances provided by law." },
              { title: "Right to Rectification", desc: "Request correction of personal data that is inaccurate, incomplete, misleading or not up to date." },
              { title: "Right to Withdraw Consent", desc: "Where processing is based on consent, withdraw that consent. Withdrawal does not affect lawful processing before withdrawal." },
              { title: "Right to Complain", desc: "Lodge a complaint with the competent Thai personal data protection authority where you believe processing violates applicable law." }
            ].map((right, idx) => (
              <div key={idx} className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4">
                <h3 className="font-semibold text-[#1a1816] mb-1 text-sm">{right.title}</h3>
                <p className="text-sm leading-6 text-gray-700">{right.desc}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 19,
      title: "Exercising Your Rights",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            To exercise an applicable privacy right, contact <strong>[PRIVACY EMAIL]</strong> or use the privacy-request functionality available through the RELove Platform where provided.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 mb-4">
            <p className="text-sm leading-6 text-gray-700">
              We may request information reasonably necessary to verify your identity before processing a request. This helps prevent another person from improperly obtaining, modifying or deleting your personal data.
            </p>
          </div>
          <p className="text-sm leading-7 text-gray-700">
            We will respond to valid requests within the period required under applicable law. In certain circumstances, we may lawfully refuse or restrict a request. Where required, we will explain the reason.
          </p>
        </>
      ),
    },
    {
      id: 20,
      title: "Children's Privacy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove is not intended to enable children to independently enter into transactions where they lack legal capacity to do so.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where consent is relied upon for processing personal data relating to a minor, RELove will obtain consent in accordance with the requirements of applicable Thai law, including parental or legal representative consent where required.
          </p>
          <p className="text-sm text-gray-600">
            Users must provide accurate information concerning their eligibility to use RELove.
          </p>
        </>
      ),
    },
    {
      id: 21,
      title: "Sensitive Personal Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove does not intentionally request sensitive personal data unless necessary and permitted under applicable law.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sensitive personal data may include information concerning:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Health", "Biometric information", "Racial or ethnic origin", "Religious or philosophical beliefs", "Political opinions", "Sexual behavior", "Disability", "Trade-union information", "Genetic information", "Other categories specified by law"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              Where RELove needs to process sensitive personal data, we will establish an appropriate legal basis and obtain explicit consent where required. Users should avoid including unnecessary sensitive personal data in public listings, profiles or communications.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 22,
      title: "Third-Party Websites and Services",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove may contain links to or integrate with services operated by third parties. Those third parties may process personal data independently according to their own privacy policies.
          </p>
          <p className="text-sm leading-7 text-gray-700">
            RELove's Privacy Policy does not govern processing independently determined by third parties. You should review the privacy information provided by the relevant third party before providing personal data directly to them.
          </p>
        </>
      ),
    },
    {
      id: 23,
      title: "Changes to This Privacy Policy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            We may update this Privacy Policy to reflect:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Changes to RELove", "New Platform functionality", "Changes to our processing activities", "New service providers", "Changes in applicable law", "Regulatory guidance"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where required by law, we will provide appropriate notice before material changes take effect. The <strong>Last updated</strong> date at the beginning of this Privacy Policy identifies the most recent revision.
          </p>
        </>
      ),
    },
    {
      id: 24,
      title: "Contact Us",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            For questions about this Privacy Policy or RELove's processing of personal data, or to exercise your rights, contact:
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-5">
            <p className="font-semibold text-[#1a1816]">บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</p>
            <p className="mt-2 text-sm text-gray-700">Juristic Person Registration No.: 0115569025684</p>
            <div className="mt-4 pt-4 border-t border-[#eadfcd]">
              <p className="font-semibold text-[#1a1816] mb-2 text-sm">Registered Office:</p>
              <p className="text-sm text-gray-700">16 Moo 11, Suksawat Road</p>
              <p className="text-sm text-gray-700">Nai Khlong Bang Pla Kot Subdistrict</p>
              <p className="text-sm text-gray-700">Phra Samut Chedi District</p>
              <p className="text-sm text-gray-700">Samut Prakan Province, Thailand</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#eadfcd] space-y-1 text-sm">
              <p className="text-gray-700">
                Privacy Email: <span className="text-[#cb6f4d] font-semibold">[PRIVACY EMAIL]</span>
              </p>
              <p className="text-gray-700">
                Telephone: <span className="text-[#cb6f4d] font-semibold">[TELEPHONE NUMBER]</span>
              </p>
              <p className="text-gray-700">
                Data Protection Officer: <span className="text-[#cb6f4d] font-semibold">[IF APPLICABLE]</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            You may also contact the competent Thai personal data protection authority regarding rights or complaints under applicable data-protection law.
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
              How we protect and process your personal data
            </div>
            <div className="flex items-start gap-4 mb-4">
              <ShieldCheck className="w-12 h-12 text-[#cb6f4d] flex-shrink-0" />
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                  Privacy Policy
                </h1>
                <p className="mt-2 text-sm text-gray-600">Last updated: [DATE]</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              This Privacy Policy explains how บริษัท รีลิฟ จำกัด (Relove Co., Ltd.) collects, uses, discloses, transfers, stores and processes personal data when you access or use the RELove Platform.
            </p>
            <p className="mt-3 text-base leading-7 text-gray-700">
              We process personal data in accordance with Thailand's Personal Data Protection Act B.E. 2562 (2019) (PDPA) and other applicable laws.
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
                    isOpen ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
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
            Manage Your Privacy
          </p>
          <p className="text-sm text-white/80 mb-4">
            Visit our Privacy Centre to access your data, manage your preferences, or exercise your rights.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy-centre"
              className="inline-flex items-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b35f3d]"
            >
              Privacy Centre
            </Link>
            <Link
              href="/cookie-policy"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
