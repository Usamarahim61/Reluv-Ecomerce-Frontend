"use client";

import { useState, useMemo, useRef, useEffect } from "react";

/**
 * ProhibitedItemsPolicy
 *
 * Renders RELove's Prohibited & Restricted Items Policy.
 * - Content lives in the `SECTIONS` array below (easy to update without touching layout/markup).
 * - Sticky, scrollspy'd table of contents on desktop; collapsible <select> jump-menu on mobile.
 * - Sections are individually collapsible (all expanded by default) so the page is scannable.
 * - Bracketed placeholders like [DATE] are auto-highlighted so drafts are easy to spot.
 * - Restricted-vs-prohibited severity is colour-coded on each section for quick scanning.
 * - Structurally mirrors components/PaymentPolicy.tsx and TermsAndConditions.tsx for a
 *   consistent legal-docs family.
 *
 * Usage:
 *   import ProhibitedItemsPolicy from "@/components/ProhibitedItemsPolicy";
 *   export default function Page() { return <ProhibitedItemsPolicy lastUpdated="1 September 2026" />; }
 */

type Block = { type: "p"; text: string } | { type: "list"; items: string[] };

type Severity = "prohibited" | "restricted" | "info";

type Section = {
  id: string;
  number: string; // string, not int — the source doc uses "2.1" style sub-numbering
  title: string;
  severity: Severity;
  blocks: Block[];
};

const p = (text: string): Block => ({ type: "p", text });
const list = (items: string[]): Block => ({ type: "list", items });

const SEVERITY_LABEL: Record<Severity, string> = {
  prohibited: "Prohibited",
  restricted: "Restricted",
  info: "Policy",
};

const SEVERITY_CLASSES: Record<Severity, string> = {
  prohibited: "bg-red-50 text-red-700 ring-1 ring-red-200",
  restricted: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  info: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
};

