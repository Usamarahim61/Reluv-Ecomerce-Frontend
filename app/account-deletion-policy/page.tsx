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
  title: "Account Deletion Policy | RELove",
  description:
    "How users may close their RELove account and what happens to personal data after an account-deletion request.",
};

const sections = [
  {
    id: "1",
    title: "Closing Your RELove Account",
    body: `You may request closure of your RELove account at any time, subject to any outstanding obligations or restrictions described in this Policy.

Where available, account closure may be requested through: Account → Settings → Delete Account, or through [ACCOUNT DELETION FORM / SUPPORT EMAIL].`,
  },
  {
    id: "2",
    title: "Account Closure Is Not Always Immediate",
    body: `RELove may temporarily delay account closure where reasonably necessary to complete or resolve matters such as: active purchases; active sales; pending shipments; pending refunds; unpaid fees; pending Seller payouts; open Buyer Protection cases; chargebacks; unresolved complaints; fraud investigations; account-security investigations; or other legal or operational obligations.

Once those matters are resolved, the account may proceed to closure.`,
  },
  {
    id: "3",
    title: "What Happens When Your Account Is Closed",
    body: `After account closure: you will no longer be able to use the account normally; active listings may be removed or deactivated; you may lose access to certain account features; you may no longer be able to buy or sell through that account; optional marketing communications should cease where applicable; and personal data will be handled according to RELove's Privacy Policy and applicable law.`,
  },
  {
    id: "4",
    title: "Account Closure and Data Deletion Are Different",
    body: `Closing your RELove account does not necessarily mean that every piece of information associated with your account will be immediately deleted. RELove may need to retain certain information for lawful purposes.

This may include information relating to: completed transactions; payments and payouts; refunds; shipping; tax and accounting; disputes; fraud prevention; Platform enforcement; legal claims; regulatory obligations; or other legitimate purposes permitted by law.`,
  },
  {
    id: "5",
    title: "Data That May Be Deleted or Anonymised",
    body: `Where RELove no longer has a valid reason to retain personal data, we may: delete it; destroy it; anonymise it; or otherwise remove it from ordinary operational use, in accordance with applicable law and our retention procedures.`,
  },
  {
    id: "6",
    title: "Data We May Need to Retain",
    body: `Certain information may need to be retained after account closure. Examples may include: transaction records; payment records; payout records; invoices; tax records; fraud and security records; complaint records; moderation and enforcement records; legal correspondence; records necessary to prevent abuse or suspension circumvention; and records required by competent authorities.

Retention will be limited to what is reasonably necessary and permitted by law.`,
  },
  {
    id: "7",
    title: "Listings",
    body: `When your account is closed, active listings will generally be removed or deactivated.

Historical listing information may be retained where necessary for purposes such as: transaction history; dispute resolution; fraud prevention; legal compliance; intellectual property claims; or regulatory requirements.`,
  },
  {
    id: "8",
    title: "Messages",
    body: `Messages associated with your account may not always be deleted immediately. Some messages may need to be retained where necessary for: active transactions; dispute resolution; fraud prevention; safety investigations; legal compliance; or enforcement of RELove's Terms.

Where messages also contain personal data relating to another user, RELove must also consider that person's rights and legitimate interests.`,
  },
  {
    id: "9",
    title: "Reviews",
    body: `Reviews you submitted may remain associated with completed transactions where necessary to preserve marketplace integrity.

Where appropriate, RELove may: remove identifying profile information; anonymise the review; or retain the review in another lawful form. The exact treatment may depend on the circumstances and applicable law.`,
  },
  {
    id: "10",
    title: "Transactions",
    body: `Historical transaction information may be retained after account closure where necessary for: accounting; tax compliance; fraud prevention; payment disputes; chargebacks; consumer complaints; shipping disputes; legal claims; and regulatory compliance.`,
  },
  {
    id: "11",
    title: "Payment and Payout Information",
    body: `RELove or its payment providers may need to retain certain payment-related records after account closure. This may include: transaction references; payment status; payout status; refund records; fraud indicators; and legally required financial records.

Payment providers may separately retain information under their own legal obligations and privacy policies.`,
  },
  {
    id: "12",
    title: "Fraud and Safety Records",
    body: `RELove may retain limited information concerning accounts involved in: fraud; scams; counterfeit activity; serious policy violations; account takeover; payment abuse; security incidents; or suspension evasion.

Such records may be necessary to protect users and prevent repeated abuse.`,
  },
  {
    id: "13",
    title: "Suspended or Terminated Accounts",
    body: `If an account is suspended or terminated by RELove for a serious violation, deleting the account does not necessarily erase all enforcement records.

RELove may retain information necessary to: prevent suspension evasion; investigate related accounts; protect users; prevent fraud; comply with legal obligations; or establish or defend legal claims.`,
  },
  {
    id: "14",
    title: "Outstanding Seller Proceeds",
    body: `If you close your account while Seller proceeds remain payable, account closure may be delayed until: required identity verification is complete; disputes are resolved; applicable payment checks are completed; and eligible proceeds are paid.

RELove may also restrict payout where required by law or a payment provider.`,
  },
  {
    id: "15",
    title: "Outstanding Buyer Transactions",
    body: `If you have active purchases, deletion may be delayed until: the item is delivered; the Buyer Protection period ends; any dispute is resolved; any refund is completed; and the transaction is otherwise closed.`,
  },
  {
    id: "16",
    title: "Marketing Communications",
    body: `After account closure, RELove will stop sending optional marketing communications where the applicable processing no longer has a valid basis.

Some communications may still be sent where necessary for: account closure; legal obligations; transaction completion; refund processing; security; or dispute resolution.`,
  },
  {
    id: "17",
    title: "Cookies and Device Data",
    body: `Closing your account does not automatically remove cookies stored on your browser or device.

You may manage optional cookies through Cookie Settings. You may also delete cookies through your browser or device settings.`,
  },
  {
    id: "18",
    title: "Third-Party Providers",
    body: `Some personal data may be processed by third-party providers, including: payment providers; shipping providers; cloud providers; identity-verification providers; AI providers; customer-support providers; and other technology providers.

RELove will manage deletion or retention obligations with service providers where required and appropriate. Third parties acting independently may have their own legal retention obligations.`,
  },
  {
    id: "19",
    title: "Backups",
    body: `Personal data may remain temporarily in secure backup systems after deletion from active systems.

Where immediate deletion from backups is technically impracticable, such data should remain protected and should not ordinarily be restored to active use except where necessary for legitimate recovery or legal purposes.

Backup copies should be removed or overwritten according to RELove's applicable retention and backup schedule.`,
  },
  {
    id: "20",
    title: "Deletion Requests Under the PDPA",
    body: `You may separately exercise applicable rights concerning deletion, destruction or anonymisation of personal data under Thailand's Personal Data Protection Act.

These rights are subject to statutory conditions and exceptions. For more information, see: Your Privacy Rights & Data Requests Policy.`,
  },
  {
    id: "21",
    title: "When Deletion May Be Refused or Limited",
    body: `A request to delete personal data may be refused or limited where RELove is legally permitted or required to retain the information.

Examples may include where retention is necessary for: legal compliance; establishing, exercising or defending legal claims; accounting; taxation; fraud prevention; dispute resolution; security; regulatory investigations; or another lawful purpose.

Where appropriate, RELove may restrict use of retained information rather than continue ordinary processing.`,
  },
  {
    id: "22",
    title: "Identity Verification",
    body: `Before processing an account-deletion request, RELove may need to verify that the request is being made by the legitimate account holder or an authorised representative.

Verification should be proportionate to the risk of unauthorised deletion. Where the user is already authenticated through the account, additional identification should not be requested unless reasonably necessary.`,
  },
  {
    id: "23",
    title: "Confirmation Before Deletion",
    body: `Before closing an account, RELove should display a clear confirmation explaining the main consequences.

Example: "Delete Your RELove Account? Deleting your account will deactivate your listings and prevent you from using RELove through this account. Some transaction, payment, fraud-prevention and legal records may be retained where required or permitted by law. This action may not be reversible." [Cancel] [Continue to Delete Account]`,
  },
  {
    id: "24",
    title: "Final Confirmation",
    body: `To reduce accidental deletion, RELove may require a second confirmation step.

Example: "Please confirm that you want to permanently close your RELove account." [Keep My Account] [Delete My Account]

RELove may also require re-authentication before processing the request.`,
  },
  {
    id: "25",
    title: "Cooling-Off Period",
    body: `RELove may optionally implement a short technical grace period before final irreversible deletion — for example, an optional 7-day account recovery period.

If RELove implements such a period, it must be clearly explained to users. If no recovery period is offered, RELove should not imply that deletion can later be reversed.`,
  },
  {
    id: "26",
    title: "Account Reactivation",
    body: `If RELove offers an account-recovery period, logging back in during that period may allow the user to cancel the deletion request.

After final deletion or anonymisation, account restoration may not be possible.`,
  },
  {
    id: "27",
    title: "Creating a New Account Later",
    body: `Closing an ordinary account does not necessarily prevent a user from creating another account later, subject to RELove's Terms.

However, a person whose account was suspended or terminated for serious violations must not use deletion and re-registration to evade enforcement. RELove may prevent or restrict new accounts where reasonably necessary to enforce valid restrictions.`,
  },
  {
    id: "28",
    title: "How to Request Account Deletion",
    body: `Users should preferably be able to request deletion directly through account settings. The recommended flow is:

1. Open Account Settings.
2. Select Privacy & Account.
3. Select Delete Account.
4. Review outstanding transactions or restrictions.
5. Confirm the deletion request.
6. Complete security verification where required.
7. Receive confirmation that the request was submitted.`,
  },
  {
    id: "29",
    title: "Deletion Request Confirmation",
    body: `After the request is submitted, RELove should provide confirmation.

Example: "Account Deletion Requested. We have received your request to close your RELove account. If you have outstanding transactions, payments, disputes or other unresolved matters, deletion may be delayed until those matters are completed. We will notify you when your account has been closed."`,
  },
  {
    id: "30",
    title: "Completion Confirmation",
    body: `Once closure is complete, RELove should provide confirmation through an appropriate channel.

Example: "Your RELove Account Has Been Closed. Your RELove account has been closed. Certain information may continue to be retained where required or permitted by applicable law, as described in our Privacy Policy and Account Deletion Policy."`,
  },
  {
    id: "31",
    title: "Complaints",
    body: `If you believe RELove has improperly refused or delayed an account deletion or personal-data deletion request, you may submit a privacy complaint through [PRIVACY REQUEST / COMPLAINT FORM] or [PRIVACY EMAIL].`,
  },
  {
    id: "32",
    title: "Changes to This Policy",
    body: `RELove may update this Policy to reflect: changes to account functionality; changes to retention procedures; new payment or shipping systems; legal requirements; regulatory guidance; or changes to RELove's services.

Where required, RELove will provide appropriate notice of material changes. The Last updated date identifies the most recent revision.`,
  },
  {
    id: "33",
    title: "Contact RELove",
    body: `For account deletion or privacy matters:
บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)
Juristic Person Registration No. 0115569025684

Registered Office: 16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi District, Samut Prakan Province, Thailand

Privacy Email: [PRIVACY EMAIL]
Account Support: [SUPPORT EMAIL]
Telephone: [TELEPHONE NUMBER]`,
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: "You can close your account anytime",
    text: "Request deletion through Account → Settings → Delete Account, subject to outstanding obligations.",
  },
  {
    icon: TriangleAlert,
    title: "Closure isn't always instant",
    text: "Open transactions, disputes, or fraud checks may delay closure until they're resolved.",
  },
  {
    icon: Sparkles,
    title: "Deletion and closure differ",
    text: "Some records may be retained for legal, tax, or fraud-prevention reasons even after closure.",
  },
  {
    icon: MessageCircleMore,
    title: "You can still exercise data rights",
    text: "PDPA deletion, destruction, or anonymisation requests can be made separately.",
  },
];

