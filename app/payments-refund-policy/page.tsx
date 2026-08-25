"use client";

import { useState, useMemo, useRef, useEffect } from "react";

/**
 * PaymentPolicy
 *
 * Renders RELove's Payment, Fees & Payout Policy.
 * - Content lives in the `SECTIONS` array below (easy to update without touching layout/markup).
 * - Sticky, scrollspy'd table of contents on desktop; collapsible <select> jump-menu on mobile.
 * - Sections are individually collapsible (all expanded by default) so the page is scannable.
 * - Bracketed placeholders like [TO BE CONFIRMED] are auto-highlighted so drafts are easy to spot.
 *
 * Usage:
 *   import PaymentPolicy from "@/components/PaymentPolicy";
 *   export default function Page() { return <PaymentPolicy lastUpdated="1 September 2026" />; }
 */

type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "sub"; text: string }; // short inline sub-lead-in, e.g. "For example:"

type Section = {
  id: string;
  number: number;
  title: string;
  blocks: Block[];
};

const p = (text: string): Block => ({ type: "p", text });
const list = (items: string[]): Block => ({ type: "list", items });

const SECTIONS: Section[] = [
  {
    id: "role-in-payments",
    number: 1,
    title: "RELove's Role in Payments",
    blocks: [
      p("RELove operates a marketplace connecting Buyers and Sellers."),
      p("Payments made through RELove may be processed, collected, safeguarded, transferred or paid out by one or more authorised third-party payment service providers."),
      p("Unless RELove has obtained any licence or authorisation required by applicable law, RELove does not itself provide regulated payment services as a licensed financial institution or payment-service provider."),
      p("RELove may technically facilitate payment instructions and transaction information between users and the relevant payment provider."),
    ],
  },
  {
    id: "payment-providers",
    number: 2,
    title: "Payment Service Providers",
    blocks: [
      p("RELove may engage one or more third-party payment providers to provide services such as:"),
      list([
        "Payment acceptance",
        "Payment processing",
        "Card processing",
        "Bank transfers",
        "QR payments",
        "Refunds",
        "Seller payouts",
        "Identity verification",
        "Fraud screening",
        "Account verification",
        "Transaction monitoring",
      ]),
      p("The payment provider may impose its own terms, privacy notice and verification requirements. Users may need to agree to those terms before using particular payment functionality."),
      p("Current payment provider(s): [TO BE CONFIRMED]"),
      p("RELove will update this Policy or relevant Platform information when payment providers are finalised."),
    ],
  },
  {
    id: "supported-methods",
    number: 3,
    title: "Supported Payment Methods",
    blocks: [
      p("Depending on availability, RELove may support payment methods such as:"),
      list([
        "Debit cards",
        "Credit cards",
        "Thai bank payments",
        "QR payments",
        "PromptPay or provider-supported PromptPay functionality",
        "Supported digital wallets",
        "Other payment methods made available through RELove",
      ]),
      p("Available payment methods may vary by user, transaction, device, payment provider, and location. The methods available for a particular purchase will be displayed during checkout."),
    ],
  },
  {
    id: "payment-currency",
    number: 4,
    title: "Payment Currency",
    blocks: [
      p("Unless otherwise stated, transactions through RELove in Thailand will be charged in Thai Baht (THB)."),
      p("If a payment method or financial institution performs currency conversion, the relevant provider may apply its own exchange rate and fees. RELove does not control fees imposed independently by a user's bank, card issuer or payment provider."),
    ],
  },
  {
    id: "buyer-payment",
    number: 5,
    title: "Buyer Payment",
    blocks: [
      p("When purchasing an item, the Buyer must pay the total amount displayed at checkout. The total may include:"),
      list(["Item price", "Buyer Protection fee", "Shipping fee", "Taxes where applicable", "Other clearly disclosed charges"]),
      p("The Buyer will be given an opportunity to review the applicable charges before confirming the transaction."),
    ],
  },
  {
    id: "payment-authorisation",
    number: 6,
    title: "Payment Authorisation",
    blocks: [
      p("A transaction is not considered successfully paid merely because a Buyer has initiated payment. Payment may remain subject to:"),
      list(["Authorisation", "Provider confirmation", "Fraud screening", "Security checks", "Payment-provider processing", "Other verification"]),
      p("RELove may notify the Seller when the transaction has been sufficiently confirmed for shipment. Sellers should not ship based solely on:"),
      list(["Screenshots", "Messages from Buyers", "External payment confirmations", "Representations that money has been transferred"]),
      p("Sellers should rely on the transaction status displayed through RELove."),
    ],
  },
  {
    id: "failed-payments",
    number: 7,
    title: "Failed Payments",
    blocks: [
      p("A payment may fail for reasons including:"),
      list([
        "Insufficient funds",
        "Incorrect payment information",
        "Card rejection",
        "Bank rejection",
        "Payment-provider security rules",
        "Transaction limits",
        "Technical errors",
        "Suspected fraud",
        "Account restrictions",
      ]),
      p("Where payment fails, the transaction may not be completed. The Buyer may be able to try another supported payment method."),
    ],
  },
  {
    id: "payment-processing",
    number: 8,
    title: "Payment Processing",
    blocks: [
      p("Once payment is authorised, the relevant payment provider may process the Buyer's funds according to its payment-service arrangements. Depending on the payment structure, the funds may be:"),
      list([
        "Held by the authorised payment provider",
        "Reserved pending transaction completion",
        "Processed under a marketplace payment arrangement",
        "Otherwise handled according to the provider's regulated payment infrastructure",
      ]),
      p("RELove should not represent customer money as being held by RELove where the funds are legally held or safeguarded by a third-party payment provider."),
    ],
  },
  {
    id: "seller-proceeds",
    number: 9,
    title: "Seller Proceeds",
    blocks: [
      p("For an eligible completed sale, the Seller may receive the item sale price minus any applicable:"),
      list(["Seller fees", "Agreed Platform charges", "Refunds", "Adjustments", "Payment reversals", "Other charges disclosed under the applicable transaction terms"]),
      p("The amount expected to become available to the Seller should be displayed through RELove where practicable."),
    ],
  },
  {
    id: "proceeds-availability",
    number: 10,
    title: "When Seller Proceeds Become Available",
    blocks: [
      p("Seller proceeds will generally become available after the transaction is considered completed under RELove's Buyer Protection process. For example, this may occur when delivery has been confirmed and the Buyer confirms everything is satisfactory, or the Buyer Protection inspection period expires without a valid problem being reported."),
      p("Under RELove's current proposed Buyer Protection model, the standard inspection period is 2 calendar days after confirmed delivery. This period remains subject to final implementation in RELove's transaction system."),
    ],
  },
  {
    id: "early-confirmation",
    number: 11,
    title: "Early Buyer Confirmation",
    blocks: [
      p("Where RELove provides an “Everything Is OK” or similar confirmation function, the Buyer may be able to confirm successful receipt before the standard Buyer Protection period expires."),
      p("Following confirmation, RELove may treat the transaction as completed and begin the Seller payout process. A Buyer should inspect the item before providing final confirmation."),
    ],
  },
  {
    id: "payouts",
    number: 12,
    title: "Payouts to Sellers",
    blocks: [
      p("Seller payouts may be made using payment methods supported by the relevant payment provider. Depending on RELove's final payment architecture, this may include:"),
      list(["Thai bank accounts", "Supported payment accounts", "Other provider-supported payout methods", "A permitted balance mechanism, where legally and operationally supported"]),
      p("RELove payout mechanism: [TO BE CONFIRMED]"),
    ],
  },
  {
    id: "seller-verification",
    number: 13,
    title: "Seller Verification Before Payout",
    blocks: [
      p("Before receiving a payout, a Seller may be required to provide or verify information such as:"),
      list([
        "Legal name",
        "Date of birth",
        "Telephone number",
        "Identity information",
        "Bank account",
        "Payout account",
        "Address",
        "Tax information",
        "Business information, where applicable",
        "Other information required by RELove or the payment provider",
      ]),
      p("Payment providers may perform identity, anti-fraud, sanctions, anti-money-laundering or other legally required checks. Failure to complete required verification may delay or prevent payout."),
    ],
  },
  {
    id: "payout-timing",
    number: 14,
    title: "Payout Timing",
    blocks: [
      p("Once Seller proceeds become available and required verification is complete, the payout will be processed according to the timing applicable to the selected payment method and payment provider. Estimated timing will be shown through RELove where available."),
      p("Actual arrival time may depend on:"),
      list(["Payment provider", "Bank", "Weekends", "Public holidays", "Verification", "Banking-system processing", "Security checks"]),
      p("RELove does not guarantee instant receipt unless expressly stated."),
    ],
  },
  {
    id: "payout-holds",
    number: 15,
    title: "Payout Holds",
    blocks: [
      p("A payout may be delayed or temporarily restricted where reasonably necessary, including where:"),
      list([
        "A Buyer Protection claim is open",
        "A transaction is under investigation",
        "Fraud is suspected",
        "Identity verification is incomplete",
        "Payment verification is incomplete",
        "The payment provider places a restriction",
        "A chargeback has been received",
        "A refund is pending",
        "Prohibited-item activity is suspected",
        "The account has been compromised",
        "Applicable law requires review",
        "Another legitimate security or compliance reason exists",
      ]),
      p("Any hold should be proportionate to the relevant circumstances and applicable law."),
    ],
  },
  {
    id: "balance-wallet",
    number: 16,
    title: "RELove Balance or Wallet",
    blocks: [
      p("RELove will not describe any stored-value functionality as a “wallet”, “e-money account” or similar regulated payment product unless the relevant functionality is lawfully provided under the required regulatory framework."),
      p("If RELove later introduces a balance feature through an authorised payment-service provider, separate terms may apply. At launch, RELove should preferably use provider-managed payment and payout functionality rather than maintaining customer stored value itself."),
    ],
  },
  {
    id: "buyer-protection-fee",
    number: 17,
    title: "Buyer Protection Fee",
    blocks: [
      p("RELove may charge Buyers a Buyer Protection fee for eligible purchases. Where applicable, the fee will be shown before payment is confirmed."),
      p("The fee may be calculated as: [FINAL BUYER PROTECTION PRICING TO BE CONFIRMED]"),
      p("For example, RELove may choose:"),
      list(["A fixed fee", "A percentage of the item price", "A combination of fixed and percentage charges", "Another clearly disclosed pricing method"]),
      p("No fee should be charged on a basis that has not been adequately disclosed before the Buyer commits to the transaction."),
    ],
  },
  {
    id: "seller-fees",
    number: 18,
    title: "Seller Fees",
    blocks: [
      p("RELove may permit ordinary private Sellers to list or sell items without a general Seller commission, or RELove may introduce Seller fees. Any applicable Seller fee must be disclosed before the Seller commits to the relevant paid service or transaction."),
      p("Potential Seller charges may include:"),
      list(["Transaction fees", "Optional promotional services", "Listing boosts", "Subscriptions", "Professional Seller services", "Other optional features"]),
      p("Launch Seller commission: [TO BE CONFIRMED]"),
    ],
  },
  {
    id: "shipping-fees",
    number: 19,
    title: "Shipping Fees",
    blocks: [
      p("Shipping charges may depend on factors such as shipping provider, package size, package weight, destination, service type, promotional discounts, and applicable logistics pricing."),
      p("The relevant shipping charge should be displayed before the Buyer confirms payment where it is known at checkout. Additional charges caused by inaccurate package information may be handled according to the Shipping Policy."),
    ],
  },
  {
    id: "taxes",
    number: 20,
    title: "Taxes",
    blocks: [
      p("Amounts charged through RELove may be subject to applicable taxes. Where RELove is legally required to charge, collect, withhold or account for tax, the relevant amount may be added to or deducted from a transaction as required."),
      p("Professional Sellers remain responsible for their own tax obligations unless applicable law provides otherwise."),
    ],
  },
  {
    id: "fee-transparency",
    number: 21,
    title: "Fee Transparency",
    blocks: [
      p("Before completing a paid transaction, users should be able to understand:"),
      list(["Item price", "RELove fees", "Shipping charges", "Taxes where applicable", "Total Buyer payment", "Expected Seller proceeds where relevant"]),
      p("RELove will not intentionally hide mandatory transaction charges until after purchase confirmation."),
    ],
  },
  {
    id: "fee-changes",
    number: 22,
    title: "Fee Changes",
    blocks: [
      p("RELove may change its fees from time to time. Changes will generally apply only to transactions or paid services initiated after the new pricing becomes effective."),
      p("Where required, RELove will provide appropriate advance notice of material changes. Fees applicable to a completed transaction will not normally be retroactively increased."),
    ],
  },
  {
    id: "promotional-pricing",
    number: 23,
    title: "Promotional Pricing",
    blocks: [
      p("RELove may offer reduced fees, free shipping, promotional credits, waived fees, discounts, referral benefits, or other promotional offers."),
      p("Promotions may be subject to:"),
      list(["Eligibility criteria", "Usage limits", "Expiry dates", "Product restrictions", "Separate terms"]),
      p("Promotion abuse may result in cancellation of the promotional benefit or account restrictions."),
    ],
  },
  {
    id: "refunds",
    number: 24,
    title: "Refunds",
    blocks: [
      p("Where a Buyer is entitled to a refund under the Buyer Protection & Refund Policy or applicable law, RELove may instruct the relevant payment provider to issue the refund. Depending on the circumstances, the refund may include:"),
      list(["Item price", "Buyer Protection fee", "Original shipping charge", "Other eligible amounts"]),
      p("The exact amount depends on the reason for the refund and applicable law."),
    ],
  },
  {
    id: "refund-timing",
    number: 25,
    title: "Refund Timing",
    blocks: [
      p("Once RELove or the payment provider has processed a refund, the time required for it to appear in the Buyer's account may depend on payment method, card issuer, bank, and payment provider."),
      p("The refund may not appear instantly. Where available, RELove may provide an estimated processing period."),
    ],
  },
  {
    id: "partial-refunds",
    number: 26,
    title: "Partial Refunds",
    blocks: [
      p("Where RELove supports partial refunds, they may be used where appropriate under the Buyer Protection process. A partial refund may require agreement between the Buyer and Seller depending on the circumstances and applicable law."),
      p("The amount should be clearly displayed before the settlement is accepted."),
    ],
  },
  {
    id: "cancellation-before-shipment",
    number: 27,
    title: "Transaction Cancellation Before Shipment",
    blocks: [
      p("If a transaction is cancelled before shipment, the Buyer may receive a refund according to the status of the payment and applicable payment-provider rules. Examples may include:"),
      list(["Seller cancellation", "Seller failure to ship", "Payment-processing problems", "Prohibited-item detection", "Fraud prevention", "Cancellation otherwise permitted by RELove"]),
    ],
  },
  {
    id: "seller-failure-to-ship",
    number: 28,
    title: "Seller Failure to Ship",
    blocks: [
      p("If the Seller does not ship within RELove's required shipping period, RELove may cancel the transaction. In that case:"),
      list(["The Buyer may receive a refund", "The Seller will not receive the sale proceeds", "Repeated failures may affect the Seller's account"]),
    ],
  },
  {
    id: "payment-reversals",
    number: 29,
    title: "Payment Reversals",
    blocks: [
      p("A payment may be reversed because of refund, chargeback, payment-provider reversal, fraud, duplicate payment, technical error, invalid transaction, or another legally valid reason."),
      p("Where a reversal occurs after Seller proceeds have already been paid, RELove or the payment provider may seek recovery from the Seller where permitted by applicable law and the applicable payment terms."),
    ],
  },
  {
    id: "chargebacks",
    number: 30,
    title: "Chargebacks",
    blocks: [
      p("A Buyer may have rights through their bank or card issuer to dispute certain payments. Where a chargeback is initiated:"),
      list([
        "Transaction funds may be temporarily restricted",
        "RELove or the payment provider may provide transaction evidence",
        "Seller proceeds may be delayed",
        "The internal dispute process may be affected",
        "The final payment outcome may be determined by the payment network, bank or provider",
      ]),
      p("Users must not initiate fraudulent or abusive chargebacks. Repeated chargeback abuse may lead to account restrictions."),
    ],
  },
  {
    id: "fraud-prevention",
    number: 31,
    title: "Fraud Prevention",
    blocks: [
      p("Payments may be screened for fraud and other suspicious activity. RELove or its providers may analyse information such as account history, transaction patterns, device information, payment information, shipping information, verification information, and other relevant security indicators."),
      p("A transaction may be delayed, declined, cancelled, refunded, or reviewed where reasonably necessary to protect users, RELove or payment providers."),
    ],
  },
  {
    id: "suspicious-transactions",
    number: 32,
    title: "Suspicious Transactions",
    blocks: [
      p("RELove may report or provide information concerning suspicious transactions where required or permitted by applicable law."),
      p("RELove may also cooperate with payment providers, financial institutions, regulators, courts, law-enforcement authorities, and other competent authorities."),
    ],
  },
  {
    id: "incorrect-payout-info",
    number: 33,
    title: "Incorrect Payout Information",
    blocks: [
      p("Sellers are responsible for providing accurate payout details. If a payout fails because the Seller supplied incorrect information, additional processing time may be required."),
      p("A Seller must never provide another person's payment details without lawful authority."),
    ],
  },
  {
    id: "payout-account-ownership",
    number: 34,
    title: "Payout Account Ownership",
    blocks: [
      p("RELove or its payment provider may require the name on the payout account to correspond with the verified Seller identity. Additional verification may be required where information does not match."),
      p("This is intended to reduce fraud, identity theft, payment diversion, and other misuse."),
    ],
  },
  {
    id: "currency-conversion",
    number: 35,
    title: "Currency Conversion",
    blocks: [
      p("Where a payment or payout involves currency conversion, the relevant bank or payment provider may apply exchange rates, conversion fees, international transaction fees, or other charges. These charges may be outside RELove's control."),
    ],
  },
  {
    id: "third-party-fees",
    number: 36,
    title: "Third-Party Fees",
    blocks: [
      p("A user's bank, card issuer, payment provider or other financial service may independently charge fees. Unless RELove expressly states otherwise, RELove is not responsible for fees imposed solely by those third parties."),
    ],
  },
  {
    id: "off-platform-payments",
    number: 37,
    title: "Off-Platform Payments",
    blocks: [
      p("Users should not complete RELove marketplace transactions using payment methods outside RELove's designated transaction process where RELove requires Platform payment. Examples include:"),
      list(["Private bank transfers", "Cash arrangements", "External payment links", "Direct wallet transfers", "Other payment mechanisms intended to bypass RELove"]),
      p("Off-platform payments may not receive Buyer Protection, dispute support, payment tracking, or other RELove protections. Attempting to move transactions outside RELove to avoid fees may violate the Terms & Conditions."),
    ],
  },
  {
    id: "cash-on-delivery",
    number: 38,
    title: "Cash on Delivery",
    blocks: [
      p("RELove may support Cash on Delivery (“COD”) only where expressly offered through an approved shipping and payment process."),
      p("If COD is introduced, separate rules may apply concerning eligibility, collection, Seller payout, failed delivery, refusal of delivery, return shipping, fees, and Buyer Protection."),
      p("COD is not covered by this Policy unless RELove expressly activates the service."),
    ],
  },
  {
    id: "provider-interruptions",
    number: 39,
    title: "Payment Provider Interruptions",
    blocks: [
      p("Payment functionality may occasionally be affected by systems outside RELove's direct control, such as banking outages, payment-network outages, provider maintenance, payment-provider security incidents, or technical failures."),
      p("RELove will take reasonable measures to restore affected functionality but cannot guarantee uninterrupted operation of independent third-party payment systems."),
    ],
  },
  {
    id: "payment-security",
    number: 40,
    title: "Payment Security",
    blocks: [
      p("RELove and its payment providers may implement measures such as encrypted communications, tokenised payment information, authentication, fraud detection, transaction monitoring, access controls, and other security controls."),
      p("Users must also protect their RELove and payment-account credentials. RELove will never legitimately ask a Seller to provide a payment-card PIN or online-banking password through ordinary marketplace messages."),
    ],
  },
  {
    id: "phishing",
    number: 41,
    title: "Phishing and Fake Payment Messages",
    blocks: [
      p("Users should be cautious of messages claiming that payment has been made, additional payment details are required, a Seller must pay money to receive proceeds, account credentials must be provided, or an external link must be opened to confirm a sale."),
      p("Always verify transaction status within the official RELove Platform. Suspicious payment messages should be reported to RELove."),
    ],
  },
  {
    id: "data-processing",
    number: 42,
    title: "Data Processing",
    blocks: [
      p("Payment-related personal data may be processed by RELove and relevant payment providers for purposes including processing transactions, preventing fraud, verifying identity, complying with law, resolving disputes, and processing payouts."),
      p("Further information is provided in RELove's Privacy Policy and the privacy notices of the relevant payment providers."),
    ],
  },
  {
    id: "records",
    number: 43,
    title: "Records",
    blocks: [
      p("RELove and payment providers may retain transaction records where necessary for accounting, tax, fraud prevention, dispute resolution, regulatory compliance, audits, and legal claims."),
      p("Retention will be handled in accordance with applicable law and the relevant privacy policies."),
    ],
  },
  {
    id: "payment-complaints",
    number: 44,
    title: "Payment Complaints",
    blocks: [
      p("Users should contact RELove where a payment-related issue concerns a marketplace transaction, Buyer Protection, Seller proceeds, RELove fees, or transaction status."),
      p("Where the issue relates directly to a regulated payment service provided independently by the payment provider, the user may also be directed to that provider's complaint process."),
    ],
  },
  {
    id: "changes-to-policy",
    number: 45,
    title: "Changes to This Policy",
    blocks: [
      p("RELove may update this Policy to reflect changes to payment providers, new payment methods, fee changes, payout arrangements, new Platform functionality, legal requirements, or regulatory guidance."),
      p("Where required, RELove will provide appropriate notice of material changes. The “Last updated” date at the beginning of this Policy identifies the most recent revision."),
    ],
  },
  {
    id: "contact",
    number: 46,
    title: "Contact RELove",
    blocks: [
      p("For payment or payout questions:"),
      list([
        "บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)",
        "Juristic Person Registration No. 0115569025684",
      ]),
      p("Registered Office: 16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi District, Samut Prakan Province, Thailand"),
      p("Payment Support: [SUPPORT EMAIL]"),
      p("Telephone: [TELEPHONE NUMBER]"),
      p("Where a regulated payment service is provided by a third-party payment provider, additional contact and complaint information for that provider may also be displayed through RELove."),
    ],
  },
];

