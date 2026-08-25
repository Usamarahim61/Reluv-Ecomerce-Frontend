"use client";

import { useState, useMemo, useRef, useEffect } from "react";

/**
 * TermsAndConditions
 *
 * Renders RELove's Terms & Conditions.
 * - Content lives in the `SECTIONS` array below (easy to update without touching layout/markup).
 * - Sticky, scrollspy'd table of contents on desktop; collapsible <select> jump-menu on mobile.
 * - Sections are individually collapsible (all expanded by default) so the page is scannable.
 * - Bracketed placeholders like [DATE] are auto-highlighted so drafts are easy to spot.
 * - Structurally mirrors components/PaymentPolicy.tsx for a consistent legal-docs family.
 *
 * Usage:
 *   import TermsAndConditions from "@/components/TermsAndConditions";
 *   export default function Page() { return <TermsAndConditions lastUpdated="1 September 2026" />; }
 */

type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "flow"; items: string[] }; // short arrow-style flow, e.g. Seller -> Buyer -> RELove

type Section = {
  id: string;
  number: number;
  title: string;
  blocks: Block[];
};

const p = (text: string): Block => ({ type: "p", text });
const list = (items: string[]): Block => ({ type: "list", items });
const flow = (items: string[]): Block => ({ type: "flow", items });