const quickLinks = [
  { label: "How closure works", href: "#section-2" },
  { label: "What gets retained", href: "#section-6" },
  { label: "Your PDPA rights", href: "#section-20" },
  { label: "How to request deletion", href: "#section-28" },
  { label: "Complaints", href: "#section-31" },
];

/**
 * Read-only Account Deletion Policy page.
 * This component only renders policy content for the user to read —
 * there is no editing, form submission, or account-management UI here.
 */
export default function AccountDeletionPolicyPage(): JSX.Element {
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
                Clear guidance on closing your account
              </div>
              <h1 className="max-w-2xl font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                Account Deletion Policy
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700">
                This policy explains how you may close your RELove account and
                what happens to your personal data after an account-deletion
                request.
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
                  Deleting your account is not always instant — open orders,
                  disputes, or unpaid fees can delay it.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Closing your account and deleting your data are different —
                  some records are kept for legal or tax reasons.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Deletion may not be reversible unless RELove offers a
                  recovery period.
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6">
              <p className="text-sm text-gray-700">
                This Account Deletion Policy explains how users may close
                their RELove account and what happens to personal data after
                an account-deletion request.
              </p>

              <p className="mt-4 text-sm text-gray-700">
                This Policy should be read together with our Privacy Centre,
                Privacy Policy, Your Privacy Rights &amp; Data Requests
                Policy, Terms &amp; Conditions, Buyer Protection &amp; Refund
                Policy, and Payment, Fees &amp; Payout Policy.
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
                For account deletion or privacy matters, reach us below.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Privacy Email</p>
                  <p className="mt-1 text-white/70">[PRIVACY EMAIL]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Account Support</p>
                  <p className="mt-1 text-white/70">[SUPPORT EMAIL]</p>
                </div>
              </div>
              <p className="mt-4 text-white/70">Telephone: [TELEPHONE NUMBER]</p>
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