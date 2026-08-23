import Link from "next/link";
import { 
  ShieldCheck, 
  Eye, 
  Download, 
  Trash2, 
  Mail, 
  Cookie, 
  Sparkles,
  Users,
  Globe,
  Lock,
  FileText,
  Settings,
  BadgeInfo,
  ExternalLink,
  CheckCircle,
  Truck
} from "lucide-react";

const privacyActions = [
  {
    icon: Eye,
    title: "Access Your Personal Data",
    description: "Request access to personal data that RELove holds about you, subject to applicable law.",
    action: "Access My Data",
    href: "#",
    color: "blue"
  },
  {
    icon: Settings,
    title: "Correct Your Information",
    description: "Update certain information directly through your RELove account or request correction of inaccurate data.",
    action: "Manage My Account",
    href: "/setting",
    color: "purple"
  },
  {
    icon: Download,
    title: "Download Your Data",
    description: "Request certain personal data in a format that allows it to be transmitted or used elsewhere.",
    action: "Request My Data",
    href: "#",
    color: "green"
  },
  {
    icon: Trash2,
    title: "Delete Your Account",
    description: "Request deletion of your RELove account. RELove may retain certain information where required by law.",
    action: "Delete My Account",
    href: "#",
    color: "red"
  },
  {
    icon: Mail,
    title: "Marketing Preferences",
    description: "Manage your preferences for optional marketing communications from RELove.",
    action: "Marketing Preferences",
    href: "#",
    color: "orange"
  },
  {
    icon: Cookie,
    title: "Cookie Settings",
    description: "Manage your choices regarding optional cookies and similar technologies.",
    action: "Cookie Settings",
    href: "/cookie-policy",
    color: "amber"
  },
];

const resources = [
  {
    title: "Privacy Policy",
    description: "Learn what personal data RELove collects and how we use, disclose, retain and protect it.",
    href: "/privacy-policy",
    icon: FileText
  },
  {
    title: "Your Privacy Rights",
    description: "Learn about your rights under the PDPA and how to submit data access, correction, or deletion requests.",
    href: "/privacy-rights",
    icon: FileText
  },
  {
    title: "Cookie Policy",
    description: "Learn about the cookies and similar technologies used by RELove.",
    href: "/cookie-policy",
    icon: Cookie
  },
  {
    title: "AI Features & Disclosure",
    description: "Learn how RELove uses AI-powered features and how they may interact with information you provide.",
    href: "/ai-policy",
    icon: Sparkles
  },
  {
    title: "Terms & Conditions",
    description: "Review the terms governing your use of the RELove platform.",
    href: "/terms-and-conditions",
    icon: FileText
  },
  {
    title: "Seller Rules",
    description: "Understand the rules, standards, and responsibilities that apply to all sellers on the RELove platform.",
    href: "/seller-rules",
    icon: FileText
  },
  {
    title: "Shipping Policy",
    description: "Learn how shipping, delivery, packaging, lost/damaged items, and shipping disputes are handled on RELove.",
    href: "/shipping-policy",
    icon: Truck
  },
];

const pdpaRights = [
  "Request access to your personal data",
  "Request correction of inaccurate or incomplete personal data",
  "Request deletion, destruction or anonymisation of personal data",
  "Request restriction of processing",
  "Object to certain processing",
  "Request data portability where applicable",
  "Withdraw consent where processing is based on your consent",
  "Lodge a complaint with the competent Thai personal data protection authority"
];