const SECTIONS: Section[] = [
  {
    id: "about-relove",
    number: 1,
    title: "About RELove",
    blocks: [
      p("RELove operates an electronic marketplace that enables users to list, discover, buy and sell eligible goods."),
      p("Unless expressly stated otherwise for a particular service, RELove acts as a marketplace intermediary."),
      p("When one user purchases an item from another user, the contract for the sale of that item is generally between the Seller and Buyer. RELove is not generally the owner, manufacturer or seller of items listed by users."),
      p("RELove provides technology and related services that may include:"),
      list([
        "Listing functionality",
        "Search and discovery",
        "Messaging",
        "Transaction management",
        "Payment facilitation",
        "Shipping integration",
        "Tracking",
        "Buyer Protection",
        "Dispute-management tools",
        "Customer support",
        "Fraud prevention",
        "Content moderation",
        "AI-powered listing tools",
      ]),
      p("Nothing in these Terms excludes or limits any responsibility that cannot lawfully be excluded under applicable law."),
    ],
  },
  {
    id: "eligibility",
    number: 2,
    title: "Eligibility",
    blocks: [
      p("To create and independently operate a RELove account, you must have the legal capacity required under applicable law to enter into the transactions you conduct through RELove."),
      p("Additional age or eligibility requirements may apply to particular services. Where a minor is permitted to use RELove only with the involvement or consent of a parent or legal representative under applicable law, those requirements must be satisfied."),
      p("You must provide accurate information concerning your eligibility to use the Platform. RELove may request information reasonably necessary to verify identity, age, account ownership or eligibility."),
    ],
  },
  {
    id: "your-account",
    number: 3,
    title: "Your RELove Account",
    blocks: [
      p("You must create an account to access certain RELove functionality. You agree to:"),
      list([
        "Provide accurate and current information",
        "Keep your account information up to date",
        "Protect your password and authentication credentials",
        "Prevent unauthorised access to your account",
        "Promptly notify RELove of suspected unauthorised access",
        "Cooperate with reasonable security or verification procedures",
      ]),
      p("Unless RELove expressly permits otherwise, you should maintain only one personal account. You must not:"),
      list([
        "Create accounts using false identities",
        "Impersonate another person or organisation",
        "Sell, transfer or rent your account",
        "Create additional accounts to evade restrictions or suspension",
        "Access another user's account without authorisation",
        "Use automated methods to create or operate accounts without RELove's permission",
      ]),
      p("You are responsible for activity carried out through your account to the extent permitted by applicable law."),
    ],
  },
  {
    id: "account-verification",
    number: 4,
    title: "Account Verification",
    blocks: [
      p("RELove may require verification before allowing access to certain functionality. Verification may include:"),
      list([
        "Email verification",
        "Telephone verification",
        "Identity verification",
        "Payment verification",
        "Payout verification",
        "Additional seller verification",
        "Security checks",
      ]),
      p("We may use third-party service providers to perform verification. Failure to complete required verification may result in limitations on buying, selling, receiving payouts or accessing other Platform functionality."),
    ],
  },
  {
    id: "selling-on-relove",
    number: 5,
    title: "Selling on RELove",
    blocks: [
      p("When listing an item, the Seller must provide information that is accurate, complete and not misleading. The Seller is responsible for:"),
      list([
        "Having the legal right to sell the item",
        "Accurately describing the item",
        "Selecting the correct category",
        "Accurately identifying the brand where applicable",
        "Accurately describing the condition",
        "Disclosing significant defects or damage",
        "Using photographs that accurately represent the item",
        "Setting the selling price",
        "Complying with applicable laws",
        "Complying with RELove's Prohibited Items Policy",
        "Ensuring that the item supplied corresponds to the listing",
      ]),
      p("The Seller must not deliberately conceal defects or provide materially misleading information."),
    ],
  },
  {
    id: "listing-content",
    number: 6,
    title: "Listing Photographs and Content",
    blocks: [
      p("Photographs should show the actual item offered for sale unless RELove expressly permits another type of image. You must not use photographs, descriptions, trademarks or other content in a way that unlawfully infringes another person's rights."),
      p("Listings must not contain:"),
      list([
        "Deceptive information",
        "Unlawful content",
        "Unauthorised personal information",
        "Malicious links",
        "Spam",
        "Content intended to redirect transactions outside RELove in violation of these Terms",
        "Other content prohibited by RELove policies",
      ]),
      p("RELove may remove or restrict content that violates these Terms, applicable policies or applicable law."),
    ],
  },
  {
    id: "ai-assisted-listings",
    number: 7,
    title: "AI-Assisted Listings",
    blocks: [
      p("RELove may provide artificial intelligence or automated tools to assist with creating listings. These tools may suggest information including:"),
      list(["Categories", "Product types", "Brands", "Colours", "Sizes", "Attributes", "Listing titles", "Descriptions", "Estimated or suggested prices"]),
      p("AI-generated information is a suggestion only and may be inaccurate. The Seller must review and confirm all listing information before publication."),
      p("The Seller remains responsible for the accuracy of the published listing regardless of whether any information was generated or suggested by RELove's automated systems. A suggested price is not a valuation, appraisal or guarantee that an item will sell for that amount."),
      p("Further information is available in our AI Features & Disclosure Policy."),
    ],
  },
  {
    id: "prices",
    number: 8,
    title: "Prices",
    blocks: [
      p("Sellers determine the selling prices of their items unless RELove expressly provides otherwise for a particular service. The applicable price and any additional charges should be displayed to the Buyer before the Buyer confirms a purchase."),
      p("Depending on the transaction, the total amount may include:"),
      list(["Item price", "Buyer Protection fee", "Shipping charges", "Taxes where applicable", "Other clearly disclosed charges"]),
      p("RELove may provide price recommendations or estimates, but Sellers are responsible for their final listing prices."),
    ],
  },
  {
    id: "buying-an-item",
    number: 9,
    title: "Buying an Item",
    blocks: [
      p("Before purchasing an item, Buyers should review:"),
      list(["Photographs", "Description", "Condition", "Size", "Brand", "Price", "Shipping information", "Other relevant listing information"]),
      p("When the Buyer completes the purchase process, a binding transaction may be formed between the Buyer and Seller in accordance with the checkout process and applicable law. The Buyer must pay the amount shown before final confirmation of the purchase."),
    ],
  },
  {
    id: "marketplace-transactions",
    number: 10,
    title: "Marketplace Transactions",
    blocks: [
      p("RELove provides the technical environment through which Buyers and Sellers can transact. For ordinary user-to-user sales:"),
      flow(["Seller sells the item", "Buyer purchases the item", "RELove facilitates the transaction"]),
      p("The Seller remains responsible for the item and the accuracy of the listing. The Buyer remains responsible for reviewing the listing and making the purchase decision."),
      p("RELove's role as intermediary does not eliminate any rights a Buyer or Seller may have under mandatory applicable law."),
    ],
  },
  {
    id: "payments",
    number: 11,
    title: "Payments",
    blocks: [
      p("Payments made through RELove may be processed by authorised third-party payment providers. Users may be required to accept additional terms imposed by the relevant payment provider."),
      p("RELove may facilitate:"),
      list(["Collection of Buyer payments", "Transaction confirmation", "Seller payouts", "Refunds", "Payment verification", "Fraud-prevention measures"]),
      p("RELove does not itself provide regulated payment services requiring a specific licence unless RELove has obtained the required authorisation. The exact payment process applicable to a transaction will be displayed through the Platform."),
    ],
  },
  {
    id: "seller-payouts",
    number: 12,
    title: "Seller Payouts",
    blocks: [
      p("Seller proceeds will be made available according to the payment and Buyer Protection process applicable at the time of the transaction. Payout may be delayed or withheld where reasonably necessary, including where:"),
      list([
        "The transaction has not been completed",
        "Delivery has not been confirmed",
        "A dispute is open",
        "Fraud is suspected",
        "Account verification is incomplete",
        "The payment provider requires additional verification",
        "RELove reasonably suspects a violation of these Terms",
        "Withholding is required by law",
      ]),
      p("Additional information is provided in our Payment, Fees & Payout Policy."),
    ],
  },
  {
    id: "fees",
    number: 13,
    title: "Fees",
    blocks: [
      p("RELove may charge fees for certain services. Fees may include, where applicable:"),
      list(["Buyer Protection fees", "Seller fees", "Promotional services", "Optional listing services", "Subscription services", "Other Platform services"]),
      p("Any mandatory charge payable for a transaction will be disclosed before the user confirms the relevant transaction."),
      p("RELove may change its fees from time to time. Changes will apply prospectively and appropriate notice will be provided where required by law."),
    ],
  },
  {
    id: "buyer-protection",
    number: 14,
    title: "Buyer Protection",
    blocks: [
      p("Eligible purchases completed through RELove's designated checkout and payment system may receive RELove Buyer Protection. Buyer Protection may assist where, for example:"),
      list([
        "An item is not delivered",
        "An item arrives materially damaged",
        "An item is significantly different from its listing",
        "The wrong item is received",
        "There is credible evidence that an item is counterfeit",
      ]),
      p("Buyer Protection is subject to eligibility requirements, reporting deadlines and procedures described in the Buyer Protection & Refund Policy."),
      p("Buyer Protection does not replace rights that cannot lawfully be excluded under applicable law."),
    ],
  },
  {
    id: "shipping",
    number: 15,
    title: "Shipping",
    blocks: [
      p("Transactions may use shipping services provided by third-party logistics providers integrated with or supported by RELove. Depending on the available service, RELove may facilitate:"),
      list(["Shipment creation", "Shipping labels", "QR codes", "Pickup", "Drop-off", "Tracking", "Delivery-status information"]),
      p("Shipping services are ultimately performed by the relevant logistics provider. Users must provide accurate delivery information. Sellers must package items appropriately and dispatch them within the applicable period."),
      p("Further rules are provided in our Shipping Policy."),
    ],
  },
  {
    id: "delivery-problems",
    number: 16,
    title: "Delivery Problems",
    blocks: [
      p("If an item is not delivered, is materially damaged during shipment, appears lost, is returned to the Seller, or has another significant delivery problem, the affected user should report the problem through the procedure provided by RELove within the applicable deadline."),
      p("RELove may use tracking information and information supplied by the shipping provider, Buyer and Seller when reviewing the matter."),
    ],
  },
  {
    id: "receiving-an-item",
    number: 17,
    title: "Receiving an Item",
    blocks: [
      p("Buyers should inspect an item promptly after delivery. Where RELove provides a confirmation or dispute period, the Buyer must report an eligible problem within that period."),
      p("If no problem is reported within the applicable period, RELove may treat the transaction as completed and release the Seller's proceeds, subject to applicable law and the Buyer Protection & Refund Policy."),
      p("[FINAL DISPUTE WINDOW TO BE INSERTED AFTER TRANSACTION FLOW IS CONFIRMED]"),
    ],
  },
  {
    id: "returns-and-refunds",
    number: 18,
    title: "Returns and Refunds",
    blocks: [
      p("Returns and refunds depend on:"),
      list([
        "The reason for the request",
        "Whether Buyer Protection applies",
        "Whether the item materially differs from the listing",
        "Applicable law",
        "The status of the transaction",
        "The circumstances of the dispute",
      ]),
      p("A Buyer generally cannot demand a RELove Buyer Protection refund merely because the Buyer changed their mind, no longer wants the item, selected an incorrect size despite accurate listing information, or failed to review information clearly provided by the Seller — unless a return or refund is required by applicable law or expressly permitted under the relevant RELove policy."),
      p("Detailed rules are provided in our Buyer Protection & Refund Policy."),
    ],
  },
  {
    id: "prohibited-items",
    number: 19,
    title: "Prohibited Items",
    blocks: [
      p("You may only list items permitted by applicable law and RELove policies. Prohibited or restricted items may include, without limitation:"),
      list([
        "Counterfeit goods",
        "Stolen goods",
        "Illegal drugs",
        "Certain medicines",
        "Weapons and dangerous items",
        "Illegal or regulated substances",
        "Unsafe or recalled products",
        "Certain adult products",
        "Items infringing intellectual property rights",
        "Items whose sale is prohibited by law",
        "Other products identified in our Prohibited Items Policy",
      ]),
      p("The complete rules are provided in the Prohibited Items Policy. RELove may remove prohibited listings and take appropriate action against accounts involved."),
    ],
  },
  {
    id: "counterfeit-goods",
    number: 20,
    title: "Counterfeit Goods",
    blocks: [
      p("Counterfeit goods are prohibited. A Seller must not list an item using a brand, trademark or other indication that falsely suggests authenticity, origin or affiliation."),
      p("RELove may:"),
      list([
        "Remove suspected counterfeit listings",
        "Request evidence of authenticity",
        "Restrict the relevant listing",
        "Suspend transactions",
        "Restrict or suspend accounts",
        "Refund transactions where appropriate",
        "Cooperate with rights holders or competent authorities where legally required or permitted",
      ]),
      p("Further information is provided in our Intellectual Property & Counterfeit Policy."),
    ],
  },
  {
    id: "intellectual-property",
    number: 21,
    title: "Intellectual Property",
    blocks: [
      p("Users retain ownership of intellectual property rights they lawfully hold in content they submit to RELove."),
      p("By publishing content on RELove, you grant RELove a non-exclusive, worldwide, royalty-free licence, for the duration necessary for the purposes concerned and to the extent permitted by applicable law, to host, store, reproduce, display, format and technically process that content as necessary to:"),
      list([
        "Operate RELove",
        "Display listings",
        "Promote listings and the Platform",
        "Provide search functionality",
        "Maintain Platform functionality",
        "Provide related services",
      ]),
      p("You represent that you have the rights necessary to upload and use the content you provide."),
    ],
  },
  {
    id: "communication-between-users",
    number: 22,
    title: "Communication Between Users",
    blocks: [
      p("Users must communicate respectfully and lawfully. You must not use RELove communications to:"),
      list([
        "Threaten",
        "Harass",
        "Abuse",
        "Defraud",
        "Spam",
        "Distribute malware",
        "Unlawfully disclose personal information",
        "Engage in discrimination prohibited by applicable law",
        "Facilitate prohibited transactions",
      ]),
      p("RELove may investigate reported communications and take appropriate action."),
    ],
  },
  {
    id: "transactions-outside-relove",
    number: 23,
    title: "Transactions Outside RELove",
    blocks: [
      p("Users should complete RELove marketplace transactions through the designated RELove transaction system. Attempting to move transactions outside RELove may remove protections RELove provides and may expose users to fraud."),
      p("Where prohibited by Platform rules, users must not use RELove primarily to:"),
      list([
        "Advertise an item and then intentionally avoid RELove's transaction system",
        "Circumvent applicable RELove fees",
        "Solicit off-platform payment",
        "Direct users to competing transaction channels for the purpose of avoiding RELove rules",
      ]),
      p("RELove may restrict accounts engaged in systematic fee avoidance or circumvention."),
    ],
  },
  {
    id: "reviews",
    number: 24,
    title: "Reviews",
    blocks: [
      p("RELove may allow users to review completed transactions or other users. Reviews must reflect genuine experiences. Users must not:"),
      list([
        "Submit fake reviews",
        "Manipulate ratings",
        "Exchange compensation for misleading reviews",
        "Threaten another user in exchange for a favourable review",
        "Coordinate artificial review activity",
      ]),
      p("RELove may remove reviews that violate applicable law or Platform rules."),
    ],
  },
  {
    id: "search-ranking",
    number: 25,
    title: "Search, Ranking and Recommendations",
    blocks: [
      p("RELove may determine the order in which listings appear using automated systems. Factors may include, depending on the feature:"),
      list([
        "Relevance to a search",
        "Listing category",
        "Listing information",
        "Price",
        "Recency",
        "Location",
        "User preferences",
        "Previous Platform interactions",
        "Listing quality",
        "Seller activity",
        "Popularity",
        "Promotional services",
        "Other factors intended to improve marketplace relevance and safety",
      ]),
      p("Paid promotional features, where offered, may affect visibility and will be identified where required. Additional information may be provided through the Platform or relevant policies."),
    ],
  },
  {
    id: "platform-safety",
    number: 26,
    title: "Platform Safety and Fraud Prevention",
    blocks: [
      p("RELove may use automated and manual systems to identify:"),
      list(["Fraud", "Scams", "Counterfeit products", "Prohibited items", "Suspicious transactions", "Account compromise", "Payment abuse", "Spam", "Violations of Platform rules"]),
      p("RELove may temporarily restrict activity while investigating reasonably suspected misconduct."),
    ],
  },
  {
    id: "reporting",
    number: 27,
    title: "Reporting Content or Users",
    blocks: [
      p("Users may report:"),
      list(["Prohibited listings", "Suspected counterfeit goods", "Scams", "Harassment", "Intellectual property infringement", "Illegal content", "Other violations"]),
      p("Reports should contain sufficient information for RELove to assess the issue. RELove may request additional information. Submitting knowingly false or abusive reports may itself violate these Terms."),
    ],
  },
  {
    id: "moderation-enforcement",
    number: 28,
    title: "Moderation and Enforcement",
    blocks: [
      p("Where RELove reasonably believes that content or conduct violates these Terms, our policies or applicable law, we may take proportionate action including:"),
      list([
        "Warning a user",
        "Removing or restricting a listing",
        "Reducing access to particular functionality",
        "Cancelling or restricting a transaction where permitted",
        "Requesting verification",
        "Temporarily restricting an account",
        "Suspending an account",
        "Permanently terminating access in serious or repeated cases",
      ]),
      p("Where required by applicable law, RELove will provide appropriate information concerning relevant enforcement decisions and available appeal or complaint mechanisms."),
    ],
  },
  {
    id: "suspension-termination",
    number: 29,
    title: "Account Suspension and Termination",
    blocks: [
      p("RELove may restrict, suspend or terminate an account where reasonably necessary, including where:"),
      list([
        "These Terms are materially or repeatedly violated",
        "Prohibited goods are listed",
        "Counterfeit goods are sold",
        "Fraud or attempted fraud occurs",
        "Payment abuse occurs",
        "Another person's identity is misused",
        "Platform security is threatened",
        "Legal obligations require action",
        "Repeated conduct creates material risk to users or RELove",
      ]),
      p("Where appropriate and legally required, RELove will consider the circumstances and proportionality of the action. Users may have access to an appeal or complaint procedure."),
    ],
  },
  {
    id: "closing-your-account",
    number: 30,
    title: "Closing Your Account",
    blocks: [
      p("You may request closure of your RELove account. Account closure may be delayed while:"),
      list([
        "Transactions remain outstanding",
        "Payments or payouts remain pending",
        "Disputes remain unresolved",
        "Returns are being processed",
        "Another legitimate reason requires the account to remain operational temporarily",
      ]),
      p("Certain information may be retained after account closure as described in our Privacy Policy."),
    ],
  },
  {
    id: "user-responsibilities",
    number: 31,
    title: "User Responsibilities",
    blocks: [
      p("You are responsible for using RELove lawfully. You must not:"),
      list([
        "Violate applicable law",
        "Commit fraud",
        "Sell prohibited items",
        "Infringe intellectual property rights",
        "Interfere with Platform security",
        "Introduce malware",
        "Scrape or harvest data without authorisation",
        "Attempt to gain unauthorised access",
        "Manipulate Platform systems",
        "Abuse promotional programmes",
        "Manipulate search or review systems",
        "Misuse another person's personal data",
        "Assist another person in doing any of these things",
      ]),
    ],
  },
  {
    id: "platform-availability",
    number: 32,
    title: "Availability of the Platform",
    blocks: [
      p("We aim to keep RELove available and functioning properly. However, we do not guarantee uninterrupted or error-free operation. The Platform may occasionally be unavailable because of:"),
      list([
        "Maintenance",
        "Updates",
        "Technical problems",
        "Third-party service failures",
        "Security incidents",
        "Events beyond our reasonable control",
        "Other operational requirements",
      ]),
      p("Where reasonably possible, RELove will seek to minimise unnecessary disruption."),
    ],
  },
  {
    id: "third-party-services",
    number: 33,
    title: "Third-Party Services",
    blocks: [
      p("RELove may integrate with third-party services including:"),
      list(["Payment providers", "Shipping providers", "Authentication providers", "Identity-verification providers", "Cloud providers", "AI providers", "Other technology services"]),
      p("Those services may be governed by additional terms and privacy policies provided by the relevant third party. RELove is not responsible for independent services provided by third parties except to the extent responsibility cannot lawfully be excluded."),
    ],
  },
  {
    id: "relove-responsibility",
    number: 34,
    title: "RELove's Responsibility",
    blocks: [
      p("RELove is responsible for providing the Platform and RELove services with the level of care required under applicable law."),
      p("However, because RELove generally acts as an intermediary between independent Buyers and Sellers, RELove does not automatically assume responsibility for:"),
      list([
        "The quality of user-listed goods",
        "Hidden defects unknown to RELove",
        "The accuracy of statements independently made by Sellers",
        "The authenticity of every item unless RELove expressly provides an authentication service",
        "Actions of users outside RELove's control",
        "Independent services performed by third parties",
      ]),
      p("Nothing in these Terms excludes or limits liability where exclusion or limitation is prohibited by applicable law."),
    ],
  },
  {
    id: "no-guarantee-of-sale",
    number: 35,
    title: "No Guarantee of Sale",
    blocks: [
      p("RELove does not guarantee that:"),
      list([
        "A listed item will sell",
        "A particular Buyer will purchase an item",
        "A Seller will achieve a particular price",
        "An AI price suggestion represents market value",
        "A listing will receive a particular level of visibility",
      ]),
      p("Marketplace demand depends on users and market conditions outside RELove's control."),
    ],
  },
  {
    id: "indemnification",
    number: 36,
    title: "Indemnification",
    blocks: [
      p("To the extent permitted by applicable law, a user may be responsible for losses reasonably incurred by RELove as a direct result of that user's unlawful conduct, fraud, material breach of these Terms or infringement of third-party rights."),
      p("Nothing in this section limits rights or protections that users have under mandatory applicable law."),
    ],
  },
  {
    id: "privacy",
    number: 37,
    title: "Privacy",
    blocks: [
      p("Personal data is processed according to our:"),
      list(["Privacy Centre", "Privacy Policy", "Cookie Policy", "Cookie Settings"]),
      p("Users receiving another user's personal information through a transaction must use it only for the purpose for which it was provided and in accordance with applicable law."),
    ],
  },
  {
    id: "changes-to-terms",
    number: 38,
    title: "Changes to These Terms",
    blocks: [
      p("RELove may update these Terms where reasonably necessary, including because of:"),
      list([
        "Changes to Platform functionality",
        "New services",
        "Security requirements",
        "Changes to our business model",
        "Legal or regulatory requirements",
        "Clarification of existing rules",
      ]),
      p("Where required by applicable law, we will provide reasonable advance notice of material changes. Where consent to revised Terms is legally required, RELove will obtain it."),
      p("The version applicable to a transaction will be determined in accordance with applicable law and the Terms presented at the relevant time."),
    ],
  },
  {
    id: "complaints-disputes",
    number: 39,
    title: "Complaints and Dispute Resolution",
    blocks: [
      p("If you have a complaint concerning RELove, another user or a transaction, you should first use the applicable RELove complaint or dispute process."),
      p("RELove may request supporting information including:"),
      list(["Photographs", "Shipping records", "Communications", "Payment information", "Other evidence reasonably relevant to the dispute"]),
      p("Detailed procedures are provided in our Complaints & Dispute Resolution Policy and Buyer Protection & Refund Policy."),
      p("Nothing in these Terms prevents a user from exercising rights available under mandatory applicable law or submitting a complaint to a competent authority."),
    ],
  },
  {
    id: "governing-law",
    number: 40,
    title: "Governing Law",
    blocks: [
      p("These Terms are governed by the laws of Thailand, subject to any mandatory rights or rules that apply notwithstanding this provision."),
      p("Any dispute concerning these Terms or RELove's services will be handled in accordance with applicable Thai law and the competent dispute-resolution procedures and courts, without limiting rights that cannot lawfully be restricted."),
    ],
  },
  {
    id: "severability",
    number: 41,
    title: "Severability",
    blocks: [
      p("If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law."),
      p("The invalid or unenforceable provision will be interpreted or modified only to the extent necessary to make it lawful and enforceable where permitted."),
    ],
  },
  {
    id: "no-waiver",
    number: 42,
    title: "No Waiver",
    blocks: [
      p("If RELove does not immediately enforce a provision of these Terms, that does not automatically constitute a waiver of our right to enforce it later."),
    ],
  },
  {
    id: "entire-agreement",
    number: 43,
    title: "Entire Agreement",
    blocks: [
      p("These Terms, together with policies expressly incorporated into them and any specific terms applicable to particular RELove services, constitute the agreement governing your use of those services."),
      p("If specific service terms conflict with these general Terms, the specific terms will apply to the relevant service to the extent stated."),
    ],
  },
  {
    id: "contact",
    number: 44,
    title: "Contact RELove",
    blocks: [
      p("Questions concerning these Terms may be sent to:"),
      list(["บริษัท รีลิฟ จำกัด (Relove Co., Ltd.)", "Juristic Person Registration No. 0115569025684"]),
      p("Registered Office: 16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict, Phra Samut Chedi District, Samut Prakan Province, Thailand"),
      p("Customer Support: [SUPPORT EMAIL]"),
      p("Legal: [LEGAL EMAIL]"),
      p("Telephone: [TELEPHONE NUMBER]"),
      p("For privacy-related matters, please use the contact information provided in our Privacy Policy."),
    ],
  },
];

