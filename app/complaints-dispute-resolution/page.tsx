import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeInfo,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Complaints & Dispute Resolution Policy | RELove",
  description:
    "How users may submit complaints, transaction disputes, appeals and other concerns relating to RELove.",
};

const sections = [
  {
    id: "1",
    title: "Purpose",
    body: `RELove aims to provide users with accessible procedures for raising concerns relating to: marketplace transactions; Buyers; Sellers; payments; shipping; Buyer Protection; refunds; prohibited items; counterfeit goods; intellectual property; account restrictions; moderation decisions; Platform functionality; privacy; and RELove's services.

Different procedures may apply depending on the type of complaint.`,
  },
  {
    id: "2",
    title: "Types of Complaints",
    body: `Complaints may generally fall into one of the following categories:

A. Transaction Disputes — problems between Buyers and Sellers concerning a specific transaction.
B. Complaints About RELove — complaints concerning RELove's services, fees, functionality, support or conduct.
C. Safety and Policy Reports — reports concerning prohibited items, scams, harassment, fraud or other policy violations.
D. Moderation Appeals — requests to review certain listing removals, account restrictions or other enforcement decisions.
E. Intellectual Property Complaints — reports submitted by rights holders or their authorised representatives.
F. Privacy Complaints — questions or complaints concerning processing of personal data.

Each type may follow a different review process.`,
  },
  {
    id: "3",
    title: "Transaction Disputes",
    body: `A Buyer experiencing a problem with a purchase should use the dispute function available within the relevant RELove transaction wherever possible.

Examples include: item not received; wrong item received; materially damaged item; item significantly not as described; missing material components; or suspected counterfeit item.

Transaction disputes are primarily governed by the Buyer Protection & Refund Policy.`,
  },
  {
    id: "4",
    title: "Buyer Protection Deadline",
    body: `To qualify for RELove Buyer Protection, the Buyer must normally report an eligible problem within the Buyer Protection period. Under RELove's proposed standard transaction model, this period is 2 calendar days after confirmed delivery.

Where another deadline is displayed for the relevant transaction, the displayed deadline will apply subject to applicable law.

Failure to report within the Buyer Protection period may result in the transaction being treated as completed. Nothing in this section removes rights that cannot lawfully be excluded.`,
  },
  {
    id: "5",
    title: "Opening a Transaction Dispute",
    body: `Where available, the Buyer should select [I Have a Problem] within the relevant order.

The Buyer should: identify the problem; explain what happened; provide requested evidence; and submit the dispute before the applicable deadline.

The Seller's payout may be temporarily suspended while an eligible dispute is being reviewed.`,
  },
  {
    id: "6",
    title: "Seller Response",
    body: `Where appropriate, the Seller will be given an opportunity to respond. The Seller may be asked to provide: photographs; listing information; proof of shipment; proof of ownership; authenticity evidence; receipts; communications; or other relevant information.

RELove may establish a deadline for responding. If the Seller does not respond within the applicable period, RELove may decide the dispute based on the available evidence.`,
  },
  {
    id: "7",
    title: "Evidence",
    body: `Depending on the dispute, RELove may consider: original listing; photographs; videos; transaction records; communications; shipping information; tracking; packaging photographs; receipts; authenticity information; payment records; user history; and other relevant evidence.

Evidence must be genuine. Fabricated, manipulated or deliberately misleading evidence may result in the claim being rejected and account enforcement.`,
  },
  {
    id: "8",
    title: "Temporary Payment Hold",
    body: `Where a valid transaction dispute is opened before Seller proceeds are released, RELove or the relevant payment provider may temporarily prevent or delay payout while the matter is reviewed.

A temporary hold does not mean that RELove has decided in favour of either party.`,
  },
  {
    id: "9",
    title: "Resolution Between Buyer and Seller",
    body: `Where appropriate, RELove may allow the Buyer and Seller an opportunity to resolve the dispute themselves.

Possible outcomes may include: Buyer keeps the item; Seller accepts a return; agreed partial refund where supported; cancellation; another mutually acceptable resolution.

RELove may intervene where: the parties cannot agree; fraud is suspected; prohibited goods are involved; counterfeit goods are suspected; Platform rules require intervention; or another significant issue exists.`,
  },
  {
    id: "10",
    title: "RELove Review",
    body: `If the parties cannot resolve an eligible dispute, RELove may review the evidence and determine the appropriate outcome under the applicable RELove policies.

Possible outcomes include: transaction completed; Seller paid; return authorised; full refund; partial refund where supported and appropriate; claim rejected; transaction cancelled; or additional investigation required.`,
  },
  {
    id: "11",
    title: "Fair Review",
    body: `RELove will seek to review disputes fairly based on available information. The existence of a complaint does not automatically mean that: the Buyer is correct; the Seller is correct; a refund must be issued; or an account violation occurred.

RELove may consider evidence from both parties.`,
  },
  {
    id: "12",
    title: "Returns",
    body: `Where RELove approves a return under Buyer Protection, the Buyer must follow the return instructions provided.

Unless another period is specified, the proposed standard return-dispatch period is 5 calendar days after RELove authorises the return.

Failure to dispatch within the applicable period may affect eligibility for the refund. Mandatory legal rights remain unaffected.`,
  },
  {
    id: "13",
    title: "Returned Item Disputes",
    body: `A Seller may report a problem with a returned item where, for example: a different item is returned; the item has been deliberately damaged; parts are missing; an authentic item has allegedly been replaced; the item has been materially altered; or another form of return abuse is suspected.

The Seller should report the problem promptly and provide supporting evidence.`,
  },
  {
    id: "14",
    title: "Shipping Disputes",
    body: `Shipping complaints may concern: parcel loss; shipping damage; failed delivery; incorrect tracking; returned parcels; failed pickup; incorrect delivery information; or courier problems.

RELove may rely on information provided by the relevant logistics provider when reviewing such matters. Shipping-related claims are also subject to the Shipping Policy.`,
  },
  {
    id: "15",
    title: "Payment Complaints",
    body: `Payment complaints may include: incorrect charge; duplicate payment; failed payment; missing refund; payout delay; incorrect Seller payout; chargeback; or other payment-processing concerns.

Some payment services may be provided by an independent authorised payment provider. Where appropriate, RELove may refer the user to that provider's complaint process for matters relating specifically to its regulated payment service.`,
  },
  {
    id: "16",
    title: "Complaint About RELove",
    body: `Users may submit complaints concerning RELove itself. Examples include: incorrectly charged RELove fees; poor customer support; technical problems; incorrect Platform information; inappropriate moderation; unreasonable account restrictions; failure to process an eligible request; or another concern relating directly to RELove's services.

Such complaints should be submitted through [RELOVE COMPLAINT FORM] or [SUPPORT / COMPLAINT EMAIL].`,
  },
  {
    id: "17",
    title: "Information Required",
    body: `To help RELove investigate a complaint, the user should provide information such as: name or account identifier; transaction number where applicable; listing number where applicable; description of the problem; date of the relevant event; requested resolution; and supporting evidence.

Users should avoid submitting unnecessary personal information.`,
  },
  {
    id: "18",
    title: "Complaint Acknowledgement",
    body: `RELove should acknowledge receipt of a formal complaint within a reasonable period. The acknowledgement may include: complaint reference number; date received; relevant next steps; and request for additional information where necessary.

Internal RELove target: acknowledge formal complaints within 2 business days. This is an operational service target unless a different legally required period applies.`,
  },
  {
    id: "19",
    title: "Complaint Review Target",
    body: `RELove will seek to resolve ordinary complaints as quickly as reasonably practicable. Internal RELove target: provide an outcome or meaningful progress update within 7 business days.

Complex matters may require longer, including cases involving: fraud; payment-provider investigations; courier investigations; counterfeit goods; intellectual property; law enforcement; substantial evidence; or multiple parties.

Where additional time is reasonably required, RELove should provide an update where appropriate.`,
  },
  {
    id: "20",
    title: "Urgent Complaints",
    body: `Some matters may require priority review. Examples include: credible threats; child-safety concerns; account takeover; serious fraud; dangerous illegal products; serious privacy or security incidents; or other circumstances involving substantial immediate risk.

Urgent matters may be escalated internally.`,
  },
  {
    id: "21",
    title: "Prohibited Item Reports",
    body: `Users may report listings that appear to violate RELove's Prohibited & Restricted Items Policy. Reports may concern: illegal goods; counterfeit products; stolen goods; weapons; prohibited substances; unsafe products; recalled products; or other restricted goods.

RELove may temporarily restrict a listing while investigating where appropriate.`,
  },
  {
    id: "22",
    title: "Reporting Fraud or Scams",
    body: `Suspected fraud may be reported through [REPORT USER / REPORT TRANSACTION]. Users should provide relevant evidence where available.

RELove may investigate: account activity; transactions; communications; shipping; payment information; linked accounts; and other relevant signals.`,
  },
  {
    id: "23",
    title: "Harassment and Community Complaints",
    body: `Users may report messages, profiles or behaviour that appears to violate the Community Standards.

Depending on the circumstances, RELove may: take no action; warn the user; remove content; restrict messaging; temporarily restrict the account; or terminate the account.`,
  },
  {
    id: "24",
    title: "Intellectual Property Complaints",
    body: `Intellectual property owners and authorised representatives should use RELove's dedicated intellectual property reporting procedure.

Reports should be submitted through [IP REPORTING FORM] or [IP EMAIL]. The process is explained in the Intellectual Property & Counterfeit Policy.`,
  },
  {
    id: "25",
    title: "Privacy Complaints",
    body: `Complaints relating to personal data should be submitted through RELove's privacy contact channel. Privacy matters may include: access requests; correction requests; deletion requests; objection requests; consent concerns; unlawful disclosure; security incidents; or other personal-data concerns.

Privacy Contact: [PRIVACY EMAIL / PRIVACY REQUEST FORM]. Privacy requests will be handled in accordance with the Privacy Policy and applicable Thai personal-data protection law.`,
  },
  {
    id: "26",
    title: "Moderation Decisions",
    body: `RELove may take enforcement action including: listing removal; content removal; messaging restrictions; buying restrictions; selling restrictions; verification requirements; temporary suspension; or permanent termination.

Where an eligible decision may be appealed, RELove will provide an appeal mechanism.`,
  },
  {
    id: "27",
    title: "Appeals",
    body: `An appeal should generally identify: the decision being challenged; the relevant listing, transaction or account; why the user believes the decision is incorrect; and supporting evidence.

Submitting an appeal does not automatically suspend the original enforcement action.`,
  },
  {
    id: "28",
    title: "Appeal Review",
    body: `Where reasonably practicable, an appeal should be reviewed using information beyond merely repeating the original automated decision. For significant cases, RELove may use human review.

Possible appeal outcomes include: decision upheld; decision modified; listing restored; account restriction reduced; account restored; or additional information requested.`,
  },
  {
    id: "29",
    title: "Abuse of the Complaint Process",
    body: `Users must not abuse RELove's reporting or complaint systems. Examples include: knowingly false complaints; fabricated evidence; repeated malicious reports; reporting competitors solely to disrupt their listings; threats intended to manipulate a dispute outcome; or using complaints to harass another user.

Abuse may result in account restrictions.`,
  },
  {
    id: "30",
    title: "No Retaliation",
    body: `Users must not retaliate against another person for legitimately: submitting a complaint; reporting a listing; opening a Buyer Protection claim; reporting fraud; submitting an intellectual property complaint; or cooperating with an investigation.`,
  },
  {
    id: "31",
    title: "Confidentiality",
    body: `RELove may limit disclosure of information concerning an investigation where necessary to protect: personal data; security; fraud-prevention methods; another user's rights; confidential information; legal investigations; or law-enforcement activity.

Users are not necessarily entitled to receive all internal information RELove considered when reaching a decision.`,
  },
  {
    id: "32",
    title: "Records",
    body: `RELove may retain records concerning complaints and disputes where necessary for: resolving the complaint; fraud prevention; Platform safety; legal compliance; regulatory obligations; accounting; establishing or defending legal claims; and improving RELove services.

Personal data will be handled according to RELove's Privacy Policy.`,
  },
  {
    id: "33",
    title: "Competent Authorities",
    body: `RELove's internal complaint procedure does not prevent a user from contacting a competent governmental, regulatory, judicial or law-enforcement authority where the user has the right to do so.

Depending on the issue, relevant Thai authorities may include authorities responsible for: consumer protection; electronic transactions and digital-platform services; personal-data protection; intellectual property; payment services; law enforcement; or courts.`,
  },
  {
    id: "34",
    title: "Consumer Complaints",
    body: `Where applicable, consumers may have the right to submit complaints to Thailand's Office of the Consumer Protection Board (OCPB).

RELove's internal dispute process does not remove statutory consumer rights.`,
  },
  {
    id: "35",
    title: "Digital Platform Complaints",
    body: `Matters concerning digital-platform services may fall within the responsibilities of Thailand's Electronic Transactions Development Agency (ETDA) under applicable digital-platform legislation.

RELove will cooperate with competent authorities where legally required.`,
  },
  {
    id: "36",
    title: "Personal Data Complaints",
    body: `Users may have rights under Thailand's Personal Data Protection Act and related legislation concerning processing of their personal data.

Nothing in this Policy prevents an eligible person from exercising rights or submitting complaints through mechanisms available under applicable law.`,
  },
  {
    id: "37",
    title: "Payment-Service Complaints",
    body: `Where a regulated payment service is provided by an independent payment-service provider, complaints concerning that regulated service may also be submitted through the provider's applicable complaint mechanism.

Users may have additional rights through relevant financial regulatory mechanisms.`,
  },
  {
    id: "38",
    title: "Law Enforcement",
    body: `Users should contact the appropriate law-enforcement authority where they believe they have been affected by criminal activity. Submitting a report to RELove does not replace reporting a crime to competent authorities.

RELove may preserve and provide relevant information to authorities where legally required or permitted.`,
  },
  {
    id: "39",
    title: "Court Proceedings",
    body: `Nothing in this Policy prevents either party from pursuing remedies available through competent courts or other legally available dispute-resolution mechanisms.

RELove's internal decision concerning Buyer Protection does not constitute a judicial determination of legal liability.`,
  },
  {
    id: "40",
    title: "Governing Law",
    body: `RELove's Terms & Conditions and related policies are governed by the laws of Thailand, subject to mandatory laws that apply regardless of contractual choice.`,
  },
  {
    id: "41",
    title: "Language",
    body: `RELove may provide this Policy and complaint support in Thai and other languages. Where multiple language versions are provided, RELove should clearly identify which version governs in the event of an inconsistency, subject to applicable law.

Recommended approach: the Thai version governs for RELove's Thailand service, while ensuring translations accurately reflect the Thai version.`,
  },
  {
    id: "42",
    title: "Accessibility",
    body: `RELove should make complaint channels reasonably accessible through the Platform. Users should not be required to search through unrelated pages simply to discover how to submit a complaint.

Complaint information should be available through RELove's Help Centre and relevant transaction interfaces.`,
  },
  {
    id: "43",
    title: "Changes to This Policy",
    body: `RELove may update this Policy to reflect: changes to Platform functionality; changes to complaint procedures; regulatory requirements; new payment or shipping providers; marketplace risks; or changes to applicable law.

Where required, RELove will provide appropriate notice of material changes. The Last updated date identifies the most recent revision.`,
  },
  {
    id: "44",
    title: "Contact RELove",
    body: `Formal complaints may be submitted to:
บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)
Juristic Person Registration No. 0115569025684

Registered Office: 16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi District, Samut Prakan Province, Thailand

Customer Support: [SUPPORT EMAIL]
Formal Complaints: [COMPLAINT EMAIL]
Privacy: [PRIVACY EMAIL]
Intellectual Property: [IP EMAIL]
Telephone: [TELEPHONE NUMBER]
Online Complaint Form: [COMPLAINT FORM URL]

For an active marketplace transaction, users should first use the dispute function available within the relevant order where appropriate.`,
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: "Different paths for different issues",
    text: "Transaction disputes, RELove complaints, and IP or privacy reports each follow their own process.",
  },
  {
    icon: Sparkles,
    title: "Response targets",
    text: "Formal complaints are acknowledged within 2 business days, with an update targeted within 7.",
  },
  {
    icon: TriangleAlert,
    title: "Urgent issues get priority",
    text: "Threats, fraud, and safety incidents may be escalated ahead of ordinary complaints.",
  },
  {
    icon: MessageCircleMore,
    title: "You can still go outside RELove",
    text: "Nothing here blocks you from contacting authorities, regulators, or the courts.",
  },
];

