"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ChevronDown, 
  Scale,
  BadgeInfo,
  Eye,
  Download,
  Edit,
  Trash2,
  Ban,
  XCircle,
  CheckCircle,
  Mail,
  Shield,
  FileText,
  AlertCircle,
  Clock
} from "lucide-react";

const quickLinks = [
  { label: "Your rights", href: "#section-1" },
  { label: "How to request", href: "#section-16" },
  { label: "Request process", href: "#section-23" },
  { label: "Contact us", href: "#section-45" },
];

export default function PrivacyRightsPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      id: 1,
      title: "Your Privacy Rights",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Subject to the conditions, limitations and exceptions provided by applicable law, you may have rights concerning personal data RELove processes about you.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">These rights may include:</p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Right to access",
              "Right to data portability",
              "Right to object",
              "Right to deletion, destruction or anonymisation",
              "Right to restriction of processing",
              "Right to rectification",
              "Right to withdraw consent",
              "Right to lodge a complaint with the competent authority"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Note:</strong> Not every right applies in every situation.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 2,
      title: "Right to Access",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You may request access to personal data that RELove holds about you.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">Where applicable, you may also request:</p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["A copy of your personal data", "Information concerning the source of personal data that RELove obtained without your consent, where required under applicable law"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              Access rights may be subject to legal restrictions, including where disclosure would adversely affect the rights and freedoms of another person or where RELove is otherwise legally permitted to refuse access.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 3,
      title: "Requesting a Copy of Your Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where RELove provides self-service functionality, you may be able to request your data through:
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4 mb-4">
            <p className="text-sm font-semibold text-[#1a1816] mb-2">Self-Service Option:</p>
            <p className="text-sm text-gray-700">Account → Settings → Privacy → Download My Data</p>
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where self-service functionality is unavailable, you may submit a request through:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-[#cb6f4d] mt-1">•</span>
              <span>[PRIVACY REQUEST FORM]</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#cb6f4d] mt-1">•</span>
              <span>[PRIVACY EMAIL]</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            RELove may need to verify your identity before providing personal data.
          </p>
        </>
      ),
    },
    {
      id: 4,
      title: "Right to Data Portability",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where the conditions under applicable law are satisfied, you may request personal data concerning you in a form that:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Can be read or commonly used by automated tools", "Can be used or transferred through automated means"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where technically feasible and legally permitted, you may also request transmission of eligible personal data to another Data Controller.
          </p>
          <p className="text-sm text-gray-600">
            Data portability does not necessarily apply to all personal data RELove holds.
          </p>
        </>
      ),
    },
    {
      id: 5,
      title: "Right to Rectification",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You may request correction of personal data that is:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Inaccurate", "Incomplete", "Misleading", "Not up to date"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Certain information may be editable directly through your RELove account. For information that cannot be changed through your account, you may submit a privacy request.
          </p>
          <p className="text-sm text-gray-600">
            RELove may request evidence where reasonably necessary to verify the correction.
          </p>
        </>
      ),
    },
    {
      id: 6,
      title: "Right to Erasure",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Subject to applicable law, you may request that RELove delete, destroy, or anonymise personal data concerning you.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            A deletion request may be available where, for example:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {[
              "The personal data is no longer necessary for the purpose for which it was collected",
              "Consent has been withdrawn and no other lawful basis remains",
              "You successfully object to certain processing",
              "Personal data has been unlawfully processed"
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
      id: 7,
      title: "When RELove May Retain Data",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            The right to deletion is not absolute. RELove may continue retaining particular information where necessary or permitted for purposes such as:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {[
              "Complying with legal obligations",
              "Maintaining accounting or tax records",
              "Completing outstanding transactions",
              "Resolving buyer or seller disputes",
              "Fraud prevention",
              "Account-security investigations",
              "Preventing circumvention of valid suspensions",
              "Establishing, exercising or defending legal claims",
              "Responding to competent authorities",
              "Other grounds permitted by applicable law"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where possible, data that must be retained may be restricted from ordinary operational use.
          </p>
        </>
      ),
    },
    {
      id: 8,
      title: "Account Deletion and Data Erasure Are Not Identical",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Closing your RELove account and requesting deletion of personal data are related but separate concepts.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 mb-4">
            <p className="text-sm leading-6 text-gray-700">
              Closing an account generally prevents continued ordinary use of RELove. It does not necessarily require immediate deletion of every record associated with the account.
            </p>
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            For example, RELove may still need to retain records concerning:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Completed transactions", "Payments", "Refunds", "Disputes", "Fraud investigations", "Legal obligations"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            See our Account Deletion Policy for further information.
          </p>
        </>
      ),
    },
    {
      id: 9,
      title: "Right to Restriction",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where the statutory conditions apply, you may request restriction of the use of certain personal data. This may apply, for example, where:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "RELove is verifying the accuracy of data you challenged",
              "Personal data was unlawfully processed but you request restriction rather than deletion",
              "RELove no longer needs the data for its original purpose but you need it for a legal claim",
              "An objection is being assessed"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            During an applicable restriction, RELove may limit how the relevant personal data is used.
          </p>
        </>
      ),
    },
    {
      id: 10,
      title: "Right to Object",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where permitted under the PDPA, you may object to certain collection, use or disclosure of your personal data.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Your right to object depends on the legal basis and purpose of the processing. For example, particular objection rights may arise where RELove relies on certain legitimate-interest grounds.
          </p>
          <p className="text-sm text-gray-600">
            RELove will assess each valid objection according to applicable law.
          </p>
        </>
      ),
    },
    {
      id: 11,
      title: "Direct Marketing",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You may object to the use of your personal data for direct marketing. You may also unsubscribe from optional marketing communications through:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The unsubscribe link contained in eligible communications", "Marketing Preferences in your account", "A privacy request"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may continue sending necessary non-marketing communications concerning:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {["Your account", "Security", "Transactions", "Payments", "Shipping", "Disputes", "Changes to RELove services", "Legal matters"].map((item, idx) => (
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
      id: 12,
      title: "Withdrawal of Consent",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where RELove processes personal data based on your consent, you may withdraw that consent. Withdrawal should be available through an appropriate method depending on the processing activity.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">Examples may include:</p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Cookie Settings", "Marketing Preferences", "Account settings", "A privacy request"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Important:</strong> Withdrawal of consent does not affect the lawfulness of processing carried out before consent was withdrawn.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 13,
      title: "What Happens After Consent Is Withdrawn",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            If consent is the only lawful basis for particular processing, RELove will cease that processing after valid withdrawal, subject to any applicable legal requirements.
          </p>
          <p className="text-sm text-gray-600">
            However, withdrawing consent does not automatically require deletion of all information where another lawful basis permits or requires RELove to retain it.
          </p>
        </>
      ),
    },
    {
      id: 14,
      title: "Cookie Consent",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Optional cookie consent can be managed through Cookie Settings. Users may:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Accept optional cookies", "Reject optional cookies", "Change their choices", "Withdraw previous consent"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Strictly necessary technologies may continue operating where permitted without consent.
          </p>
        </>
      ),
    },
    {
      id: 15,
      title: "Marketing Preferences",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Users may manage optional RELove marketing through:
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4 mb-4">
            <p className="text-sm text-gray-700">Account → Settings → Marketing Preferences</p>
            <p className="text-xs text-gray-600 mt-2">[FINAL UI PATH TO BE CONFIRMED]</p>
          </div>
          <p className="text-sm text-gray-600">
            Marketing choices should be separate from communications necessary for providing RELove services.
          </p>
        </>
      ),
    },
    {
      id: 16,
      title: "How to Submit a Privacy Request",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            A privacy-right request may be submitted using:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-[#cb6f4d] mt-1">•</span>
              <span>[PRIVACY REQUEST FORM]</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#cb6f4d] mt-1">•</span>
              <span>[PRIVACY EMAIL]</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Where available, RELove may also provide self-service privacy tools through account settings.
          </p>
        </>
      ),
    },
    {
      id: 17,
      title: "Privacy Request Categories",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            The privacy request form should allow users to select:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Access my personal data",
              "Download my personal data",
              "Correct my personal data",
              "Delete my personal data",
              "Restrict processing",
              "Object to processing",
              "Withdraw consent",
              "Other privacy request",
              "Privacy complaint"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              The user should not be forced to understand obscure legal terminology before making a request.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 18,
      title: "Information We May Request",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            To process a request, RELove may ask for information reasonably necessary to:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Identify your account", "Understand your request", "Locate relevant personal data", "Verify your identity"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">This may include:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {["Name", "Username", "Email address", "Telephone number", "Account identifier", "Additional verification information where necessary"].map((item, idx) => (
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
      id: 19,
      title: "Identity Verification",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove must protect personal data against unauthorised disclosure. For that reason, we may need to verify that a privacy request genuinely comes from:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The relevant data subject", "A properly authorised representative"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            The level of verification should be proportionate to the sensitivity and risk associated with the request.
          </p>
        </>
      ),
    },
    {
      id: 20,
      title: "Avoiding Excessive Verification",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove should not collect excessive identification information merely to process an ordinary privacy request.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where an existing logged-in account or other lower-risk mechanism reasonably establishes identity, additional government identification should not automatically be required.
          </p>
          <p className="text-sm text-gray-600">
            Additional verification may be justified where the request creates a higher risk of unauthorised disclosure or account takeover.
          </p>
        </>
      ),
    },
    {
      id: 21,
      title: "Authorised Representatives",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where permitted under applicable law, an authorised person may submit a request on behalf of a data subject. RELove may request reasonable evidence of:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The representative's identity", "Authority to act for the data subject"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            RELove may contact the data subject directly where appropriate to verify the request.
          </p>
        </>
      ),
    },
    {
      id: 22,
      title: "Requests Concerning Children",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where a request concerns a minor, RELove may need to verify:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The age or status of the data subject", "The identity of the person making the request", "Parental authority or legal-representative status where applicable"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Any verification should comply with applicable law and RELove's Privacy Policy.
          </p>
        </>
      ),
    },
    {
      id: 23,
      title: "Processing a Request",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Once a valid request is received, RELove should:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {[
              "Record the request",
              "Assign a reference number",
              "Verify identity where necessary",
              "Identify the applicable right",
              "Locate relevant personal data",
              "Determine whether any statutory exception applies",
              "Perform the required action",
              "Record the outcome",
              "Respond to the requester"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1a1816] text-white text-xs font-semibold flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 24,
      title: "Request Reference Number",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Formal privacy requests should receive a unique reference number.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4 mb-4">
            <p className="text-sm font-semibold text-[#1a1816] mb-2">Example:</p>
            <p className="text-sm text-gray-700">Privacy Request: <span className="font-mono text-[#cb6f4d]">PR-2026-000125</span></p>
          </div>
          <p className="text-sm text-gray-600">
            Users should be able to use the reference number when communicating with RELove concerning the request.
          </p>
        </>
      ),
    },
    {
      id: 25,
      title: "Response Time",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove will process valid privacy requests within the period required by applicable law. Where a particular statutory timeframe applies, that timeframe will govern.
          </p>
          <p className="text-sm text-gray-600">
            If a request is unusually complex or requires additional clarification, RELove will communicate with the requester where appropriate.
          </p>
        </>
      ),
    },
    {
      id: 26,
      title: "Request Status",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where technically supported, users should be able to see statuses such as:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Submitted", "Identity Verification Required", "Under Review", "Additional Information Required", "Processing", "Completed", "Refused"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-xs">
            This is recommended operational functionality and not intended to create rights beyond applicable law.
          </p>
        </>
      ),
    },
    {
      id: 27,
      title: "No Fee in Ordinary Cases",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove will not ordinarily charge a fee merely for submitting a legitimate privacy-right request.
          </p>
          <p className="text-sm text-gray-600">
            Where applicable law permits fees or refusal in exceptional circumstances, RELove may exercise those rights in accordance with the law.
          </p>
        </>
      ),
    },
    {
      id: 28,
      title: "Refusing a Request",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            A privacy request may be refused in whole or in part where permitted by applicable law. Examples may include circumstances where:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Disclosure would unlawfully affect another person's rights",
              "RELove is legally required to retain the information",
              "An applicable statutory exception applies",
              "RELove cannot reasonably verify the requester",
              "The requested action is otherwise not legally required"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where required, RELove will record the reason for refusal.
          </p>
        </>
      ),
    },
    {
      id: 29,
      title: "Partial Compliance",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where only part of a request cannot lawfully be fulfilled, RELove should fulfil the remaining valid portions where reasonably possible.
          </p>
          <p className="text-sm text-gray-600">
            For example, RELove may provide access to a user's transaction information while withholding or redacting personal information belonging to another user where required.
          </p>
        </>
      ),
    },
    {
      id: 30,
      title: "Protecting Other Users' Privacy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            A privacy request does not give one user unrestricted access to another person's personal data. Before providing information, RELove may:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Redact", "Separate", "Restrict", "Withhold"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Information where necessary to protect other individuals and comply with applicable law.
          </p>
        </>
      ),
    },
    {
      id: 31,
      title: "Data Format",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where RELove provides a downloadable copy of personal data, information may be supplied in commonly used formats such as:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["CSV", "JSON", "PDF", "Another appropriate format"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Depending on the type of data and applicable legal requirements.
          </p>
        </>
      ),
    },
    {
      id: 32,
      title: "Data That May Be Included in an Export",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Depending on the request and applicable rights, a RELove data export may contain:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {[
              "Account information",
              "Profile information",
              "Listings",
              "Transaction history",
              "Purchases",
              "Sales",
              "Messages (subject to third-party rights)",
              "Reviews",
              "Support requests",
              "Privacy preferences",
              "Other relevant personal data"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Not every internal system record must necessarily be provided in every request.
          </p>
        </>
      ),
    },
    {
      id: 33,
      title: "Security of Data Exports",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Data exports may contain sensitive account and transaction information. RELove should therefore use reasonable security measures when providing downloadable personal data. These may include:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {["Authenticated download", "Temporary download links", "Link expiration", "Encryption", "Another appropriate security method"].map((item, idx) => (
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
      id: 34,
      title: "Correction Requests",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where RELove corrects personal data following a valid request, we will update relevant records where reasonably necessary and legally required.
          </p>
          <p className="text-sm text-gray-600">
            Where applicable, RELove may also need to communicate corrections to relevant recipients of the data.
          </p>
        </>
      ),
    },
    {
      id: 35,
      title: "Deletion Requests",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where a valid deletion request is approved, RELove will take appropriate steps to delete, destroy, or anonymise the relevant personal data in accordance with applicable law.
          </p>
          <p className="text-sm text-gray-600">
            Deletion from active systems may not necessarily result in immediate deletion from every backup where immediate deletion is technically impracticable, provided the data is appropriately protected and removed according to applicable retention processes.
          </p>
        </>
      ),
    },
    {
      id: 36,
      title: "Restriction Requests",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where processing is validly restricted, RELove should identify or otherwise control the relevant data to prevent inappropriate continued use.
          </p>
          <p className="text-sm text-gray-600">
            The precise technical method may depend on RELove's systems.
          </p>
        </>
      ),
    },
    {
      id: 37,
      title: "Objection Requests",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where a user submits a valid objection, RELove will assess:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The processing concerned", "The legal basis", "The user's reasons where relevant", "RELove's legitimate grounds", "Applicable statutory requirements"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            The result may differ depending on the purpose of processing.
          </p>
        </>
      ),
    },
    {
      id: 38,
      title: "Automated Systems",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            If RELove uses automated systems that materially affect users, privacy requests concerning such processing will be considered in accordance with applicable Thai law and RELove's AI Features & Disclosure Policy.
          </p>
          <p className="text-sm text-gray-600">
            Where legally required or operationally appropriate, RELove may provide an opportunity for additional review.
          </p>
        </>
      ),
    },
    {
      id: 39,
      title: "Requests After Account Closure",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Former users may still submit applicable privacy requests after closing their RELove accounts.
          </p>
          <p className="text-sm text-gray-600">
            RELove may need additional information to verify identity where normal account authentication is no longer available.
          </p>
        </>
      ),
    },
    {
      id: 40,
      title: "Fraudulent Requests",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Users must not use RELove's privacy processes to:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Impersonate another person", "Obtain another person's personal data", "Gain unauthorised account access", "Harass another person", "Commit fraud"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Warning:</strong> Suspected fraudulent requests may be rejected and investigated.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 41,
      title: "Internal Privacy Request Records",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may maintain records concerning privacy requests for purposes including:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Demonstrating compliance", "Preventing fraud", "Resolving complaints", "Maintaining audit records", "Establishing or defending legal claims"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            These records themselves constitute personal data and must be appropriately protected.
          </p>
        </>
      ),
    },
    {
      id: 42,
      title: "Privacy Complaints",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            If you believe RELove has improperly processed your personal data, you may submit a privacy complaint through:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-[#cb6f4d] mt-1">•</span>
              <span>[PRIVACY COMPLAINT FORM]</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#cb6f4d] mt-1">•</span>
              <span>[PRIVACY EMAIL]</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Please provide sufficient information for RELove to investigate the concern.
          </p>
        </>
      ),
    },
    {
      id: 43,
      title: "Complaint to the Competent Authority",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700">
            Your use of RELove's internal privacy-request process does not prevent you from exercising any right to lodge a complaint with the competent Thai personal data protection authority where available under applicable law.
          </p>
        </>
      ),
    },
    {
      id: 44,
      title: "Changes to This Policy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may update this Privacy Rights & Data Requests Policy to reflect:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Changes to the Platform", "Changes to privacy-request tools", "Changes to applicable law", "Regulatory guidance", "Changes to RELove's processing activities"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where required, RELove will provide appropriate notice of material changes. The <strong>Last updated</strong> date identifies the most recent revision.
          </p>
        </>
      ),
    },
    {
      id: 45,
      title: "Contact RELove About Privacy",
      content: (
        <>
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
                Privacy Request Form: <span className="text-[#cb6f4d] font-semibold">[FORM URL]</span>
              </p>
              <p className="text-gray-700">
                Telephone: <span className="text-[#cb6f4d] font-semibold">[TELEPHONE NUMBER]</span>
              </p>
              <p className="text-gray-700">
                Data Protection Officer: <span className="text-[#cb6f4d] font-semibold">[IF APPLICABLE]</span>
              </p>
            </div>
          </div>
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
              How to exercise your PDPA rights
            </div>
            <div className="flex items-start gap-4 mb-4">
              <Scale className="w-12 h-12 text-[#cb6f4d] flex-shrink-0" />
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                  Your Privacy Rights & Data Requests
                </h1>
                <p className="mt-2 text-sm text-gray-600">Last updated: [DATE]</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              This page explains how you may exercise your rights concerning personal data processed by RELove under Thailand's Personal Data Protection Act B.E. 2562 (2019) (PDPA).
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

        {/* Related Policies */}
        <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6 mb-8">
          <p className="text-sm leading-7 text-gray-700 mb-3">
            This page should be read together with our:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Privacy Centre", href: "/privacy-centre" },
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Cookie Policy", href: "/cookie-policy" },
            ].map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="inline-flex items-center gap-1 rounded-full bg-[#f8f2ea] px-3 py-1 text-sm text-gray-700 border border-[#eadfcd] hover:border-[#cb6f4d] hover:bg-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
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
            Need to exercise your rights?
          </p>
          <p className="text-sm text-white/80 mb-4">
            Visit our Privacy Centre to access your data management tools and submit privacy requests.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy-centre"
              className="inline-flex items-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b35f3d]"
            >
              Go to Privacy Centre
            </Link>
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