const SECTIONS: Section[] = [
  {
    id: "general-rule",
    number: "1",
    title: "General Rule",
    severity: "info",
    blocks: [
      p("You may only list items that:"),
      list([
        "You have the legal right to sell",
        "May lawfully be sold in Thailand",
        "Comply with applicable product-safety and regulatory requirements",
        "Comply with RELove's Terms & Conditions",
        "Comply with this Policy and any category-specific rules",
      ]),
      p("An item being available for sale elsewhere does not mean it is permitted on RELove."),
      p("RELove may impose restrictions that are stricter than the minimum requirements of applicable law where we reasonably consider this necessary for user safety, regulatory compliance or marketplace integrity."),
    ],
  },
  {
    id: "prohibited-items-intro",
    number: "2",
    title: "Prohibited Items",
    severity: "prohibited",
    blocks: [
      p("The following categories must not be listed, advertised, sold or purchased through RELove unless RELove expressly states otherwise."),
    ],
  },
  {
    id: "illegal-goods",
    number: "2.1",
    title: "Illegal Goods",
    severity: "prohibited",
    blocks: [
      p("You must not list:"),
      list([
        "Goods whose possession, sale, distribution or supply is unlawful",
        "Goods obtained through unlawful activity",
        "Products prohibited from sale in Thailand",
        "Illegally imported goods",
        "Goods requiring an authorisation that the Seller does not possess",
        "Products otherwise prohibited under applicable law",
      ]),
    ],
  },
  {
    id: "counterfeit-goods",
    number: "3",
    title: "Counterfeit and Infringing Goods",
    severity: "prohibited",
    blocks: [
      p("Counterfeit goods are strictly prohibited. You must not list:"),
      list([
        "Counterfeit branded products",
        "Replicas presented using another person's trademark without authorisation",
        "Fake designer goods",
        "Counterfeit accessories",
        "Counterfeit electronics",
        "Counterfeit cosmetics",
        "Counterfeit certificates of authenticity",
        "Unauthorised reproductions",
        "Pirated products",
        "Other items that unlawfully infringe intellectual property rights",
      ]),
      p("Examples include a fake handbag bearing a luxury brand's trademark or counterfeit branded shoes."),
      p("Writing terms such as “replica”, “AAA”, “mirror quality”, “1:1”, “inspired copy”, “not authentic” or similar wording does not make a counterfeit item acceptable."),
      p("If an item is counterfeit, do not list it on RELove."),
    ],
  },
  {
    id: "stolen-goods",
    number: "4",
    title: "Stolen Goods",
    severity: "prohibited",
    blocks: [
      p("Stolen goods are strictly prohibited. You must have the legal right to sell every item you list."),
      p("RELove may request information reasonably necessary to establish ownership or lawful possession of an item. Where we reasonably suspect that an item is stolen, RELove may:"),
      list([
        "Remove the listing",
        "Restrict the transaction",
        "Suspend the account",
        "Preserve relevant records",
        "Cooperate with competent authorities where required or permitted by law",
      ]),
    ],
  },
  {
    id: "weapons",
    number: "5",
    title: "Weapons, Ammunition and Explosives",
    severity: "prohibited",
    blocks: [
      p("RELove does not permit listings for weapons or dangerous weapon-related products, including:"),
      list([
        "Firearms",
        "Guns",
        "Firearm components",
        "Ammunition",
        "Bullets",
        "Explosives",
        "Explosive devices",
        "Bombs",
        "Explosive components",
        "Prohibited weapon accessories",
        "Other weapons whose sale through RELove would be unlawful or create unacceptable safety risks",
      ]),
      p("RELove may also prohibit knives, weapon-like products and other dangerous items depending on their nature, intended use and applicable law."),
    ],
  },
  {
    id: "drugs",
    number: "6",
    title: "Drugs, Narcotics and Controlled Substances",
    severity: "prohibited",
    blocks: [
      p("You must not list:"),
      list([
        "Illegal drugs",
        "Narcotics",
        "Psychotropic substances sold unlawfully",
        "Controlled substances",
        "Drug mixtures",
        "Substances intended for unlawful drug use",
        "Products containing prohibited substances",
      ]),
      p("Items containing cannabis, hemp, narcotic, psychotropic or other controlled ingredients may also be prohibited or restricted depending on applicable Thai law."),
    ],
  },
  {
    id: "medicines",
    number: "7",
    title: "Medicines and Pharmaceutical Products",
    severity: "prohibited",
    blocks: [
      p("RELove does not permit the sale of:"),
      list([
        "Prescription medicines",
        "Specially controlled medicines",
        "Unregistered medicines",
        "Counterfeit medicines",
        "Medicines requiring professional supervision",
        "Unlawfully imported medicines",
        "Other pharmaceutical products that may not lawfully be sold through the Platform",
      ]),
      p("RELove may prohibit additional categories of medicines even where limited forms of sale may otherwise be permitted by law."),
    ],
  },
  {
    id: "e-cigarettes",
    number: "8",
    title: "E-Cigarettes and Vaping Products",
    severity: "prohibited",
    blocks: [
      p("RELove prohibits:"),
      list([
        "Electronic cigarettes",
        "Vaping devices",
        "Vape liquids",
        "E-cigarette liquids",
        "Cartridges",
        "Disposable vapes",
        "Products or components whose sale is prohibited under applicable Thai law",
      ]),
    ],
  },
  {
    id: "alcohol",
    number: "9",
    title: "Alcohol and Intoxicating Products",
    severity: "prohibited",
    blocks: [
      p("Users must not list alcoholic beverages or other intoxicating products where online sale through RELove is prohibited or otherwise inconsistent with applicable law. This includes products such as:"),
      list(["Spirits", "Wine", "Beer", "Other alcoholic beverages"]),
    ],
  },
  {
    id: "tobacco",
    number: "10",
    title: "Tobacco and Nicotine Products",
    severity: "prohibited",
    blocks: [
      p("RELove does not permit the sale of tobacco, nicotine or similar regulated products where such sale would violate applicable law or RELove's marketplace rules. This may include:"),
      list(["Cigarettes", "Tobacco", "Nicotine products", "E-cigarettes", "Vaping products"]),
    ],
  },
  {
    id: "adult-products",
    number: "11",
    title: "Sex Toys and Certain Adult Products",
    severity: "prohibited",
    blocks: [
      p("RELove does not permit sex toys or other adult products whose sale, importation or distribution is prohibited under applicable Thai law."),
      p("Sexually explicit or pornographic material that violates applicable law or RELove's content rules is also prohibited."),
    ],
  },
  {
    id: "hazardous-materials",
    number: "12",
    title: "Hazardous Materials",
    severity: "prohibited",
    blocks: [
      p("You must not list dangerous substances or materials that pose an unacceptable risk to users, shipping providers or the public. Examples may include:"),
      list([
        "Explosives",
        "Highly flammable materials",
        "Toxic chemicals",
        "Corrosive substances",
        "Radioactive materials",
        "Prohibited pesticides",
        "Dangerous industrial chemicals",
        "Asbestos-containing products",
        "Other hazardous substances subject to legal restrictions",
      ]),
      p("Products prohibited by RELove's shipping partners may also be unavailable for transactions requiring shipment."),
    ],
  },
  {
    id: "unsafe-recalled",
    number: "13",
    title: "Unsafe, Recalled or Non-Compliant Products",
    severity: "prohibited",
    blocks: [
      p("You must not list products that:"),
      list([
        "Have been officially recalled",
        "Have been prohibited by a competent authority",
        "Are known to present a serious safety risk",
        "Fail mandatory safety requirements",
        "Bear fake safety or conformity marks",
        "Have had safety features intentionally removed",
        "Cannot legally be supplied in their current condition",
      ]),
      p("RELove may remove an item following a safety notification from a regulator, manufacturer, distributor or other reliable source."),
    ],
  },
  {
    id: "food-supplements",
    number: "14",
    title: "Food, Supplements and Consumable Products",
    severity: "restricted",
    blocks: [
      p("RELove may restrict or prohibit food, beverages, dietary supplements and other consumable products. At launch, RELove may prohibit categories of consumable health products unless expressly approved for sale through the Platform."),
      p("Users must never list:"),
      list([
        "Expired food",
        "Unsafe food",
        "Counterfeit food products",
        "Illegally imported food",
        "Food containing prohibited ingredients",
        "Products subject to a safety recall",
        "Supplements using false registration information",
        "Food or supplements that cannot lawfully be sold in Thailand",
      ]),
      p("Where RELove permits a regulated product, the Seller may be required to provide regulatory or product information before the listing is published."),
    ],
  },
  {
    id: "cosmetics",
    number: "15",
    title: "Cosmetics and Personal-Care Products",
    severity: "restricted",
    blocks: [
      p("Cosmetics and personal-care products may be subject to additional restrictions. Where RELove permits cosmetics, Sellers must ensure that the product:"),
      list([
        "May lawfully be sold in Thailand",
        "Complies with applicable Thai FDA requirements",
        "Has the required notification or registration information where applicable",
        "Is appropriately labelled",
        "Is not counterfeit",
        "Is not expired",
        "Has not been recalled",
        "Does not make unlawful or misleading health claims",
      ]),
      p("For hygiene and safety reasons, RELove may prohibit certain used, opened or unsealed cosmetics and personal-care products even where their sale might not otherwise be expressly prohibited by law."),
      p("RELove may require evidence of regulatory compliance before allowing a cosmetic listing."),
    ],
  },
  {
    id: "medical-devices",
    number: "16",
    title: "Medical Devices and Health Products",
    severity: "restricted",
    blocks: [
      p("Medical devices and other regulated health products may only be listed where expressly permitted by RELove and where all applicable legal and regulatory requirements are satisfied."),
      p("RELove may require information including:"),
      list([
        "Product identification",
        "Thai FDA information",
        "Registration or notification information",
        "Manufacturer information",
        "Importer information",
        "Product labels",
        "Evidence of applicable authorisation",
      ]),
      p("RELove may prohibit particular medical devices or health products regardless of whether they are theoretically capable of lawful sale elsewhere."),
    ],
  },
  {
    id: "mandatory-standards",
    number: "17",
    title: "Products Requiring Mandatory Standards",
    severity: "restricted",
    blocks: [
      p("Certain products sold in Thailand may be subject to mandatory safety or product standards."),
      p("Where applicable, RELove may require Sellers to provide information or evidence concerning relevant certifications or conformity marks, including applicable Thai Industrial Standards (TIS / มอก.) requirements."),
      p("RELove may refuse or remove a listing where required evidence cannot be provided or verified."),
    ],
  },
  {
    id: "used-safety-critical",
    number: "18",
    title: "Used Safety-Critical Products",
    severity: "restricted",
    blocks: [
      p("RELove may restrict or prohibit used goods where previous use, damage or deterioration could create a material safety risk. This may include certain:"),
      list([
        "Protective equipment",
        "Safety equipment",
        "Child-safety products",
        "Vehicle-safety equipment",
        "Electrical equipment",
        "Medical equipment",
        "Other safety-critical products",
      ]),
      p("Additional category-specific rules may apply."),
    ],
  },
  {
    id: "personal-documents",
    number: "19",
    title: "Personal Documents and Financial Instruments",
    severity: "prohibited",
    blocks: [
      p("Users must not list personal or official documents such as:"),
      list([
        "Passports",
        "National identity cards",
        "Driving licences",
        "Government certificates intended to identify a person",
        "Payment cards",
        "Bank accounts",
        "Financial account credentials",
        "Other documents or instruments whose transfer or sale is unlawful or creates a significant risk of fraud or identity theft",
      ]),
    ],
  },
  {
    id: "personal-data-accounts",
    number: "20",
    title: "Personal Data and Accounts",
    severity: "prohibited",
    blocks: [
      p("You must not sell or offer:"),
      list([
        "Databases containing personal data",
        "Stolen account information",
        "Login credentials",
        "Passwords",
        "Identity information",
        "Hacked accounts",
        "Social-media accounts where the sale violates applicable law or creates material security risks",
        "Information obtained without lawful authority",
      ]),
    ],
  },
  {
    id: "digital-pirated-content",
    number: "21",
    title: "Digital and Pirated Content",
    severity: "prohibited",
    blocks: [
      p("RELove may prohibit digital-only products where they fall outside the intended second-hand marketplace model. You must not list:"),
      list([
        "Pirated software",
        "Cracked software",
        "Stolen licence keys",
        "Unlawfully copied films",
        "Pirated games",
        "Unauthorised digital subscriptions",
        "Hacked accounts",
        "Digital content that infringes another person's rights",
      ]),
    ],
  },
  {
    id: "animals-wildlife",
    number: "22",
    title: "Animals and Wildlife",
    severity: "prohibited",
    blocks: [
      p("RELove does not permit the unlawful sale of:"),
      list([
        "Protected wildlife",
        "Endangered species",
        "Prohibited animal products",
        "Ivory or other protected wildlife materials",
        "Unlawfully obtained animal parts",
        "Other wildlife products whose trade is restricted or prohibited",
      ]),
      p("RELove may prohibit live-animal sales entirely through the Platform."),
    ],
  },
  {
    id: "human-remains",
    number: "23",
    title: "Human Remains and Human Biological Material",
    severity: "prohibited",
    blocks: [
      p("Users must not list:"),
      list([
        "Human remains",
        "Human organs",
        "Human tissue",
        "Blood",
        "Biological specimens",
        "Other human biological materials whose sale is prohibited or inappropriate for the Platform",
      ]),
    ],
  },
  {
    id: "illegal-services",
    number: "24",
    title: "Illegal Services",
    severity: "prohibited",
    blocks: [
      p("RELove is primarily intended for eligible goods. Users must not use listings to advertise unlawful services, including services involving:"),
      list(["Fraud", "Hacking", "Forged documents", "Unlawful financial activity", "Sexual exploitation", "Illegal gambling", "Trafficking", "Violence", "Other criminal activity"]),
    ],
  },
  {
    id: "misleading-listings",
    number: "25",
    title: "Misleading Listings",
    severity: "prohibited",
    blocks: [
      p("Even where an item itself is permitted, the listing may be prohibited if it is misleading. You must not:"),
      list([
        "Claim that a counterfeit item is authentic",
        "Use another product's photographs to conceal the actual condition",
        "Deliberately use an incorrect brand",
        "Conceal material defects",
        "Make false safety claims",
        "Provide fake certification numbers",
        "Provide fake Thai FDA information",
        "Provide fake TIS information",
        "Make false medical claims",
        "Otherwise materially misrepresent the product",
      ]),
    ],
  },
  {
    id: "items-not-in-possession",
    number: "26",
    title: "Items Not Physically in the Seller's Possession",
    severity: "restricted",
    blocks: [
      p("Unless RELove expressly permits a particular business model, Sellers should only list items that they own or are legally authorised to sell and can actually supply."),
      p("RELove may prohibit:"),
      list(["Speculative listings", "Listings for unavailable goods", "Fraudulent pre-orders", "Unauthorised dropshipping", "Listings created solely to redirect Buyers elsewhere"]),
    ],
  },
  {
    id: "restricted-items",
    number: "27",
    title: "Restricted Items",
    severity: "restricted",
    blocks: [
      p("Some products are not automatically prohibited but may require additional verification before they can be listed. Depending on the product, RELove may require:"),
      list([
        "Proof of identity",
        "Proof of ownership",
        "Proof of authenticity",
        "Thai FDA registration or notification information",
        "TIS certification",
        "Regulatory licences",
        "Product labels",
        "Manufacturer information",
        "Importer information",
        "Safety documentation",
        "Other evidence required by applicable law or RELove",
      ]),
      p("A Seller does not have an automatic right to list a restricted item merely because the Seller possesses relevant documentation."),
      p("RELove may decide not to support a category where the regulatory or safety risks are disproportionate to the benefits of allowing it."),
    ],
  },
  {
    id: "seller-responsibility",
    number: "28",
    title: "Seller Responsibility",
    severity: "info",
    blocks: [
      p("Sellers are responsible for ensuring their items comply with:"),
      list([
        "Applicable Thai law",
        "Product-safety requirements",
        "Regulatory requirements",
        "Intellectual property law",
        "RELove Terms & Conditions",
        "This Policy",
      ]),
      p("RELove's technical ability to create a listing does not constitute confirmation that the item is lawful."),
      p("Similarly, the fact that an AI system recognises an item or suggests a category does not mean the item is permitted for sale."),
    ],
  },
  {
    id: "review-verification",
    number: "29",
    title: "RELove Review and Verification",
    severity: "info",
    blocks: [
      p("RELove may use automated systems and manual review to identify potentially prohibited or restricted items. We may:"),
      list([
        "Analyse listing photographs",
        "Analyse descriptions",
        "Detect keywords",
        "Compare product information against available regulatory information",
        "Request additional documentation",
        "Temporarily prevent publication",
        "Restrict an existing listing",
        "Refer a listing for manual review",
      ]),
      p("Automated systems may make mistakes. RELove may therefore request additional information from the Seller before making a final moderation decision."),
    ],
  },
  {
    id: "removing-listings",
    number: "30",
    title: "Removing Listings",
    severity: "info",
    blocks: [
      p("RELove may remove, block or restrict a listing where we reasonably believe that:"),
      list([
        "The item is prohibited",
        "The item may be illegal",
        "Regulatory information is missing",
        "Required product certification cannot be verified",
        "The item presents a safety risk",
        "The listing is misleading",
        "Intellectual property rights may be infringed",
        "A competent authority requests or requires action",
        "The listing otherwise violates RELove policies",
      ]),
      p("Where required by applicable law, RELove will provide appropriate information concerning the action taken."),
    ],
  },
  {
    id: "notice-takedown",
    number: "31",
    title: "Notice and Takedown",
    severity: "info",
    blocks: [
      p("Users, rights holders, authorities and other eligible persons may report potentially illegal or prohibited products through RELove's reporting mechanism."),
      p("A report should contain sufficient information to identify:"),
      list([
        "The relevant listing",
        "The nature of the alleged violation",
        "The reason the item is believed to be unlawful or prohibited",
        "Supporting evidence where reasonably available",
      ]),
      p("RELove may temporarily restrict a listing while investigating a report. Where required by applicable law, RELove will take appropriate action and cooperate with competent authorities."),
    ],
  },
  {
    id: "repeated-violations",
    number: "32",
    title: "Repeated Violations",
    severity: "info",
    blocks: [
      p("Repeated or serious violations may result in:"),
      list([
        "Listing removal",
        "Transaction restrictions",
        "Cancellation where legally and operationally permitted",
        "Temporary account restrictions",
        "Seller verification requirements",
        "Suspension",
        "Permanent account termination",
      ]),
      p("Severe violations may result in immediate suspension or termination."),
      p("RELove may take reasonable measures to prevent users whose accounts were terminated for serious violations from circumventing those restrictions through new accounts."),
    ],
  },
  {
    id: "reporting-to-authorities",
    number: "33",
    title: "Reporting to Authorities",
    severity: "info",
    blocks: [
      p("Where required or permitted by applicable law, RELove may preserve and disclose relevant information to competent governmental, regulatory, judicial or law-enforcement authorities."),
      p("This may apply particularly where RELove reasonably suspects:"),
      list(["Fraud", "Sale of illegal goods", "Stolen property", "Serious product-safety risks", "Counterfeit goods", "Unlawful controlled substances", "Other criminal activity"]),
    ],
  },
  {
    id: "changes-to-policy",
    number: "34",
    title: "Changes to This Policy",
    severity: "info",
    blocks: [
      p("RELove may update this Policy where necessary to reflect:"),
      list([
        "Changes in Thai law",
        "Regulatory requirements",
        "Product-safety information",
        "New marketplace categories",
        "New Platform functionality",
        "Identified risks",
        "Changes to RELove's policies",
      ]),
      p("Where appropriate, RELove will notify users of material changes. The “Last updated” date at the beginning of this Policy identifies the most recent revision."),
    ],
  },
  {
    id: "contact-reporting",
    number: "35",
    title: "Contact and Reporting",
    severity: "info",
    blocks: [
      p("To report a prohibited or potentially illegal item, use: [Report Listing]"),
      p("For other questions concerning this Policy:"),
      list(["บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)", "Juristic Person Registration No. 0115569025684"]),
      p("Registered Office: 16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi District, Samut Prakan Province, Thailand"),
      p("Customer Support: [SUPPORT EMAIL]"),
      p("Legal / Compliance: [LEGAL OR COMPLIANCE EMAIL]"),
      p("Telephone: [TELEPHONE NUMBER]"),
      p("If you believe an item presents an immediate danger or involves criminal activity, you should also contact the appropriate competent authority where necessary."),
    ],
  },
];

