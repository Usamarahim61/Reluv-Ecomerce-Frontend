"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Truck, BadgeInfo } from "lucide-react";

const quickLinks = [
  { label: "Shipping services", href: "#section-1" },
  { label: "Dispatch deadline", href: "#section-4" },
  { label: "Packaging rules", href: "#section-7" },
  { label: "Lost & damaged", href: "#section-25" },
  { label: "Shipping fees", href: "#section-40" },
  { label: "Contact us", href: "#section-51" },
];

const BulletList = ({ items }: { items: string[] }) => (
  <div className="space-y-2 text-sm text-gray-700 mb-4">
    {items.map((item, idx) => (
      <div key={idx} className="flex items-start gap-2">
        <span className="text-[#cb6f4d] mt-1">•</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
    <p className="text-sm leading-6 text-gray-700">{children}</p>
  </div>
);

type Section = {
  id: number;
  title: string;
  extra?: string;
  bullets?: string[];
  note?: string;
};

const sectionData: Section[] = [
  { id: 1, title: "RELove Shipping Services", extra: "RELove may integrate with third-party shipping and logistics providers to facilitate delivery between Buyers and Sellers. Depending on the shipping provider and service available, RELove may facilitate:", bullets: ["Shipment creation","Shipping labels","QR codes","Parcel drop-off","Parcel pickup","Delivery","Tracking","Delivery-status notifications","Return shipping","Shipping-related claims"], note: "The physical transportation and delivery of parcels are performed by the relevant third-party shipping provider." },
  { id: 2, title: "Approved Shipping Providers", extra: "Eligible RELove transactions may use shipping providers approved or integrated by RELove. Available shipping providers may vary based on:", bullets: ["Seller location","Buyer location","Parcel size","Parcel weight","Product category","Service availability","Other operational factors"], note: "Current shipping providers: [TO BE CONFIRMED]. Available providers will be displayed through the Platform where applicable." },
  { id: 3, title: "Integrated Shipping", extra: "Where RELove provides integrated shipping, the Seller may receive:", bullets: ["A shipping label","QR code","Tracking number","Shipment instructions","Other information required to send the parcel"], note: "The Seller must follow the shipping instructions provided for the relevant transaction." },
  { id: 4, title: "Shipping Deadline", extra: "A Seller must dispatch the sold item within the shipping period shown for the transaction. Unless RELove specifies otherwise, the proposed standard dispatch period is 5 calendar days after the transaction is confirmed. RELove may provide a shorter or longer deadline for specific shipping services.", note: "If the Seller does not dispatch the item within the applicable deadline, RELove may cancel the transaction and refund the Buyer." },
  { id: 5, title: "When the Shipping Period Starts", extra: "The shipping period begins when RELove confirms that the Seller may dispatch the item. Sellers should not ship before RELove displays appropriate transaction confirmation.", note: "A message or screenshot from the Buyer stating that payment has been made is NOT sufficient evidence of transaction confirmation." },
  { id: 6, title: "Shipping the Correct Item", extra: "The Seller is responsible for ensuring that:", bullets: ["The correct item is shipped","The correct quantity is included","All components described as included are present","The parcel corresponds to the correct RELove transaction"], note: "The Seller should check the transaction before sealing the package." },
  { id: 7, title: "Packaging Requirements", extra: "Sellers must package items appropriately for ordinary transportation. Packaging must be suitable for the:", bullets: ["Size","Weight","Material","Fragility","Nature of the item being shipped"], note: "Packaging should protect the item from reasonably foreseeable risks during transport." },
  { id: 8, title: "Packaging Standards", extra: "Depending on the item, appropriate packaging may include:", bullets: ["Suitable boxes or mailing bags","Protective wrapping","Padding","Sealed packaging","Water-resistant protection","Internal protection to prevent movement","Reinforced packaging for fragile items"], note: "Sellers must comply with additional packaging requirements imposed by the relevant shipping provider." },
  { id: 9, title: "Reusing Packaging", extra: "Sellers may reuse appropriate packaging where it remains:", bullets: ["Clean","Structurally sound","Safe","Suitable for the item","Compliant with the shipping provider's requirements"], note: "Old shipping labels and barcodes should be removed or covered where necessary to avoid routing errors." },
  { id: 10, title: "Inadequate Packaging", extra: "Where an item is damaged because the Seller used clearly inadequate packaging, the Seller may be responsible under RELove's Buyer Protection process. Examples may include:", bullets: ["Shipping fragile goods without reasonable protection","Using packaging that cannot support the item's weight","Leaving liquids inadequately sealed","Shipping an item in a way that creates an obvious risk of damage"], note: "The circumstances of each case will be assessed individually." },
  { id: 11, title: "Parcel Size and Weight", extra: "Sellers must provide accurate package size and weight information where requested. Shipping providers may impose:", bullets: ["Maximum dimensions","Maximum weight","Category restrictions","Additional charges"], note: "Sellers must not deliberately provide incorrect parcel information to obtain a cheaper shipping rate." },
  { id: 12, title: "Incorrect Parcel Information", extra: "Where inaccurate Seller information results in additional shipping charges, RELove may, where permitted:", bullets: ["Require the Seller to pay the difference","Deduct the additional amount from Seller proceeds","Restrict future shipping functionality","Take other appropriate action"], note: "Any deductions or charges will be handled in accordance with applicable law and RELove policies." },
  { id: 13, title: "Shipping Labels and QR Codes", extra: "Shipping labels, QR codes and other shipment credentials are provided for the specific RELove transaction for which they were generated. Sellers must not:", bullets: ["Reuse them","Duplicate them for other transactions","Alter them fraudulently","Sell or transfer them","Use them to send unrelated goods"] },
  { id: 14, title: "Drop-Off", extra: "Where a drop-off shipping service is used, the Seller must deliver the parcel to an authorised location specified by the relevant shipping provider.", note: "The Seller should retain proof of drop-off where available until the transaction is complete." },
  { id: 15, title: "Pickup", extra: "Where pickup is supported, the Seller must:", bullets: ["Provide accurate pickup information","Make the parcel appropriately packaged and ready","Be available according to the applicable pickup arrangement","Comply with the shipping provider's instructions"], note: "Failed pickups caused by Seller conduct may delay or cancel a transaction." },
  { id: 16, title: "Proof of Shipment", extra: "Proof of shipment may include:", bullets: ["Courier tracking","Drop-off receipt","Pickup confirmation","Scan event","Shipping-provider confirmation","Other reliable shipment records"], note: "Where RELove uses integrated tracking, shipping events may be received automatically from the shipping provider." },
  { id: 17, title: "Tracking", extra: "Where available, RELove may display tracking information received from the shipping provider. Tracking information may include:", bullets: ["Parcel accepted","In transit","Out for delivery","Delivery attempted","Delivered","Returned","Other shipment status"], note: "Tracking information is supplied by the relevant shipping provider and may occasionally be delayed or inaccurate." },
  { id: 18, title: "Delivery Confirmation", extra: "A parcel may be considered delivered when RELove receives reliable confirmation from the shipping provider. Depending on the service, confirmation may include:", bullets: ["Delivery scan","Recipient confirmation","Pickup confirmation","Photographic proof","Electronic signature","Other provider-supported evidence"], note: "Delivery confirmation may start the Buyer Protection inspection period." },
  { id: 19, title: "Buyer Delivery Information", extra: "Buyers are responsible for providing accurate shipping information. This may include:", bullets: ["Recipient name","Telephone number","Delivery address","Postal code","Pickup location","Other information required by the shipping provider"], note: "Buyers should verify this information before confirming the purchase." },
  { id: 20, title: "Incorrect Buyer Address", extra: "Where delivery fails because the Buyer provided incorrect or incomplete information, the Buyer may be responsible for resulting consequences where permitted by applicable law. These may include:", bullets: ["Redelivery charges","Return-to-Seller charges","Additional shipping costs","Transaction cancellation"], note: "RELove will consider the circumstances of the case." },
  { id: 21, title: "Changing Delivery Details", extra: "Once a shipping label or shipment has been created, changing the delivery address may not be possible. Buyers should contact RELove promptly if they identify an error.", note: "RELove cannot guarantee that shipping details can be changed after dispatch." },
  { id: 22, title: "Delivery Attempts", extra: "Shipping providers may make one or more delivery attempts according to their own service rules. If delivery cannot be completed, the parcel may:", bullets: ["Be held for collection","Be subject to another delivery attempt","Be redirected where supported","Be returned to the Seller"] },
  { id: 23, title: "Failure to Collect a Parcel", extra: "Where a Buyer selects pickup-point or collection delivery, the Buyer must collect the parcel within the period specified by the shipping provider. If the Buyer does not collect the parcel, it may be returned to the Seller.", note: "Failure to collect may affect entitlement to a refund of shipping-related costs where the Buyer was responsible for the failed delivery. Mandatory legal rights remain unaffected." },
  { id: 24, title: "Returned Parcels", extra: "A parcel may be returned to the Seller where:", bullets: ["Delivery fails","The Buyer fails to collect it","The address is incorrect","Delivery is refused","The shipment violates courier restrictions","Another provider-defined reason applies"], note: "RELove will determine the appropriate transaction outcome based on the reason for return, Buyer and Seller conduct, shipping-provider information, Buyer Protection rules, and applicable law." },
  { id: 25, title: "Lost Parcels", extra: "If a parcel appears lost, users should report the issue through the relevant RELove transaction. RELove may:", bullets: ["Review tracking information","Contact or obtain information from the shipping provider","Request information from the Seller","Request information from the Buyer","Assist with or initiate a shipping claim where supported"] },
  { id: 26, title: "When a Parcel Is Considered Lost", extra: "A parcel will not necessarily be treated as lost merely because tracking is delayed. A shipment may be considered lost when:", bullets: ["The shipping provider confirms the loss","The provider's applicable investigation period expires","Tracking evidence strongly indicates loss","Another reliable basis exists"], note: "RELove may wait for the relevant shipping provider's investigation before resolving the Buyer Protection claim where reasonable." },
  { id: 27, title: "Refund for a Lost Parcel", extra: "Where an eligible parcel is confirmed lost and the Buyer has not received the item, the Buyer may be entitled to a refund under the Buyer Protection policy. Seller compensation will depend on:", bullets: ["Shipping-provider liability","Applicable shipping insurance or compensation","RELove's shipping arrangement","Whether the Seller complied with shipping requirements","Applicable law"] },
  { id: 28, title: "Damaged Parcels", extra: "If an item arrives damaged, the Buyer should report the issue within the Buyer Protection period and retain:", bullets: ["The item","Original packaging","Shipping materials","Shipping label"], note: "The Buyer may be asked to provide photographs showing the outer packaging, inner packaging, shipping label, damaged item, and relevant details." },
  { id: 29, title: "Determining Responsibility for Shipping Damage", extra: "RELove may consider:", bullets: ["Adequacy of Seller packaging","Nature of the item","Shipping-provider records","Photographs","Handling damage","Condition described in the original listing","Other relevant evidence"], note: "Responsibility may lie with the Seller, shipping provider, another party, or circumstances outside either user's direct control." },
  { id: 30, title: "Shipping Provider Compensation", extra: "Shipping providers may apply their own compensation limits for lost or damaged parcels. Compensation may depend on:", bullets: ["Service type","Declared value","Product category","Shipping-provider terms","Packaging compliance","Supporting evidence"], note: "RELove does not guarantee that a courier will compensate the full retail or selling value of an item." },
  { id: 31, title: "High-Value Items", extra: "RELove may:", bullets: ["Limit the value of items eligible for particular shipping methods","Require specific services for high-value items","Require additional Seller verification","Require additional packaging","Require insurance where available","Exclude certain high-value items from particular shipping services"], note: "The applicable conditions should be displayed before shipment." },
  { id: 32, title: "Prohibited Shipments", extra: "Users must not send products prohibited by:", bullets: ["Applicable law","RELove's Prohibited and Restricted Items Policy","The relevant shipping provider"], note: "Courier restrictions may be stricter than RELove's general marketplace rules. A product being permitted for listing does not necessarily mean that every shipping provider will transport it." },
  { id: 33, title: "Dangerous Goods", extra: "Sellers must not ship dangerous goods through a service that does not permit them. Dangerous goods may include:", bullets: ["Explosives","Flammable substances","Hazardous chemicals","Compressed gases","Certain batteries","Corrosive substances","Other regulated materials"], note: "Additional restrictions may apply depending on the courier." },
  { id: 34, title: "Batteries and Electronics", extra: "Some batteries and electronic devices may be subject to special courier restrictions. Sellers must comply with applicable packaging, labelling and transportation requirements.", note: "RELove may restrict certain products from particular shipping services." },
  { id: 35, title: "Liquids", extra: "Where liquids are permitted, Sellers must package them in a manner that reasonably prevents leakage.", note: "The shipping provider may prohibit or restrict particular liquids." },
  { id: 36, title: "Perishable Goods", extra: "Perishable goods may be prohibited or restricted depending on RELove's marketplace rules and the shipping provider.", note: "RELove does not guarantee temperature-controlled or specialised transportation unless expressly offered." },
  { id: 37, title: "Off-Platform Shipping", extra: "Buyer Protection may be limited where users choose a shipping method outside RELove's designated transaction system. If a Seller uses an unauthorised shipping method, RELove may be unable to:", bullets: ["Verify dispatch","Verify delivery","Track the parcel","Investigate loss","Obtain courier compensation"], note: "Users should therefore use the shipping method assigned or approved through RELove." },
  { id: 38, title: "Local or In-Person Exchange", extra: "RELove may introduce local pickup or in-person exchange separately. Such transactions may be governed by additional rules.", note: "Unless RELove expressly supports a protected in-person transaction method, ordinary Buyer Protection procedures designed around tracked shipping may not apply." },
  { id: 39, title: "Cash on Delivery", extra: "Where RELove supports Cash on Delivery (COD) through an approved logistics partner, additional terms may apply covering:", bullets: ["Collection of payment","COD fees","Refused deliveries","Failed delivery attempts","Returned parcels","Seller proceeds","Payout timing","Buyer Protection"], note: "COD will only be available where expressly displayed as an option by RELove." },
  { id: 40, title: "Shipping Fees", extra: "Shipping fees may vary based on:", bullets: ["Courier","Parcel dimensions","Parcel weight","Destination","Delivery method","Promotional discounts","Other service conditions"], note: "The applicable shipping price should be shown before the Buyer confirms the transaction where it can be calculated in advance." },
  { id: 41, title: "Who Pays Shipping", extra: "For an ordinary purchase, shipping charges will generally be paid by the Buyer, unless RELove provides another arrangement or promotion.", note: "Where a Buyer Protection return is approved because of a Seller-caused material problem, return-shipping responsibility will be determined under the Buyer Protection policy." },
  { id: 42, title: "Free or Discounted Shipping", extra: "RELove may occasionally offer:", bullets: ["Free shipping","Discounted shipping","Shipping credits","Courier promotions"], note: "Promotions may be subject to separate eligibility rules, transaction limits and expiry periods." },
  { id: 43, title: "Shipping Price Adjustments", extra: "If the parcel provided by the Seller materially exceeds the dimensions or weight used to calculate the shipping price, additional charges may arise.", note: "Where permitted, RELove may recover reasonable additional charges from the responsible user." },
  { id: 44, title: "Shipping Delays", extra: "Estimated delivery dates are estimates unless expressly stated otherwise. Delivery may be delayed because of:", bullets: ["Courier operations","Severe weather","Natural disasters","Public holidays","Unusually high parcel volume","Traffic disruption","Remote delivery locations","Security events","Inaccurate delivery information","Other events outside RELove's reasonable control"], note: "A delay alone does not necessarily mean a parcel is lost." },
  { id: 45, title: "Third-Party Shipping Providers", extra: "Shipping providers are independent service providers responsible for performing transportation services. Their services may be subject to their own:", bullets: ["Terms","Service conditions","Prohibited-item rules","Compensation limits","Privacy notices","Operational procedures"], note: "Where appropriate, RELove may provide access to relevant courier information." },
  { id: 46, title: "Personal Data and Shipping", extra: "To arrange and complete delivery, RELove may share necessary personal data with the relevant shipping provider. This may include:", bullets: ["Name","Telephone number","Delivery address","Pickup address or location","Transaction reference","Shipment information"], note: "Further information is available in the RELove Privacy Policy." },
  { id: 47, title: "Shipping Fraud", extra: "Users must not:", bullets: ["Submit false shipment information","Manipulate tracking","Ship empty packages","Reuse labels","Falsely claim delivery","Falsely claim non-delivery","Deliberately redirect parcels","Submit fraudulent courier claims","Otherwise manipulate RELove's shipping process"], note: "RELove may restrict accounts involved in shipping fraud." },
  { id: 48, title: "Evidence in Shipping Disputes", extra: "RELove may rely on evidence including:", bullets: ["Courier tracking","Parcel scans","Delivery records","Pickup records","Photographs","Shipping receipts","Packaging photographs","Communications","GPS or delivery information lawfully provided by the courier","Other relevant evidence"] },
  { id: 49, title: "Reporting Shipping Problems", extra: "Users should report shipping problems through the relevant RELove order wherever possible. Depending on the issue, RELove may need information such as:", bullets: ["Order number","Tracking number","Photographs","Description of the issue","Delivery information","Supporting documents"] },
  { id: 50, title: "Changes to This Policy", extra: "RELove may update this Shipping Policy to reflect:", bullets: ["New shipping providers","Courier pricing","New delivery methods","Operational changes","Product restrictions","Buyer Protection changes","Applicable law","Regulatory requirements"], note: "Where required, we will provide appropriate notice of material changes. The Last updated date at the beginning of this Policy identifies its most recent revision." },
  { id: 51, title: "Contact RELove", extra: "CONTACT_SECTION" },
];

export default function ShippingPolicyPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const toggleSection = (index: number) =>
    setOpenSection(openSection === index ? null : index);

  return (
    <div className="min-h-screen bg-[#f7f2eb]">
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
              Shipping and Delivery on RELove
            </div>
            <div className="flex items-start gap-4 mb-4">
              <Truck className="w-12 h-12 text-[#cb6f4d] flex-shrink-0" />
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                  RELove Shipping Policy
                </h1>
                <p className="mt-2 text-sm text-gray-600">Last updated: [DATE]</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              This Shipping Policy explains how shipping, delivery, tracking, packaging, failed delivery, loss and shipping-related disputes are handled for transactions completed through RELove.
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
            This Policy forms part of the RELove Terms and Conditions and should be read together with our:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Seller Rules", href: "/seller-rules" },
              { label: "Buyer Protection and Refund Policy", href: "#" },
              { label: "Payment, Fees and Payout Policy", href: "#" },
              { label: "Prohibited and Restricted Items Policy", href: "#" },
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
          {sectionData.map((section, index) => {
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
                      {section.extra === "CONTACT_SECTION" ? (
                        <>
                          <p className="text-sm leading-7 text-gray-700 mb-3">For shipping-related support:</p>
                          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-5">
                            <p className="font-semibold text-[#1a1816]">
                              {"\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 \u0e23\u0e35\u0e25\u0e34\u0e1f \u0e08\u0e33\u0e01\u0e31\u0e14"} (Relove Co., Ltd.)
                            </p>
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
                                Shipping Support:{" "}
                                <span className="text-[#cb6f4d] font-semibold">[SUPPORT EMAIL]</span>
                              </p>
                              <p className="text-gray-700">
                                Telephone:{" "}
                                <span className="text-[#cb6f4d] font-semibold">[TELEPHONE NUMBER]</span>
                              </p>
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-gray-600">
                            For an active order, users should use the support or dispute function available within that transaction where possible.
                          </p>
                        </>
                      ) : (
                        <>
                          {section.extra && (
                            <p className="text-sm leading-7 text-gray-700 mb-3">{section.extra}</p>
                          )}
                          {section.bullets && <BulletList items={section.bullets} />}
                          {section.note && <InfoBox>{section.note}</InfoBox>}
                        </>
                      )}
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
            Need help with a shipment?
          </p>
          <p className="text-sm text-white/80 mb-4">
            For active orders, use the support or dispute function within your transaction. Our team is here to help resolve any shipping issues.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b35f3d]"
            >
              Help Centre
            </Link>
            <Link
              href="/seller-rules"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Seller Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