const RELATED_POLICIES = [
  "Buyer Protection & Refund Policy",
  "Payment, Fees & Payout Policy",
  "Shipping Policy",
  "Prohibited Items Policy",
  "Intellectual Property & Counterfeit Policy",
  "AI Features & Disclosure Policy",
  "Complaints & Dispute Resolution Policy",
  "Privacy Policy",
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
  if (block.type === "flow") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        {block.items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-800">{item}</span>
            {i < block.items.length - 1 && (
              <svg className="h-3.5 w-3.5 shrink-0 text-[#cb6f4d]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        ))}
      </div>
    );
  }
  return null;
}

export default function TermsAndConditions({
  lastUpdated = "[DATE]",
}: {
  lastUpdated?: string;
}) {
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
      return s.blocks.some((b) =>
        b.type === "p"
          ? b.text.toLowerCase().includes(q)
          : b.items.some((it) => it.toLowerCase().includes(q))
      );
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Last updated: {lastUpdated}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600">
            These Terms &amp; Conditions govern your access to and use of the RELove website,
            mobile application, marketplace and related services (the &ldquo;Platform&rdquo;). By
            creating an account or otherwise using services that require acceptance of these
            Terms, you agree to be bound by these Terms and the policies incorporated into them.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
            Incorporated policies:
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
              <label htmlFor="terms-search-desktop" className="sr-only">
                Search these Terms
              </label>
              <input
                id="terms-search-desktop"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search terms…"
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
              placeholder="Search terms…"
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
          <p className="font-medium text-neutral-700">The Platform is operated by:</p>
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