/** Highlights bracketed placeholders like [DATE] or [SUPPORT EMAIL] so drafts are easy to spot at a glance. */
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

const FILTERS: { key: "all" | Severity; label: string }[] = [
  { key: "all", label: "All sections" },
  { key: "prohibited", label: "Prohibited" },
  { key: "restricted", label: "Restricted" },
  { key: "info", label: "Policy & process" },
];

export default function ProhibitedItemsPolicy() {
  const lastUpdated = "[DATE]";
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.id))
  );
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTIONS.filter((s) => {
      if (severityFilter !== "all" && s.severity !== severityFilter) return false;
      if (!q) return true;
      if (s.title.toLowerCase().includes(q)) return true;
      return s.blocks.some((b) =>
        b.type === "p" ? b.text.toLowerCase().includes(q) : b.items.some((it) => it.toLowerCase().includes(q))
      );
    });
  }, [query, severityFilter]);

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
            Prohibited &amp; Restricted Items Policy
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Last updated: {lastUpdated}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600">
            RELove is committed to providing a safe and lawful marketplace for buying and selling
            eligible pre-loved goods. This Policy explains what users may not list, sell, buy,
            advertise or otherwise offer through RELove, and forms part of the RELove Terms
            &amp; Conditions.
          </p>

          {/* Severity filter chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setSeverityFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  severityFilter === f.key
                    ? "bg-[#cb6f4d] text-white"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* TOC — desktop sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2">
              <label htmlFor="prohibited-search-desktop" className="sr-only">
                Search this policy
              </label>
              <input
                id="prohibited-search-desktop"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search policy…"
                className="mb-4 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#cb6f4d] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#cb6f4d]"
              />
              <nav aria-label="Table of contents">
                <ol className="space-y-0.5 border-l border-neutral-200 text-sm">
                  {filteredSections.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(s.id)}
                        className={`-ml-px flex w-full items-center gap-1.5 truncate border-l-2 py-1 pl-3 text-left transition-colors ${
                          activeId === s.id
                            ? "border-[#cb6f4d] font-medium text-[#a8552f]"
                            : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            s.severity === "prohibited"
                              ? "bg-red-500"
                              : s.severity === "restricted"
                              ? "bg-amber-500"
                              : "bg-neutral-300"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          <span className="tabular-nums text-neutral-400">{s.number}.</span> {s.title}
                        </span>
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
              {filteredSections.map((s) => (
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
                No sections match your search or filter.
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
                        <span className="flex flex-wrap items-center gap-2.5">
                          <h2 className="text-lg font-semibold text-neutral-900">
                            <span className="mr-2 text-[#cb6f4d]">{section.number}.</span>
                            {section.title}
                          </h2>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_CLASSES[section.severity]}`}
                          >
                            {SEVERITY_LABEL[section.severity]}
                          </span>
                        </span>
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