export default function PrivacyCentrePage() {
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
              Your privacy matters to us
            </div>
            <div className="flex items-start gap-4 mb-4">
              <ShieldCheck className="w-12 h-12 text-[#cb6f4d] flex-shrink-0" />
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                  Privacy Centre
                </h1>
                <p className="mt-2 text-sm text-gray-600">Last updated: [DATE]</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              At RELove, we take the protection of your personal data seriously. This Privacy Centre gives you an overview of how RELove handles your personal data and provides access to the tools and information you may need to manage your privacy.
            </p>
          </div>
        </header>

        {/* Company Information */}
        <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6 mb-8">
          <p className="text-sm leading-7 text-gray-700">
            RELove is operated by <strong>บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</strong>, a company registered in Thailand under Juristic Person Registration No. 0115569025684.
          </p>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Our handling of personal data is governed by applicable Thai law, including the Personal Data Protection Act B.E. 2562 (2019) (&quot;PDPA&quot;).
          </p>
        </div>

        {/* Your Privacy Section */}
        <section className="mb-8">
          <div className="rounded-[1.75rem] border border-[#eadfcd] bg-[#fffdf8] px-5 py-6 shadow-sm sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1816]">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1a1816]">Your Privacy</h2>
            </div>
            <p className="text-sm leading-7 text-gray-700 mb-4">
              When you use RELove, we may process personal data necessary to provide, operate, protect and improve our marketplace.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Depending on how you use RELove, this may include information relating to your:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {[
                "Account and profile",
                "Contact information",
                "Identity and account verification",
                "Listings and uploaded photographs",
                "Purchases and sales",
                "Payments and payouts",
                "Shipping and delivery",
                "Communications with other users",
                "Communications with RELove",
                "Customer support requests",
                "Device and Platform activity",
                "Security and fraud-prevention checks",
                "Interactions with RELove's AI-powered features"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              For detailed information about what personal data we collect, why we process it, our legal bases for processing, who we share it with and how long we retain it, please read our{" "}
              <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Manage Your Privacy Actions */}
        <section className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-[#1a1816] mb-6">Manage Your Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {privacyActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div
                  key={idx}
                  className="rounded-[1.5rem] border border-[#eadfcd] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f2ea] flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#cb6f4d]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1a1816] mb-1">{action.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <Link
                    href={action.href}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1a1816] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2826]"
                  >
                    {action.action}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Your Rights Under PDPA */}
        <section className="mb-8">
          <div className="rounded-[1.75rem] border border-[#eadfcd] bg-[#fffdf8] px-5 py-6 shadow-sm sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1816]">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1a1816]">
                Your Rights Under the PDPA
              </h2>
            </div>
            <p className="text-sm leading-7 text-gray-700 mb-4">
              Subject to the requirements, limitations and exceptions provided under applicable law, you may have rights relating to your personal data, including the right to:
            </p>
            <div className="space-y-2 mb-4">
              {pdpaRights.map((right, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{right}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
              <p className="text-sm leading-6 text-gray-700">
                <strong>Note:</strong> Withdrawal of consent does not affect processing that was lawful before consent was withdrawn.
              </p>
            </div>
          </div>
        </section>

        {/* AI and Your Personal Data */}
        <section className="mb-8">
          <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-6 shadow-sm sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1816]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1a1816]">
                AI and Your Personal Data
              </h2>
            </div>
            <p className="text-sm leading-7 text-gray-700 mb-4">
              RELove may use artificial intelligence and other automated technologies to help users create and manage listings.
            </p>
            <p className="text-sm leading-7 text-gray-700 mb-3">
              For example, when you upload photographs or information about an item, RELove or its technology service providers may analyse that content to suggest information such as:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
              {[
                "Product category",
                "Product type",
                "Brand",
                "Colour",
                "Size or other product attributes",
                "Listing title or description",
                "Estimated or suggested price"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 mb-4">
              <p className="text-sm leading-6 text-gray-700">
                <strong>Important:</strong> AI-generated information may be incomplete or inaccurate. You should review and confirm AI-generated information before publishing your listing. Sellers remain responsible for ensuring that their listings accurately represent the items being offered.
              </p>
            </div>
            <p className="text-sm leading-7 text-gray-700">
              For more information, please read our{" "}
              <Link href="/ai-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                AI Features & Disclosure Policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Sharing Personal Data */}
        <section className="mb-8">
          <div className="rounded-[1.75rem] border border-[#eadfcd] bg-[#fffdf8] px-5 py-6 shadow-sm sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1816]">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1a1816]">
                Sharing Personal Data
              </h2>
            </div>
            <p className="text-sm leading-7 text-gray-700 mb-3">
              Where necessary for operating RELove, we may share personal data with third parties such as:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
              {[
                "Payment and payout providers",
                "Shipping and logistics providers",
                "Identity or account-verification providers",
                "Cloud and technology providers",
                "AI service providers",
                "Security and fraud-prevention providers",
                "Customer-support providers",
                "Analytics providers",
                "Professional advisers",
                "Governmental, regulatory, judicial or law-enforcement authorities"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#cb6f4d] mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
              <p className="text-sm leading-6 text-gray-700">
                <strong>RELove does not sell your personal data.</strong> Further information is provided in our{" "}
                <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* International Data Transfers */}
        <section className="mb-8">
          <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-6 shadow-sm sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1816]">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1a1816]">
                International Data Transfers
              </h2>
            </div>
            <p className="text-sm leading-7 text-gray-700 mb-4">
              Some service providers used by RELove may process personal data outside Thailand.
            </p>
            <p className="text-sm leading-7 text-gray-700">
              Where personal data is transferred outside Thailand, RELove will take measures required under applicable Thai data-protection law to protect that personal data. See our{" "}
              <Link href="/privacy-policy" className="text-[#cb6f4d] underline font-medium hover:text-[#b35f3d]">
                Privacy Policy
              </Link>{" "}
              for further information.
            </p>
          </div>
        </section>

        {/* Privacy Resources */}
        <section className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-[#1a1816] mb-6">Privacy Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {resources.map((resource, idx) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={idx}
                  href={resource.href}
                  className="group rounded-[1.5rem] border border-[#eadfcd] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#cb6f4d] hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f2ea] flex-shrink-0 group-hover:bg-[#cb6f4d] transition-colors">
                      <Icon className="w-5 h-5 text-[#cb6f4d] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1a1816] mb-1 group-hover:text-[#cb6f4d] transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm leading-6 text-gray-600">{resource.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#cb6f4d] transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Contact Information */}
        <div className="rounded-[1.75rem] border border-[#eadfcd] bg-[#1a1816] px-5 py-6 text-white shadow-xl sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2d7c8] mb-3">
            Contact Us About Privacy
          </p>
          <p className="text-sm text-white/90 mb-4">
            If you have questions about this Privacy Centre, the processing of your personal data or exercising your privacy rights, please contact:
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold text-white mb-2">
              บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)
            </p>
            <p className="text-sm text-white/80 mb-3">
              Juristic Person Registration No.: 0115569025684
            </p>
            <div className="border-t border-white/10 pt-3 mb-3">
              <p className="text-sm font-semibold text-white mb-1">Registered Office:</p>
              <p className="text-sm text-white/80">
                16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict,
                Phra Samut Chedi District, Samut Prakan Province, Thailand
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-white/80">
                Privacy Email: <span className="text-[#cb6f4d] font-semibold">[PRIVACY EMAIL]</span>
              </p>
              <p className="text-white/80">
                Telephone: <span className="text-[#cb6f4d] font-semibold">[TELEPHONE NUMBER]</span>
              </p>
              <p className="text-white/80">
                Data Protection Officer: <span className="text-[#cb6f4d] font-semibold">[IF APPLICABLE]</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">
            We may need to verify your identity before fulfilling certain privacy requests in order to protect your personal data and account.
          </p>
        </div>
      </div>
    </div>
  );
}
