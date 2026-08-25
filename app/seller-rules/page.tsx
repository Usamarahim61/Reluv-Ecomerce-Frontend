"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ChevronDown, 
  ShoppingBag,
  BadgeInfo,
  Package,
  Camera,
  DollarSign,
  Truck,
  AlertTriangle,
  Shield,
  FileText,
  CheckCircle
} from "lucide-react";

const quickLinks = [
  { label: "Seller responsibility", href: "#section-1" },
  { label: "Listing accuracy", href: "#section-6" },
  { label: "Shipping rules", href: "#section-20" },
  { label: "Contact us", href: "#section-46" },
];

export default function SellerRulesPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      id: 1,
      title: "Seller Responsibility",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            When you list an item on RELove, you are responsible for ensuring that:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "You have the legal right to sell the item",
              "The item is permitted on RELove",
              "The item may lawfully be sold in Thailand",
              "Your listing is accurate",
              "Your photographs represent the actual item",
              "Defects and damage are properly disclosed",
              "Brand and authenticity information is accurate",
              "The item you ship is the item described in the listing",
              "You comply with applicable laws and RELove policies"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Important:</strong> RELove's acceptance or publication of a listing does not guarantee that the listing or item complies with applicable law.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 2,
      title: "Who May Sell",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Users must satisfy RELove's applicable account and eligibility requirements before selling. RELove may require additional verification before allowing a user to:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Publish listings",
              "Complete certain transactions",
              "Receive payouts",
              "Sell higher-risk products",
              "Sell higher-value items",
              "Continue selling after unusual activity is detected"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Users must provide accurate information during verification.
          </p>
        </>
      ),
    },
    {
      id: 3,
      title: "Private and Professional Sellers",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove may distinguish between:
          </p>
          <div className="space-y-4 mb-4">
            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Private Sellers</h3>
              <p className="text-sm leading-6 text-gray-700">
                Individuals selling items primarily for personal, non-business purposes.
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfcd] bg-[#f8f2ea] p-4">
              <h3 className="font-semibold text-[#1a1816] mb-2 text-sm">Professional or Business Sellers</h3>
              <p className="text-sm leading-6 text-gray-700">
                Persons or businesses selling as part of commercial or professional activity.
              </p>
            </div>
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            If you sell items through RELove as part of a business, profession or regular commercial activity, you must accurately identify your status where required by RELove or applicable law.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Professional Sellers may be subject to additional requirements concerning:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {["Business identification", "Consumer information", "Pricing", "Taxation", "Invoices", "Returns", "Warranties", "Product safety", "Other consumer-protection obligations"].map((item, idx) => (
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
      id: 4,
      title: "Items You May Sell",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You may only list items that comply with:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Applicable Thai law",
              "RELove Terms & Conditions",
              "The Prohibited & Restricted Items Policy",
              "Product-safety requirements",
              "Any category-specific RELove rules"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            If you are unsure whether an item is permitted, do not list it until the applicable requirements have been confirmed.
          </p>
        </>
      ),
    },
    {
      id: 5,
      title: "Items Must Be Available",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You should only list items that:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "You possess",
              "You own or are authorised to sell",
              "Are available for shipment",
              "Can be supplied within the applicable shipping period"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              You must not create listings for items that do not exist or that you cannot reasonably supply. Unless RELove expressly permits otherwise, listings for speculative stock, unauthorised dropshipping or unavailable products are prohibited.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 6,
      title: "Listing Accuracy",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Every listing must accurately describe the item being offered. You must provide accurate information concerning relevant attributes such as:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Brand", "Product type", "Size", "Colour", "Material", "Condition", "Model", "Quantity", "Included accessories", "Significant defects"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            You must not deliberately omit information that would materially affect a Buyer's decision to purchase the item.
          </p>
        </>
      ),
    },
    {
      id: 7,
      title: "Item Condition",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You must select the condition that most accurately reflects the actual item. Where relevant, you must disclose:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Stains", "Holes", "Tears", "Scratches", "Missing parts", "Repairs", "Alterations", "Fading", "Significant wear", "Functional defects", "Damage", "Other material imperfections"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Normal second-hand wear may be acceptable, but it must not be deliberately concealed.
          </p>
        </>
      ),
    },
    {
      id: 8,
      title: "Photographs",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Listing photographs must accurately represent the item being sold. Where reasonably possible, Sellers should use photographs of the actual item.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Photographs should clearly show:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The overall item", "Condition", "Relevant labels", "Significant defects", "Material wear", "Details reasonably necessary for Buyers to assess the item"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            You must not use photographs in a way that materially misrepresents the item.
          </p>
        </>
      ),
    },
    {
      id: 9,
      title: "Photograph Editing",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Basic adjustments that do not materially alter the appearance of the item may be acceptable. You must not use editing tools, filters or AI image-generation tools to:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Hide defects",
              "Improve the apparent condition deceptively",
              "Change its colour materially",
              "Add components that are not included",
              "Remove damage",
              "Create a fake product image",
              "Otherwise mislead Buyers"
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
      id: 10,
      title: "AI-Generated Listing Suggestions",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may use AI to suggest:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Categories", "Brands", "Colours", "Sizes", "Product attributes", "Titles", "Descriptions", "Prices"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 mb-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>These are suggestions only.</strong> Before publishing a listing, you must check that all AI-generated information is accurate.
            </p>
          </div>
          <p className="text-sm text-gray-700 italic">
            If RELove's AI identifies a bag as Louis Vuitton when it is actually from a completely different brand, publishing "Louis Vuitton" anyway remains the Seller's responsibility. The computer being confidently wrong does not magically transfer ownership of the mistake to RELove.
          </p>
        </>
      ),
    },
    {
      id: 11,
      title: "Brands",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You must only identify an item using a brand where that brand genuinely applies to the item. You must not:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Select a popular brand simply to increase visibility",
              "Describe an unbranded product as branded",
              "Use another brand's name for comparison in a misleading way",
              "Deliberately select an incorrect brand"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            If the brand is unknown, use the appropriate unbranded or unknown option where available.
          </p>
        </>
      ),
    },
    {
      id: 12,
      title: "Authenticity",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            You must only list branded goods that you reasonably believe are authentic. Counterfeit products are prohibited.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            For certain items, RELove may request evidence of authenticity, including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Purchase receipts", "Invoices", "Serial numbers", "Product codes", "Authenticity cards", "Detailed photographs", "Original packaging", "Other relevant evidence"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Failure to provide requested information may result in removal of the listing or other restrictions.
          </p>
        </>
      ),
    },
    {
      id: 13,
      title: "Proof of Ownership",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may request evidence that you own or are lawfully authorised to sell an item, particularly where:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "An item is high value",
              "Theft is suspected",
              "Multiple identical products are listed",
              "Suspicious selling behaviour is detected",
              "A report has been received"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Supporting information may include purchase evidence, photographs or other reasonable proof.
          </p>
        </>
      ),
    },
    {
      id: 14,
      title: "Listing Price",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            You are responsible for setting the selling price of your item. Any price suggested by RELove is for guidance only.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            You must not use pricing practices designed to materially mislead Buyers, including displaying a price that does not correspond to the item actually offered.
          </p>
          <p className="text-sm text-gray-600">
            Mandatory fees and charges controlled by RELove will be shown separately where applicable.
          </p>
        </>
      ),
    },
    {
      id: 15,
      title: "Duplicate Listings",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            You must not create multiple misleading listings for the same individual item.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Once a unique second-hand item has been sold or is no longer available, you should remove or deactivate the listing where this does not happen automatically.
          </p>
          <p className="text-sm text-gray-600">
            Professional Sellers with multiple units of an eligible product may be subject to separate functionality or rules.
          </p>
        </>
      ),
    },
    {
      id: 16,
      title: "Keywords and Search Manipulation",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Listings must not contain irrelevant brand names, product names or keywords solely to manipulate search results.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Examples include inserting multiple luxury brand names into the description of an unrelated item.
          </p>
          <p className="text-sm text-gray-600">
            RELove may remove irrelevant keywords or restrict listings that manipulate search or recommendation systems.
          </p>
        </>
      ),
    },
    {
      id: 17,
      title: "Communication With Buyers",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers must communicate honestly and respectfully. You must not:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {[
              "Provide false product information",
              "Threaten or harass Buyers",
              "Pressure Buyers to close legitimate disputes",
              "Send spam",
              "Request unnecessary personal information",
              "Misuse Buyer contact details",
              "Mislead Buyers about RELove policies"
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
      id: 18,
      title: "Keeping Transactions on RELove",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where RELove requires a transaction to be completed through its checkout system, Sellers must not deliberately direct Buyers outside the Platform to avoid:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["RELove fees", "Buyer Protection", "Payment controls", "Transaction records", "Other Platform safeguards"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Examples may include asking a Buyer to:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Make a direct bank transfer", "Send money using another payment service", "Complete the transaction through social media", "Cancel a RELove transaction and pay privately"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              <strong>Warning:</strong> Off-platform transactions may not receive RELove protection.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 19,
      title: "Confirming a Sale",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            When your item sells, you must check the transaction details and prepare the correct item for shipment.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            You should not ship an item until the Platform indicates that payment or the transaction has been appropriately confirmed.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              Do not rely solely on screenshots or messages sent by Buyers claiming that payment has been made.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 20,
      title: "Packaging",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers are responsible for packaging items appropriately. Packaging should:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {[
              "Protect the item during ordinary transportation",
              "Be suitable for the type of item",
              "Minimise reasonably foreseeable damage",
              "Comply with shipping-provider requirements",
              "Avoid creating hazards"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where an item is damaged because of clearly inadequate packaging, this may affect responsibility in a Buyer Protection dispute.
          </p>
        </>
      ),
    },
    {
      id: 21,
      title: "Shipping Deadline",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Sellers must ship sold items within the deadline shown by RELove for the relevant transaction.
          </p>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-4 mb-4">
            <p className="text-sm text-gray-700">[FINAL SHIPPING DEADLINE TO BE INSERTED]</p>
            <p className="text-xs text-gray-600 mt-2">
              For launch, RELove should establish one clear standard shipping deadline unless a particular shipping service requires another period.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            If the Seller does not ship within the applicable period, RELove may cancel the transaction and refund the Buyer.
          </p>
        </>
      ),
    },
    {
      id: 22,
      title: "Shipping Method",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where RELove provides an integrated shipping method, Sellers should use the shipping method assigned or selected for the transaction unless RELove permits otherwise. Sellers must not:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {["Reuse shipping labels", "Alter labels fraudulently", "Provide false tracking information", "Ship a different item under the assigned shipment", "Manipulate shipment records"].map((item, idx) => (
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
      id: 23,
      title: "Shipping the Correct Item",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Before sealing the package, the Seller should verify that:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The correct item is included", "The correct quantity is included", "Agreed accessories are included", "The package corresponds to the relevant transaction"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Sending the wrong item may result in a Buyer Protection claim and return.
          </p>
        </>
      ),
    },
    {
      id: 24,
      title: "Proof of Shipment",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where required, Sellers should retain shipment evidence until the transaction is complete. This may include:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Shipping receipt", "Tracking information", "Drop-off confirmation", "Pickup confirmation", "Other shipping-provider evidence"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Integrated shipping information may be retained automatically by RELove.
          </p>
        </>
      ),
    },
    {
      id: 25,
      title: "Seller Cancellations",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers should only list items they genuinely intend and are able to sell. A Seller may cancel where RELove provides cancellation functionality, but repeated avoidable cancellations may lead to restrictions.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Examples of poor Seller conduct include repeatedly cancelling because:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["The Seller changed their mind", "The item was already sold elsewhere", "The Seller listed the wrong price", "The item cannot be found", "The Seller continually fails to ship"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-700 italic">
            Occasional genuine mistakes may happen. Repeated ones stop looking like mistakes.
          </p>
        </>
      ),
    },
    {
      id: 26,
      title: "Failure to Ship",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            If a Seller does not ship within the applicable period:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {["The transaction may be automatically cancelled", "The Buyer may be refunded", "The Seller may not receive payment", "Repeated failures may affect the Seller's account"].map((item, idx) => (
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
      id: 27,
      title: "Buyer Complaints",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            If a Buyer reports a problem, Sellers must cooperate reasonably with the dispute process. You may be asked to provide:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Photographs", "Proof of shipment", "Listing information", "Receipts", "Authenticity evidence", "Serial numbers", "Communications", "Other relevant evidence"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            You must provide truthful information.
          </p>
        </>
      ),
    },
    {
      id: 28,
      title: "Returns",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where RELove authorises a Buyer to return an item, the Seller must cooperate with the return process.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            If the returned item is materially different from the item originally sent, the Seller should report the issue promptly and provide evidence.
          </p>
          <p className="text-sm text-gray-600">
            RELove will consider relevant information from both parties.
          </p>
        </>
      ),
    },
    {
      id: 29,
      title: "Return Fraud",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers are protected against dishonest return behaviour. A Buyer must not:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Return a different item", "Intentionally damage an item", "Remove parts", "Replace an authentic item with a counterfeit", "Manipulate evidence", "Otherwise abuse the return process"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              Sellers who believe return fraud has occurred should report it immediately.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 30,
      title: "Seller Payout",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Seller proceeds become available according to RELove's payment and Buyer Protection process. Payment may be delayed where:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Delivery is pending", "The Buyer Protection period remains open", "A dispute has been reported", "Seller verification is incomplete", "Fraud is suspected", "Payment verification is required", "The transaction is under investigation", "Applicable law requires funds or processing to be restricted"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Detailed rules are provided in the Payment, Fees & Payout Policy.
          </p>
        </>
      ),
    },
    {
      id: 31,
      title: "Fees",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            RELove may charge Sellers for certain services. Any applicable mandatory fee will be disclosed before the Seller uses the relevant paid service or completes the relevant action.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Optional paid services may include features such as:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Promoted listings", "Increased visibility", "Subscriptions", "Other marketplace tools"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Sellers must not attempt to evade applicable RELove fees through prohibited transaction circumvention.
          </p>
        </>
      ),
    },
    {
      id: 32,
      title: "Taxes",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers are responsible for understanding and complying with tax obligations applicable to their selling activities. Where required by law, RELove may:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Collect tax-related information", "Maintain transaction records", "Provide information to competent authorities", "Perform other legally required reporting"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            RELove does not automatically determine each Seller's individual tax obligations. Professional Sellers should obtain appropriate tax or accounting advice where necessary.
          </p>
        </>
      ),
    },
    {
      id: 33,
      title: "Product Safety",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Sellers must not list unsafe, recalled or legally non-compliant products.
          </p>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            Where a product category is subject to regulatory standards or certification, the Seller is responsible for ensuring compliance.
          </p>
          <p className="text-sm text-gray-600">
            RELove may request product information before or after publication.
          </p>
        </>
      ),
    },
    {
      id: 34,
      title: "Restricted Products",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Certain categories may require additional information before being allowed on RELove. Depending on the product, RELove may request:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Regulatory registration", "Thai FDA information", "TIS information", "Manufacturer details", "Importer details", "Safety documentation", "Other legally required information"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            An inability to provide required documentation may result in the listing being rejected or removed.
          </p>
        </>
      ),
    },
    {
      id: 35,
      title: "Personal Data of Buyers",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            A Seller may receive limited personal information about a Buyer where necessary to complete a transaction. You may use that information only for the purpose for which it was provided. You must not:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Add Buyers to marketing databases without a lawful basis", "Contact Buyers for unrelated marketing", "Sell Buyer information", "Publish their information", "Retain unnecessary copies", "Harass Buyers outside RELove", "Otherwise misuse personal data"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Additional rules are provided in our Privacy Policy.
          </p>
        </>
      ),
    },
    {
      id: 36,
      title: "Reviews",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers must not manipulate RELove reviews. You must not:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {["Buy positive reviews", "Create fake transactions for reviews", "Offer money or benefits in exchange for misleading ratings", "Threaten Buyers over reviews", "Retaliate against Buyers for legitimate negative feedback", "Operate multiple accounts to manipulate reputation"].map((item, idx) => (
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
      id: 37,
      title: "Professional Selling Activity",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may review accounts to determine whether selling activity appears commercial. Relevant factors may include:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Number of listings", "Transaction frequency", "Volume of identical goods", "Purchasing goods specifically for resale", "Regular commercial activity", "Operation under a business identity", "Other relevant circumstances"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where appropriate, RELove may require a Seller to register or identify themselves as a professional Seller before continuing to use certain services.
          </p>
        </>
      ),
    },
    {
      id: 38,
      title: "Seller Verification",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may require Sellers to verify information such as:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {["Identity", "Telephone number", "Email address", "Payment information", "Payout details", "Business identity", "Address", "Product information", "Other information necessary for safety, payments or regulatory compliance"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            RELove may restrict selling or payouts until required verification is completed.
          </p>
        </>
      ),
    },
    {
      id: 39,
      title: "Fraud and Suspicious Activity",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers must not engage in fraud or deceptive behaviour. Examples include:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Listing items that do not exist", "Intentionally sending empty packages", "Manipulating tracking information", "Selling counterfeit goods", "Account takeover", "Payment fraud", "Colluding with Buyers", "Creating fake transactions", "Manipulating promotions", "Using RELove to launder or conceal unlawfully obtained funds"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4">
            <p className="text-sm leading-6 text-gray-700">
              RELove may investigate suspicious activity and take appropriate action.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 40,
      title: "Multiple Accounts and Suspension Evasion",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Sellers must not create or use additional accounts to:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Evade suspension", "Bypass listing limits", "Avoid verification", "Hide previous violations", "Manipulate reviews", "Circumvent enforcement actions"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Related accounts may also be restricted where reasonably necessary to enforce RELove policies.
          </p>
        </>
      ),
    },
    {
      id: 41,
      title: "Listing Removal",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may remove or restrict a Seller's listing where we reasonably believe that:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {["The item is prohibited", "The listing is misleading", "The item is counterfeit", "Intellectual property rights may be infringed", "The product may be unsafe", "Required information is missing", "Regulatory requirements may not be satisfied", "The listing violates RELove rules", "Action is required by law or a competent authority"].map((item, idx) => (
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
      id: 42,
      title: "Seller Warnings and Restrictions",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Depending on the seriousness and frequency of violations, RELove may:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Provide guidance", "Issue a warning", "Remove a listing", "Temporarily restrict selling", "Require additional verification", "Delay payouts where justified", "Suspend an account", "Permanently terminate access"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Enforcement should be proportionate to the circumstances, subject to applicable law.
          </p>
        </>
      ),
    },
    {
      id: 43,
      title: "Serious Violations",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may take immediate restrictive action for serious conduct, including:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Fraud", "Sale of counterfeit goods", "Sale of stolen goods", "Illegal goods", "Serious safety risks", "Identity fraud", "Repeated deliberate misrepresentation", "Payment abuse", "Conduct creating significant risk to users or RELove"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where required or permitted by law, RELove may cooperate with competent authorities.
          </p>
        </>
      ),
    },
    {
      id: 44,
      title: "Appeals",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            Where an appeal process is available, Sellers may request review of an eligible enforcement decision. An appeal should explain:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Which decision is disputed", "Why the Seller believes it was incorrect", "Any relevant supporting evidence"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            RELove may uphold, modify or reverse the original decision after review. Further information is provided in our Complaints & Dispute Resolution Policy.
          </p>
        </>
      ),
    },
    {
      id: 45,
      title: "Changes to These Rules",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-3">
            RELove may update these Seller Rules to reflect:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {["Changes to Platform functionality", "Marketplace risks", "Shipping processes", "Payment arrangements", "Fraud trends", "Regulatory requirements", "Applicable law"].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#cb6f4d] mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Where required, we will provide appropriate notice of material changes. The <strong>Last updated</strong> date at the beginning of these Rules identifies the most recent revision.
          </p>
        </>
      ),
    },
    {
      id: 46,
      title: "Contact RELove",
      content: (
        <>
          <p className="text-sm leading-7 text-gray-700 mb-4">
            For questions relating to selling:
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
                Seller Support: <span className="text-[#cb6f4d] font-semibold">[SUPPORT EMAIL]</span>
              </p>
              <p className="text-gray-700">
                Telephone: <span className="text-[#cb6f4d] font-semibold">[TELEPHONE NUMBER]</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            To report a prohibited product, counterfeit item or other violation, use the appropriate Report Listing functionality through RELove.
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
              Rules for all sellers on RELove
            </div>
            <div className="flex items-start gap-4 mb-4">
              <ShoppingBag className="w-12 h-12 text-[#cb6f4d] flex-shrink-0" />
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                  RELove Seller Rules
                </h1>
                <p className="mt-2 text-sm text-gray-600">Last updated: [DATE]</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              These Seller Rules apply to all users who list, offer or sell items through RELove. They form part of the RELove Terms & Conditions.
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
            These Seller Rules should be read together with our:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Prohibited & Restricted Items Policy", href: "#" },
              { label: "Buyer Protection & Refund Policy", href: "#" },
              { label: "Shipping Policy", href: "#" },
              { label: "Shipping Policy", href: "/shipping-policy" },
              { label: "Payment, Fees & Payout Policy", href: "#" },
              { label: "Intellectual Property & Counterfeit Policy", href: "#" },
              { label: "Community Standards", href: "#" },
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
            Ready to start selling?
          </p>
          <p className="text-sm text-white/80 mb-4">
            Follow these rules to create successful listings and provide great buyer experiences on RELove.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/SellNow"
              className="inline-flex items-center gap-2 rounded-full bg-[#cb6f4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b35f3d]"
            >
              Start Selling
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Seller Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