const RELATED_POLICIES = [
  "Buyer Protection & Refund Policy",
  "Seller Rules",
  "Shipping Policy",
  "Privacy Policy",
];

/** Highlights bracketed placeholders like [TO BE CONFIRMED] so drafts are easy to spot at a glance. */
function renderWithPlaceholders(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) =>
    part.startsWith("[") && part.endsWith("]") ? (
      <mark
        key={i}
        className="rounded bg-[#cb6f4d]/10 px-1.5 py-0.5 font-medium text-[#a8552f] ring-1 ring-[#cb6f4d]/25"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function SectionBlock({ block }: { block: Block }) {
  if (block.type === "p") {
    return <p className="text-[15px] leading-relaxed text-neutral-700">{renderWithPlaceholders(block.text)}</p>;
  }
  if (block.type === "list") {
    return (
      <ul className="grid gap-1.5 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-neutral-700">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#cb6f4d]" aria-hidden="true" />
            <span>{renderWithPlaceholders(item)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function PaymentPolicy() {
  const lastUpdated = "[DATE]";
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.id))
  );
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const [query, setQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true;
      return s.blocks.some((b) => {
        if (b.type === "p" || b.type === "sub") return b.text.toLowerCase().includes(q);
        return b.items.some((it) => it.toLowerCase().includes(q));
      });
    });
  }, [query]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActiveId(topMost.target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filteredSections.length]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    setOpenSections((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#cb6f4d]">Legal · RELove</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Payment, Fees &amp; Payout Policy
          </h1>
          {/* <p className="mt-2 text-sm text-neutral-500">Last updated: {lastUpdated}</p> */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600">
            This Policy explains how payments, fees, Seller proceeds, refunds and payouts are handled
            through RELove. It forms part of the RELove Terms &amp; Conditions and should be read
            together with our:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {RELATED_POLICIES.map((name) => (
              <li
                key={name}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          {/* TOC — desktop sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2">
              <label htmlFor="policy-search-desktop" className="sr-only">
                Search this policy
              </label>
              <input
                id="policy-search-desktop"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search policy…"
                className="mb-4 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#cb6f4d] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]"
              />
              <nav aria-label="Table of contents">
                <ol className="space-y-0.5 border-l border-neutral-200 text-sm">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(s.id)}
                        className={`-ml-px block w-full truncate border-l-2 py-1 pl-3 text-left transition-colors ${
                          activeId === s.id
                            ? "border-[#cb6f4d] font-medium text-[#a8552f]"
                            : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                        }`}
                      >
                        <span className="tabular-nums text-neutral-400">{s.number}.</span> {s.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          {/* Mobile jump-menu + search */}
          <div className="mb-6 flex flex-col gap-2 lg:hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policy…"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#cb6f4d] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]"
            />
            <select
              onChange={(e) => e.target.value && scrollToSection(e.target.value)}
              value=""
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:border-[#cb6f4d] focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]"
            >
              <option value="">Jump to section…</option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <main className="min-w-0">
            {filteredSections.length === 0 ? (
              <p className="py-12 text-center text-sm text-neutral-500">
                No sections match “{query}”.
              </p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {filteredSections.map((section) => {
                  const isOpen = openSections.has(section.id);
                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      ref={(el) => {
                        sectionRefs.current[section.id] = el;
                      }}
                      className="scroll-mt-8 py-6"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <h2 className="text-lg font-semibold text-neutral-900">
                          <span className="mr-2 text-[#cb6f4d]">{section.number}.</span>
                          {section.title}
                        </h2>
                        <svg
                          className={`mt-1.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="mt-3 grid gap-3">
                          {section.blocks.map((block, i) => (
                            <SectionBlock key={i} block={block} />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer entity block */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-500 sm:px-6 lg:px-8">
          <p className="font-medium text-neutral-700">RELove is operated by:</p>
          <p className="mt-1">บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)</p>
          <p>Juristic Person Registration No. 0115569025684</p>
          <p className="mt-1">
            16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi
            District, Samut Prakan Province, Thailand
          </p>
        </div>
      </footer>
    </div>
  );
}