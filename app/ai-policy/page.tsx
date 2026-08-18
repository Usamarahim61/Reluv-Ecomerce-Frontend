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
  title: "AI Features & Disclosure Policy | RELove",
  description:
    "How RELove uses artificial intelligence, machine learning and automated systems within the Platform.",
};

const sections = [
  {
    id: "1",
    title: "Our Use of AI",
    body: `RELove may use artificial intelligence and automated technologies to make the Platform easier, safer and more efficient to use.

AI may assist with functions such as: recognising products from photographs; suggesting product categories and types; identifying possible brands; identifying colours; suggesting sizes or attributes; generating listing titles and descriptions; suggesting prices; improving search; recommending relevant listings; detecting prohibited or suspicious listings; detecting spam; identifying possible fraud; supporting moderation; and improving Platform functionality.

The AI features available through RELove may change over time.`,
  },
  {
    id: "2",
    title: "AI-Assisted Listing Creation",
    body: `When a Seller uploads photographs or information about an item, RELove may analyse that information using AI.

The system may generate suggestions relating to: category; subcategory; product type; brand; colour; material; size; condition; product attributes; title; description; and estimated or suggested price.

These suggestions are intended to help Sellers create listings more efficiently. They are not guaranteed to be correct.`,
  },
  {
    id: "3",
    title: "Seller Responsibility",
    body: `The Seller remains responsible for the final listing. Before publishing a listing, the Seller must review information generated or suggested by RELove's AI. The Seller must correct any inaccurate information.

The use of an AI-generated suggestion does not transfer responsibility for the accuracy of the published listing from the Seller to RELove.`,
  },
  {
    id: "4",
    title: "AI May Make Mistakes",
    body: `AI systems are probabilistic and may produce inaccurate, incomplete or misleading results. Possible errors may include: misidentifying a brand; selecting the wrong category; misidentifying colours; guessing an incorrect size; incorrectly describing material; overlooking damage; incorrectly assessing condition; creating inaccurate descriptions; suggesting inappropriate keywords; or providing an unrealistic price estimate.

Users should not assume that an AI-generated result has been verified simply because RELove displays it.`,
  },
  {
    id: "5",
    title: "Brand Recognition",
    body: `RELove may use AI to suggest a possible brand based on logos, labels, design features, product appearance, text visible in photographs, and other relevant information.

Brand recognition is not guaranteed to be accurate. A brand suggestion does not mean that RELove has verified the authenticity of the item. The Seller must only identify the item using a brand where the Seller reasonably believes the brand is correct.`,
  },
  {
    id: "6",
    title: "AI Does Not Authenticate Products",
    body: `Unless RELove expressly provides a separate authentication service, AI product recognition does not constitute authentication.

An AI system may recognise visual characteristics associated with a brand while still being unable to determine whether the item is genuine, counterfeit, modified, a replica, or incorrectly labelled.

Users must not represent an item as "authenticated by RELove" merely because RELove's AI suggested a brand.`,
  },
  {
    id: "7",
    title: "Price Suggestions",
    body: `RELove may provide an estimated or suggested selling price. Price suggestions may be generated using information such as product category, brand, condition, product attributes, historical marketplace information, comparable listings, marketplace activity, and other relevant information.

Price suggestions are provided for informational purposes only. They are not formal valuations, professional appraisals, guarantees of market value, guarantees of sale price, or guarantees that an item will sell. The Seller remains free to determine the final listing price.`,
  },
  {
    id: "8",
    title: "Pricing Limitations",
    body: `AI-generated price estimates may be inaccurate because of factors including: limited comparable data; unusual products; rare items; incorrect listing information; changing market demand; seasonality; counterfeit risk; item condition; and incomplete photographs.

Users should apply their own judgement before relying on a suggested price.`,
  },
  {
    id: "9",
    title: "AI-Generated Descriptions",
    body: `RELove may generate or suggest listing descriptions. Generated descriptions may include inferred information concerning appearance, product type, style, colour, material, visible features, and other product characteristics.

AI may infer attributes that cannot be confirmed from a photograph. The Seller must remove or correct any unsupported statement before publication.`,
  },
  {
    id: "10",
    title: "Condition Assessment",
    body: `RELove may use AI to assist with identifying visible characteristics or damage. However, AI may fail to detect stains, odours, internal damage, mechanical faults, hidden defects, repairs, alterations, wear not visible in photographs, or other condition issues.

Sellers remain responsible for accurately describing the condition of the item.`,
  },
  {
    id: "11",
    title: "Search and Recommendations",
    body: `RELove may use automated systems to determine which listings are shown to users. Recommendations may take into account factors such as search terms, category, price, location, previous searches, listings viewed, user preferences, marketplace activity, listing recency, popularity, relevance, and other signals.

Not every user will necessarily see the same listings in the same order.`,
  },
  {
    id: "12",
    title: "Ranking",
    body: `RELove may use automated ranking systems to determine the order of search results, recommended listings, feeds, categories, and other marketplace content. Ranking systems may consider multiple factors.

Where RELove offers paid promotional features that materially affect ranking or visibility, such features should be identified to users where required.`,
  },
  {
    id: "13",
    title: "AI for Safety and Moderation",
    body: `RELove may use automated systems to identify content or activity that may violate applicable law, RELove Terms & Conditions, Prohibited & Restricted Items Policy, intellectual property rules, safety rules, or other Platform policies.

Systems may analyse signals including images, listing text, pricing, account activity, transaction activity, reports, communication patterns, and other relevant information.`,
  },
  {
    id: "14",
    title: "Prohibited Item Detection",
    body: `AI may help identify listings that potentially involve counterfeit goods, weapons, prohibited substances, unsafe products, restricted products, stolen goods, inappropriate content, or other prohibited items.

A flag generated by an automated system does not necessarily prove that a violation has occurred.`,
  },
  {
    id: "15",
    title: "Human Review",
    body: `Where appropriate, RELove may use human review in combination with automated systems. Human review may be used where a listing is flagged, a user appeals a decision, authenticity is disputed, fraud is suspected, a user report requires investigation, or the circumstances require additional judgement.

RELove may request supporting information from users during review.`,
  },
  {
    id: "16",
    title: "Automated Restrictions",
    body: `In some circumstances, automated systems may temporarily prevent publication of a listing, flag a listing, limit certain functionality, request additional verification, or refer activity for further review.

Where required by applicable law, users will be given appropriate information about significant restrictions and available review or complaint mechanisms.`,
  },
  {
    id: "17",
    title: "Fraud Detection",
    body: `RELove may use automated systems to identify potentially suspicious activity. Relevant signals may include unusual transactions, multiple linked accounts, unusual payment behaviour, suspicious shipping patterns, repeated disputes, device information, account history, abnormal pricing, suspicious communication patterns, and other fraud indicators.

A fraud indicator does not automatically establish wrongdoing.`,
  },
  {
    id: "18",
    title: "AI and User Communications",
    body: `Where legally permitted and appropriate, RELove may use automated systems to assist in identifying spam, scams, phishing, harmful links, prohibited transactions, harassment, or other violations.

Such systems may not always correctly interpret context.`,
  },
  {
    id: "19",
    title: "AI-Generated Content Labeling",
    body: `Where RELove generates substantive content on behalf of a user, RELove may identify that information as AI-generated or AI-assisted where appropriate.

However, the absence of an AI label does not necessarily mean that no automated technology was involved in providing Platform functionality.`,
  },
  {
    id: "20",
    title: "User Review Before Publication",
    body: `Where AI assists a Seller in creating a listing, RELove should provide the Seller with a reasonable opportunity to review and edit the suggested information before publication.

Sellers should not be forced to publish AI-generated listing content without review.`,
  },
  {
    id: "21",
    title: "User Feedback",
    body: `RELove may allow users to indicate that an AI suggestion was correct, incorrect, incomplete, or otherwise unhelpful.

Feedback may be used to evaluate and improve Platform functionality.`,
  },
  {
    id: "22",
    title: "Improving AI Systems",
    body: `RELove may use information to evaluate and improve AI-supported functionality where permitted by applicable law. Depending on the implementation, this may include listings, product attributes, corrections made by Sellers, user feedback, moderation outcomes, fraud indicators, marketplace activity, and technical performance information.

Personal data used for AI improvement will be processed in accordance with RELove's Privacy Policy and applicable law.`,
  },
  {
    id: "23",
    title: "Third-Party AI Providers",
    body: `RELove may use third-party AI or technology providers. For example, RELove currently uses Google Gemini for listing-analysis features.

When RELove sends information to such providers, the information shared should be limited to what is reasonably necessary for the relevant purpose. Depending on the service, information may include uploaded photographs, product information, text, technical information, or other necessary data.

Third-party providers may process information according to contractual arrangements with RELove and applicable law. Relevant information about data processing is provided in our Privacy Policy.`,
  },
  {
    id: "24",
    title: "AI Provider Training",
    body: `Whether a third-party AI provider may use RELove data to train or improve its own models will depend on RELove's contractual arrangement with that provider.

RELove should seek to configure or contract for services in a manner that appropriately protects user information and reflects RELove's privacy commitments. RELove will not state that user data is excluded from third-party model training unless this has actually been established contractually and technically.`,
  },
  {
    id: "25",
    title: "Personal Data",
    body: `AI functionality may involve processing personal data. For example, uploaded photographs may incidentally contain people, names, addresses, documents, location information, or other personal information.

Users should avoid including unnecessary personal data in product photographs or listing information. Personal data processed through AI functionality is governed by RELove's Privacy Policy and applicable Thai data-protection law.`,
  },
  {
    id: "26",
    title: "Sensitive Personal Data",
    body: `Users should not intentionally submit sensitive personal data to AI listing tools unless specifically requested for a lawful and necessary purpose. Examples may include information concerning health, biometric characteristics, ethnicity, religion, political views, sexual behaviour, or other sensitive categories recognised under applicable law.`,
  },
  {
    id: "27",
    title: "Images Containing People",
    body: `Users should avoid uploading photographs containing identifiable individuals where those individuals are not relevant to the listing. Where possible, product photographs should focus on the item being sold.

Users are responsible for ensuring they have the appropriate rights or legal basis to upload content containing other persons.`,
  },
  {
    id: "28",
    title: "AI and Intellectual Property",
    body: `AI-generated suggestions do not give users permission to infringe intellectual property rights. For example, if an automated system incorrectly suggests a brand, the Seller must not use that brand where it does not genuinely apply.

Users remain responsible for complying with the Intellectual Property & Counterfeit Policy.`,
  },
  {
    id: "29",
    title: "AI-Generated Images",
    body: `RELove may restrict AI-generated or materially altered product images. Sellers must not use AI-generated images to falsely represent an item that does not exist, condition, colour, included accessories, defects, authenticity, or other material characteristics.

Photographs of the actual item should be used for ordinary second-hand listings.`,
  },
  {
    id: "30",
    title: "No Professional Advice",
    body: `AI-generated information provided through RELove is not professional advice. This includes valuation advice, legal advice, financial advice, authentication advice, and product-safety advice.

Users should obtain qualified professional advice where appropriate.`,
  },
  {
    id: "31",
    title: "No Guarantee of Availability or Accuracy",
    body: `RELove does not guarantee that AI features will always be available, recognise every product, return accurate results, produce consistent results, identify counterfeit goods, identify prohibited goods, provide correct prices, or function without interruption.

AI features may be changed, restricted or discontinued.`,
  },
  {
    id: "32",
    title: "User Manipulation of AI Systems",
    body: `Users must not deliberately attempt to manipulate RELove's automated systems. Prohibited conduct may include intentionally misleading image-recognition systems, manipulating product photographs to bypass moderation, adversarial prompts or inputs intended to evade safety controls, deliberately miscategorising prohibited products, manipulating AI-based ranking, exploiting technical weaknesses, or using automated systems to facilitate fraud.`,
  },
  {
    id: "33",
    title: "Automated Scraping and Model Training",
    body: `Users must not systematically scrape, extract or copy RELove content for the purpose of building datasets, training AI models or operating competing automated systems except where authorised by RELove or permitted by applicable law.

This section does not restrict rights that cannot lawfully be excluded.`,
  },
  {
    id: "34",
    title: "AI Risk Management",
    body: `RELove may periodically assess risks associated with its AI systems. Risk assessment may consider accuracy, bias, user safety, fraud, privacy, security, intellectual property, consumer impact, marketplace manipulation, and unintended consequences.

RELove may modify, restrict or discontinue AI functionality where risks cannot reasonably be managed.`,
  },
  {
    id: "35",
    title: "Testing and Monitoring",
    body: `RELove may test and monitor AI systems to evaluate matters such as recognition accuracy, error rates, false-positive moderation decisions, false-negative moderation decisions, pricing accuracy, user corrections, fraud detection, security, and system performance.`,
  },
  {
    id: "36",
    title: "Bias and Fairness",
    body: `AI systems may produce different results depending on available data, product category, brand, image quality, language, user behaviour, and other factors.

RELove will seek to identify and manage material unfairness where reasonably practicable. No automated system can be guaranteed to be completely free from error or bias.`,
  },
  {
    id: "37",
    title: "Security",
    body: `RELove will take reasonable technical and organisational measures appropriate to the risks associated with AI-supported processing. Measures may include access controls, authentication, monitoring, provider controls, secure data transmission, logging, and incident-response procedures.`,
  },
  {
    id: "38",
    title: "Changes to AI Features",
    body: `RELove may change AI providers, models, algorithms, functionality, data inputs, ranking systems, and automated moderation systems.

Where such changes materially affect users' privacy or rights, RELove will update relevant notices or provide additional information where required.`,
  },
  {
    id: "39",
    title: "Complaints and Appeals",
    body: `Users may report concerns about AI-generated information or automated Platform decisions through RELove's support or complaint channels. Where an eligible moderation or enforcement decision can be reviewed, the user may be able to request human review or submit an appeal.

Further information is provided in our Complaints & Dispute Resolution Policy.`,
  },
  {
    id: "40",
    title: "Changes to This Policy",
    body: `RELove may update this Policy to reflect changes to AI functionality, changes to third-party providers, new models or systems, changes to applicable law, regulatory guidance, marketplace risks, or changes to RELove's business.

Where required, RELove will provide appropriate notice of material changes. The Last updated date at the beginning of this Policy identifies the most recent revision.`,
  },
];

