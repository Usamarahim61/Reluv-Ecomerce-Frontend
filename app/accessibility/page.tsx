import Image from "next/image";
import Footer from "../components/Footer";


export default function AccessibilityPage() {
  return (
    <>
    <main className="bg-[#F5F7F6]">
      {/* ================= HERO SECTION ================= */}
      <section className="text-center max-w-6xl mx-auto rounded-4xl pt-24 pb-40">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Accessibility at Reluv
        </h1>

        <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto pb-5">
          Second-hand is for everyone. That's why we're committed to
          making Reluv as accessible as possible, so more members can
          earn, save, and enjoy a great experience.
        </p>
<section className="container relative w-full h-[600px]">
  <Image
    src="https://marketplace-web-assets.vinted.com/assets/landing-pages/accessibility/first-section-desktop.png"
    alt="Accessibility page hero illustration"
    fill
    className="object-cover rounded-2xl"
  />
</section>      </section>

      {/* ================= WHAT WE’RE DOING ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Title */}
          <div>
            <h2 className="text-5xl font-semibold text-gray-900">
              What we’re doing
            </h2>
          </div>

          {/* Right Cards */}
          <div className="space-y-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 py-16 flex gap-6  shadow-sm items-center">
              <div className="w-full h-full rounded-xl flex items-center justify-center">
                {/* Replace with your SVG */}
                <span className="text-4xl"><Image src="https://marketplace-web-assets.vinted.com/assets/landing-pages/accessibility/card-1.svg" alt="" width={150} height={150} className="object-cover"></Image></span>
              </div>

              <div>
                <h3 className="text-3xl font-semibold mb-3">
                  Research and testing
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  In our testing lab, we use assistive technologies like
                  screen readers, alternative input devices, and speech
                  recognition software to improve the Reluv website and
                  app for members of all abilities.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 py-16 flex gap-6  shadow-sm items-center">
              <div className="w-full h-full rounded-xl flex items-center justify-center">
<span className="text-4xl"><Image src="https://marketplace-web-assets.vinted.com/assets/landing-pages/accessibility/card-2.svg" alt="" width={150} height={150} className="object-cover"></Image></span>

              </div>

              <div>
                <h3 className="text-3xl font-semibold mb-3">
                  Designing with care
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Our dedicated team makes sure accessibility is embedded
                  into every stage of design and development, guiding us
                  with best practices and offering essential training.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 py-16 flex gap-6  shadow-sm items-center">
              <div className="w-full h-full rounded-xl flex items-center justify-center">
                                <span className="text-4xl"><Image src="https://marketplace-web-assets.vinted.com/assets/landing-pages/accessibility/card-3.svg" alt="" width={150} height={150} className="object-cover"></Image></span>

              </div>

              <div>
                <h3 className="text-3xl font-semibold mb-3">
                  Following WCAG standards
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  We use the Web Content Accessibility Guidelines and the
                  latest research insights to enhance your experience.
                  If anything falls short, let us know.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEEDBACK SECTION ================= */}
      <section className="bg-[#0D5C63] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <h2 className="text-5xl font-semibold">Have feedback?</h2>

          <div className="space-y-4 text-xl leading-relaxed">
            <p>
              To help shape Reluv with your story, email our support
              team:
            </p>

            <a
              href="mailto:accessibility@reluv.ie"
              className="underline font-medium"
            >
              accessibility@reluv.ie
            </a>

            <p>
              Be sure to include details about your device or assistive
              technology and the steps leading to any issues.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER NOTE ================= */}
      <section className="text-center text-sm text-gray-500 py-10 px-6">
        <p>
          When you send us an email, your personal data will be processed
          as described in our Privacy Policy. The related private
          messages may be reviewed by Reluv community support in
          accordance with our Terms and Conditions.
        </p>
      </section>
    </main>
    <Footer/>
    </>
  );
}