const quickLinks = [
  { label: "Types of complaints", href: "#section-2" },
  { label: "Opening a dispute", href: "#section-5" },
  { label: "Appeals", href: "#section-27" },
  { label: "Privacy complaints", href: "#section-25" },
  { label: "Contact RELove", href: "#section-44" },
];

/**
 * Read-only Complaints & Dispute Resolution Policy page.
 * This component only renders policy content for the user to read —
 * there is no ticket submission, form handling, or moderation UI here.
 */
export default function ComplaintsDisputePolicyPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#f7f2eb]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#cb6f4d]/20 blur-3xl animate-pulse" />
        <div className="absolute right-10 top-20 h-56 w-56 rounded-full bg-[#1a1816]/10 blur-3xl animate-pulse" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <header className="relative overflow-hidden rounded-[2rem] border border-[#eadfcd] bg-[#fffaf2] px-5 py-8 shadow-[0_24px_80px_rgba(26,24,22,0.08)] sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(203,111,77,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(26,24,22,0.06),transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white/70 px-3 py-1 text-xs font-semibold text-[#7f4f35] backdrop-blur">
                <BadgeInfo className="h-3.5 w-3.5" />
                Clear guidance for raising a concern
              </div>
              <h1 className="max-w-2xl font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                Complaints &amp; Dispute Resolution Policy
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700">
                This policy explains how you may submit complaints, transaction
                disputes, appeals and other concerns relating to RELove.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-4 py-2 text-sm font-medium text-[#1a1816] transition hover:-translate-y-0.5 hover:border-[#cb6f4d] hover:shadow-sm"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative rounded-[1.75rem] border border-[#eadfcd] bg-[#1a1816] p-4 text-white shadow-xl">
              <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-[#cb6f4d]/25 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2d7c8]">
                At a glance
              </p>
              <div className="mt-4 grid gap-3">
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[#cb6f4d]/15 p-2 text-[#f4c8b8]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-white/75">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f4f35]">
                Read this first
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                These are the most important promises and limits in the policy.
                If you only skim a few sections, start here.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Start a transaction problem inside the order itself using
                  "I Have a Problem" — that's the fastest path.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Formal complaints are acknowledged within 2 business days,
                  with progress targeted within 7.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  You can always escalate to authorities, regulators, or
                  courts — RELove's process doesn't replace those rights.
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6">
              <p className="text-sm text-gray-700">
                This Complaints &amp; Dispute Resolution Policy
                (&ldquo;Policy&rdquo;) explains how users may submit
                complaints, transaction disputes, appeals and other concerns
                relating to RELove.
              </p>

              <p className="mt-4 text-sm text-gray-700">
                This Policy should be read together with our Terms &amp;
                Conditions, Buyer Protection &amp; Refund Policy, Seller
                Rules, Payment, Fees &amp; Payout Policy, Shipping Policy,
                Prohibited &amp; Restricted Items Policy, Intellectual
                Property &amp; Counterfeit Policy, Community Standards, and
                Privacy Policy.
              </p>

              <div className="mt-6 rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 text-sm text-gray-700">
                <p className="font-semibold text-[#1a1816]">RELove is operated by:</p>
                <p className="mt-1">บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</p>
                <p>Juristic Person Registration No. 0115569025684</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="scroll-mt-8 rounded-[1.5rem] border border-[#eadfcd] bg-[#fffdf8] p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1816] text-sm font-semibold text-white">
                      {section.id}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#1a1816]">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {section.body.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-sm leading-7 text-gray-700 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-[#eadfcd] bg-[#1a1816] px-5 py-5 text-sm text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2d7c8]">
                Contact and support
              </p>
              <p className="mt-2 text-white/80">
                For an active marketplace transaction, use the dispute
                function within the relevant order first where appropriate.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Customer Support</p>
                  <p className="mt-1 text-white/70">[SUPPORT EMAIL]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Formal Complaints</p>
                  <p className="mt-1 text-white/70">[COMPLAINT EMAIL]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Privacy</p>
                  <p className="mt-1 text-white/70">[PRIVACY EMAIL]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Intellectual Property</p>
                  <p className="mt-1 text-white/70">[IP EMAIL]</p>
                </div>
              </div>
              <p className="mt-4 text-white/70">Telephone: [TELEPHONE NUMBER]</p>
              <p className="text-white/70">Online Complaint Form: [COMPLAINT FORM URL]</p>
              <p className="mt-4 text-white/70">
                บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)
              </p>
              <p className="text-white/70">
                16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict,
                Phra Samut Chedi District, Samut Prakan Province, Thailand
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}