const highlights = [
  {
    icon: Sparkles,
    title: "AI helps create listings",
    text: "We use AI to suggest details, titles, descriptions, and price references.",
  },
  {
    icon: ShieldCheck,
    title: "You stay in control",
    text: "Sellers must review and correct everything before publishing a listing.",
  },
  {
    icon: TriangleAlert,
    title: "AI can be wrong",
    text: "Suggestions are helpful, but they are not guaranteed to be accurate.",
  },
  {
    icon: MessageCircleMore,
    title: "You can give feedback",
    text: "If something looks wrong, you can report it or ask for a review.",
  },
];

const quickLinks = [
  { label: "Our use of AI", href: "#section-1" },
  { label: "Price suggestions", href: "#section-7" },
  { label: "Human review", href: "#section-15" },
  { label: "Complaints", href: "#section-39" },
];

export default function AiPolicyPage(): JSX.Element {
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
                Clear guidance for AI-assisted selling
              </div>
              <h1 className="max-w-2xl font-serif text-4xl font-bold tracking-tight text-[#1a1816] sm:text-5xl">
                AI Features &amp; Disclosure Policy
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700">
                This policy explains how RELove uses AI, what the system can help
                with, and where sellers must take over. It is designed to be
                readable first, legal second, and practical all the way through.
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
                  AI helps draft and sort information, but the seller is always
                  responsible for the final listing.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  Suggested prices are references, not appraisals or guarantees.
                </div>
                <div className="rounded-2xl bg-[#f8f2ea] p-3 text-sm text-gray-700">
                  If something looks wrong, sellers can give feedback or ask for
                  human review.
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="rounded-[1.75rem] border border-[#eadfcd] bg-white px-5 py-5 shadow-sm sm:px-6">
              <p className="text-sm text-gray-700">
                This AI Features &amp; Disclosure Policy (&ldquo;Policy&rdquo;)
                explains how RELove may use artificial intelligence, machine
                learning, automated systems and related technologies within the
                RELove Platform.
              </p>

              <p className="mt-4 text-sm text-gray-700">
                This Policy forms part of the RELove legal framework and should
                be read together with our Terms &amp; Conditions, Privacy
                Policy, Seller Rules, Prohibited &amp; Restricted Items Policy,
                Intellectual Property &amp; Counterfeit Policy, and Buyer
                Protection &amp; Refund Policy.
              </p>

              <div className="mt-6 rounded-2xl border border-[#eadfcd] bg-[#fbf6ea] p-4 text-sm text-gray-700">
                <p className="font-semibold text-[#1a1816]">RELove is operated by:</p>
                <p className="mt-1">Relove Co., Ltd.</p>
                <p>Juristic Person Registration No. 0115569025684</p>
                <p className="mt-2">16 Moo 11, Suksawat Road, Nai Khlong Bang Pla Kot Subdistrict,</p>
                <p>Phra Samut Chedi District, Samut Prakan Province, Thailand</p>
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
                Contact and complaints
              </p>
              <p className="mt-2 text-white/80">
                Questions about AI-powered features, reporting errors, or
                requesting review all belong here.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">AI / Platform Support</p>
                  <p className="mt-1 text-white/70">[SUPPORT EMAIL]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">Privacy requests</p>
                  <p className="mt-1 text-white/70">[PRIVACY EMAIL]</p>
                </div>
              </div>
              <p className="mt-4 text-white/70">Telephone: [TELEPHONE NUMBER]</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
