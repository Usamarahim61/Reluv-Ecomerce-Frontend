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
  title: "Buyer Protection & Refund Policy | RELove",
  description:
    "When a Buyer may be eligible for protection, a refund, return, or other remedy for purchases completed through RELove.",
};

const sections = [
  {
    id: "1",
    title: "What Is RELove Buyer Protection?",
    body: `RELove Buyer Protection is designed to provide additional protection for eligible purchases completed through the RELove checkout and payment system.

Depending on the circumstances, Buyer Protection may apply where: an item is not delivered; the Buyer receives the wrong item; an item is significantly different from its listing; an item arrives materially damaged; there is credible evidence that an item is counterfeit; or another problem expressly covered by this Policy occurs.

Buyer Protection is subject to the requirements, procedures and deadlines in this Policy. Nothing in this Policy limits rights or remedies that cannot lawfully be excluded under applicable Thai law.`,
  },
  {
    id: "2",
    title: "Transactions Covered",
    body: `Buyer Protection applies only to eligible transactions: completed through RELove; paid through RELove's designated payment process; involving items permitted under RELove policies; and otherwise meeting the requirements of this Policy.

Transactions completed outside RELove are not covered.

For example, if a Buyer and Seller arrange payment directly by bank transfer outside RELove, RELove may be unable to provide Buyer Protection.`,
  },
  {
    id: "3",
    title: "How Buyer Protection Works",
    body: `For an eligible transaction: the Buyer completes payment through RELove; the Seller ships the item using the applicable shipping process; delivery is tracked or otherwise confirmed; the Buyer receives an inspection period; if no eligible problem is reported within that period, the transaction may be treated as completed; and the Seller's proceeds may then be released according to RELove's payment process.

If the Buyer reports an eligible problem within the applicable period, release of the Seller's proceeds may be temporarily suspended while the matter is reviewed.`,
  },
  {
    id: "4",
    title: "Buyer Inspection Period",
    body: `The Buyer should inspect the item promptly after confirmed delivery.

Unless a different period is shown for a particular transaction, the Buyer must report a Buyer Protection problem within 2 calendar days after confirmed delivery.

For example: if delivery is confirmed on 10 January, the Buyer should report an eligible problem no later than the end of 12 January, subject to the timing rules displayed by RELove. RELove may define the exact expiry time in the Platform interface.

If no eligible problem is reported within the applicable period, RELove may treat the transaction as completed and release the Seller's proceeds. Mandatory legal rights remain unaffected.`,
  },
  {
    id: "5",
    title: "Item Not Received",
    body: `Buyer Protection may apply if: tracking does not confirm delivery; the shipment is confirmed lost by the shipping provider; the shipment is returned without being successfully delivered through no fault of the Buyer; or other reliable evidence establishes that the Buyer did not receive the item.

RELove may investigate using: shipping-provider tracking; delivery confirmation; pickup records; Seller information; Buyer information; and other relevant evidence.

Where RELove determines that the item was not successfully delivered and the Buyer is eligible under this Policy, the Buyer may receive a refund.`,
  },
  {
    id: "6",
    title: "Significantly Not as Described",
    body: `Buyer Protection may apply where the item received differs materially from the information provided in the listing.

Examples may include: a different item being received; an incorrect brand being stated; an incorrect model; materially incorrect colour where colour was significant to the listing; a materially different size from that stated; significant undisclosed damage; major stains, holes, tears or defects not disclosed; missing major components; materially different condition; evidence that a branded item is counterfeit; or another substantial discrepancy affecting the nature or value of the item.

Minor differences that would reasonably be expected from a used item may not qualify.`,
  },
  {
    id: "7",
    title: 'What Normally Does Not Count as "Significantly Not as Described"',
    body: `Buyer Protection will generally not apply merely because: the Buyer changes their mind; the Buyer no longer wants the item; the item does not fit despite the Seller providing accurate size information; the Buyer dislikes the colour where the listing was reasonably accurate; the Buyer expected a different level of quality despite the condition being accurately described; minor signs of ordinary second-hand use were visible or described; the Buyer failed to read the listing; the Buyer purchased the wrong item by mistake; or the problem was clearly disclosed before purchase.

This does not limit any mandatory statutory right that applies to the transaction.`,
  },
  {
    id: "8",
    title: "Damaged Items",
    body: `Buyer Protection may apply where an item arrives materially damaged and the damage: was not disclosed in the listing; and was not reasonably apparent from the listing photographs.

Where damage may have occurred during shipping, RELove may also consider: packaging; photographs of the package; photographs taken immediately after delivery; shipping-provider records; tracking information; and other available evidence.

Sellers are responsible for packaging items appropriately for transport.`,
  },
  {
    id: "9",
    title: "Counterfeit Items",
    body: `Counterfeit goods are prohibited on RELove. Where a Buyer reasonably believes an item is counterfeit, the Buyer should report the issue within the applicable Buyer Protection period where possible.

RELove may request evidence including: photographs; labels; serial numbers; receipts; authenticity documentation; expert opinions; or other relevant information. RELove may also seek information from the Seller.

Where RELove determines that an item is likely counterfeit, RELove may: refund the Buyer; prevent Seller payout; remove the listing; restrict or suspend the Seller's account; request additional verification; preserve relevant evidence; or take other action permitted or required by law.

A counterfeit item must not automatically be returned if returning it would be unlawful or inappropriate. RELove will determine the appropriate process based on the circumstances and applicable law.`,
  },
  {
    id: "10",
    title: "Wrong Item Received",
    body: `If the Buyer receives an item different from the item purchased, Buyer Protection may apply.

The Buyer should provide photographs showing: the item received; packaging; shipping label where available; and any other information requested by RELove.

Where the claim is validated, RELove may require return of the incorrect item before issuing or completing the refund.`,
  },
  {
    id: "11",
    title: "Missing Items or Components",
    body: `Where a listing includes multiple items or essential components, Buyer Protection may apply if a material component is missing.

For example: a pair of shoes but only one shoe is delivered; a device advertised with an essential included component that is missing; or multiple items sold as a bundle but only part of the bundle is delivered.

Minor accessories not expressly included in the listing may not qualify.`,
  },
  {
    id: "12",
    title: "How to Report a Problem",
    body: `To request Buyer Protection, the Buyer must use the appropriate RELove transaction interface.

The Buyer should select [I Have a Problem] before the Buyer Protection period expires.

The Buyer should explain the issue accurately and provide requested supporting evidence. The Seller's payout may be temporarily suspended while the case is reviewed.`,
  },
  {
    id: "13",
    title: "Evidence",
    body: `RELove may ask the Buyer or Seller to provide evidence including: photographs; videos; listing screenshots; packaging photographs; shipping labels; tracking records; purchase receipts; proof of authenticity; product serial numbers; communications; repair assessments; or other information reasonably relevant to the dispute.

Evidence should be authentic and unaltered. Providing fabricated or manipulated evidence may result in denial of the claim and account restrictions.`,
  },
  {
    id: "14",
    title: "Seller Response",
    body: `Where appropriate, RELove may give the Seller an opportunity to respond to the Buyer's claim.

The Seller may be asked to provide: comments; photographs; original listing information; proof of authenticity; proof of shipment; receipts; or other supporting evidence.

Failure to respond within the period specified by RELove may result in RELove deciding the dispute based on the available information.`,
  },
  {
    id: "15",
    title: "Resolving a Buyer Protection Claim",
    body: `Depending on the circumstances, RELove may: reject the claim; request additional evidence; allow the parties to resolve the issue; approve a return; issue a full refund; issue another remedy where appropriate; release funds to the Seller; or take another action consistent with this Policy and applicable law.

The outcome will depend on the evidence and circumstances of the transaction.`,
  },
  {
    id: "16",
    title: "Returns",
    body: `Where RELove approves a return, the Buyer must: return the correct item; return the item in substantially the same condition in which it was received, except for reasonable inspection; follow RELove's return instructions; use the specified shipping method where applicable; and dispatch the item within the deadline provided.

A Buyer must not deliberately damage, alter, use or substitute an item before returning it.`,
  },
  {
    id: "17",
    title: "Return Deadline",
    body: `Where RELove authorises a return, the Buyer should generally dispatch the item within 5 calendar days after RELove authorises the return, unless RELove specifies another period.

Failure to return the item within the applicable deadline may result in rejection of the refund request. Mandatory legal rights remain unaffected.`,
  },
  {
    id: "18",
    title: "Return Shipping Costs",
    body: `For an approved Buyer Protection claim caused by the Seller's material breach, such as materially inaccurate description, wrong item, undisclosed major defect, or another Seller-caused issue, RELove may require the Seller to bear reasonable return-shipping costs, or RELove may provide or subsidise return shipping according to the transaction process.

If a return is permitted for another reason, the Buyer may be responsible for return shipping.

The Platform should show the applicable responsibility before the return is confirmed.`,
  },
  {
    id: "19",
    title: "Refund Amount",
    body: `Where a full refund is approved, the Buyer may receive a refund of eligible amounts paid through RELove, which may include: item price; applicable Buyer Protection fee; and original shipping charge, depending on the reason for the refund and applicable law.

Return shipping may be handled separately. The exact amount will be shown to the Buyer where practicable before the refund is completed.`,
  },
  {
    id: "20",
    title: "Refund Method",
    body: `Refunds will generally be made through the original payment method or another method permitted by the relevant payment provider.

Processing time may depend on: payment method; bank; card issuer; and payment provider.

RELove is not responsible for processing delays caused solely by the Buyer's bank or payment provider after RELove has properly instructed the refund.`,
  },
  {
    id: "21",
    title: "Partial Refunds",
    body: `RELove may support partial refunds where operationally available and appropriate.

A partial refund should only be used where: both parties agree where required; or RELove determines that a partial remedy is appropriate and lawful.

A Buyer should not be required to accept a partial refund instead of another remedy required by applicable law.`,
  },
  {
    id: "22",
    title: "Buyer Changed Their Mind",
    body: `For ordinary C2C transactions between private individuals, RELove Buyer Protection does not generally provide a return solely because the Buyer changed their mind.

However, where the Seller is acting as a business or professional seller, additional consumer rights may apply under Thai law. Nothing in this Policy removes such mandatory rights.`,
  },
  {
    id: "23",
    title: "Professional Sellers",
    body: `If RELove permits professional or business Sellers, transactions involving those Sellers may be subject to additional consumer-protection obligations.

Professional Sellers are responsible for complying with applicable laws concerning matters such as: consumer information; contractual terms; returns; refunds; product safety; warranties; and other consumer rights.

Where mandatory law gives the Buyer rights exceeding RELove Buyer Protection, the mandatory legal rights prevail.`,
  },
  {
    id: "24",
    title: "Buyer Protection Fee",
    body: `RELove may charge a Buyer Protection fee for eligible transactions. Where such a fee applies: it will be displayed before purchase; the Buyer will be able to review the charge before confirming payment; and the amount or calculation method will be explained through the Platform.

Payment of the Buyer Protection fee does not create rights beyond those described in this Policy and mandatory applicable law.`,
  },
  {
    id: "25",
    title: "Abuse of Buyer Protection",
    body: `Buyer Protection must not be abused. Prohibited conduct includes: falsely claiming an item was not received; falsely claiming damage; replacing an authentic item with another item; returning a different item; deliberately damaging an item; manipulating photographs; submitting fabricated evidence; chargeback abuse; colluding with another user; or repeatedly submitting dishonest claims.

RELove may restrict or terminate accounts involved in Buyer Protection abuse. Where appropriate, RELove may also provide relevant information to payment providers or competent authorities.`,
  },
  {
    id: "26",
    title: "Seller Protection",
    body: `Buyer Protection does not mean that every Buyer claim will automatically succeed. RELove will consider relevant evidence from both parties.

Where a claim is unsupported or RELove determines that the Seller correctly fulfilled the transaction, RELove may: reject the claim; complete the transaction; and release the Seller's proceeds.`,
  },
  {
    id: "27",
    title: "Payment Chargebacks",
    body: `If a Buyer initiates a chargeback or payment dispute directly through their bank or payment provider, RELove may: provide transaction evidence to the payment provider; temporarily restrict relevant funds; suspend the internal Buyer Protection process where necessary; investigate the transaction; or restrict an account where chargeback abuse is suspected.

Users must not use chargebacks fraudulently.`,
  },
  {
    id: "28",
    title: "Shipping Provider Claims",
    body: `Where loss or damage appears to result from shipping, RELove may submit or assist with a claim against the relevant shipping provider where supported by the service arrangement.

The Buyer and Seller may be required to provide information requested by the shipping provider. Compensation available from the shipping provider may be subject to the provider's terms, limitations and insurance arrangements.`,
  },
  {
    id: "29",
    title: "Transactions Outside RELove",
    body: `RELove Buyer Protection does not cover payments or transactions deliberately completed outside RELove.

Examples include: direct bank transfers between users; cash payments arranged privately; external payment links; transactions completed through another marketplace; or other payment arrangements that bypass RELove.

Users who transact outside RELove assume additional risk.`,
  },
  {
    id: "30",
    title: "Events Outside the Seller's Control",
    body: `A Seller will not automatically be responsible for every event outside the Seller's reasonable control.

When determining a claim, RELove may distinguish between: Seller misconduct; shipping-provider problems; Buyer conduct; technical errors; and circumstances outside either party's control.

This may affect the appropriate remedy and who ultimately bears the cost.`,
  },
  {
    id: "31",
    title: "RELove's Role in Disputes",
    body: `RELove may facilitate disputes between Buyers and Sellers as part of Buyer Protection. RELove is not a court or governmental authority.

Our Buyer Protection determination concerns the operation of RELove's marketplace, transaction system and related services. Nothing prevents a user from exercising rights available under applicable law or bringing a matter before a competent authority.`,
  },
  {
    id: "32",
    title: "Complaints About a Decision",
    body: `Where RELove provides an appeal or complaint process, a user who disagrees with a Buyer Protection decision may submit a review request within the period specified by RELove.

The user should identify: the transaction; the decision being challenged; the reason for disagreement; and any additional relevant evidence.

Repeated requests containing no new material information may be closed. Further information is available in the Complaints & Dispute Resolution Policy.`,
  },
  {
    id: "33",
    title: "Fraud Investigations",
    body: `RELove may delay a refund or payout where reasonably necessary to investigate suspected: fraud; account takeover; payment abuse; counterfeit activity; return fraud; identity misuse; or other serious misconduct.

Any restriction should be proportionate to the circumstances and applicable law.`,
  },
  {
    id: "34",
    title: "Mandatory Legal Rights",
    body: `This Policy provides contractual protection through RELove. It does not exclude, restrict or replace rights that Buyers or Sellers have under mandatory applicable Thai law.

Where a provision of this Policy conflicts with mandatory law, the mandatory law prevails.`,
  },
  {
    id: "35",
    title: "Changes to This Policy",
    body: `RELove may update this Policy to reflect: changes to Buyer Protection; payment processes; shipping arrangements; Platform functionality; fraud risks; legal requirements; or regulatory guidance.

Where required, RELove will provide appropriate notice of material changes. The version applicable to a transaction will generally be the version in effect when the relevant transaction was made, subject to applicable law.`,
  },
  {
    id: "36",
    title: "Contact RELove",
    body: `For transaction problems, use the dispute functionality available within the relevant RELove order.

For other questions:
บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)
Juristic Person Registration No. 0115569025684

Registered Office: 16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi District, Samut Prakan Province, Thailand

For formal complaints, please see our Complaints & Dispute Resolution Policy.`,
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: "Purchases through RELove are covered",
    text: "Buyer Protection applies to eligible transactions paid through RELove's checkout.",
  },
  {
    icon: Sparkles,
    title: "Report within the window",
    text: "Buyers must report an eligible problem within 2 days of confirmed delivery, unless shown otherwise.",
  },
  {
    icon: TriangleAlert,
    title: "Not every issue qualifies",
    text: "Changing your mind or minor used-item wear are not covered by Buyer Protection.",
  },
  {
    icon: MessageCircleMore,
    title: "Evidence speeds things up",
    text: "Photos, tracking, and other evidence help RELove review a claim quickly.",
  },
];

const quickLinks = [
  { label: "What's covered", href: "#section-1" },
  { label: "Inspection period", href: "#section-4" },
  { label: "Counterfeit items", href: "#section-9" },
  { label: "How to report", href: "#section-12" },
  { label: "Returns & refunds", href: "#section-16" },
  { label: "Complaints", href: "#section-32" },
];

/**
 * Read-only Buyer Protection & Refund Policy page.
 * This component only renders policy content for the user to read —
 * there is no editing, form submission, or management UI here.
 */
export default function BuyerProtectionPolicyPage(): JSX.Element {
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
                Clear guidance for buyers
              </div>
              <h1 className="max-w-2xl font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                Buyer Protection &amp; Refund Policy
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700">
                This policy explains when a Buyer may be eligible for
                protection, a refund, return, or other remedy for purchases
                completed through RELove.
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
                  Buyer Protection only covers transactions paid through
                  RELove's checkout — not payments arranged outside the
                  Platform.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Report an eligible problem within 2 calendar days of
                  confirmed delivery, unless a different period is shown.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Photos and evidence help RELove review Not-as-Described,
                  damage, and counterfeit claims faster.
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6">
              <p className="text-sm text-gray-700">
                This Buyer Protection &amp; Refund Policy (&ldquo;Policy&rdquo;)
                explains when a Buyer may be eligible for protection, a
                refund, return, or other remedy for purchases completed
                through RELove.
              </p>

              <p className="mt-4 text-sm text-gray-700">
                This Policy forms part of the RELove Terms &amp; Conditions.
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
                      <p key={i} className="text-sm leading-7 text-gray-700">
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
                For transaction problems, use the dispute functionality
                available within the relevant RELove order. For other
                questions, reach us below.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Buyer Protection Support</p>
                  <p className="mt-1 text-white/70">[SUPPORT EMAIL]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Payment / refund requests</p>
                  <p className="mt-1 text-white/70">[PAYMENTS EMAIL]</p>
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