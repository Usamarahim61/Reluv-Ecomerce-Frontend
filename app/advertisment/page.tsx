import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const rowClass = "grid grid-cols-1 md:grid-cols-[1fr_1.1fr] border-t border-[#e5e7eb]";
const labelClass = "px-5 py-4 text-[15px] font-semibold text-[#111827]";
const valueClass = "px-5 py-4 text-[15px] text-[#6b7280] border-l border-[#e5e7eb]";

export default function AdvertismentPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#efefef]">
        <section className="relative overflow-hidden bg-[#0a7d84]">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 px-5 pb-16 pt-10 md:grid-cols-2 md:px-8 md:pt-12">
            <div className="text-white">
              <h1 className="mb-6 text-[44px] font-semibold leading-[1.15]">Advertise with Vinted</h1>
              <p className="mb-6 max-w-[560px] text-[22px] leading-[1.5]">
                Vinted is the largest online C2C marketplace in Europe dedicated to second-hand fashion, with over 80 million members and we&apos;re growing.
              </p>
              <p className="max-w-[560px] text-[22px] leading-[1.5]">Want to work with us? Tell us more in the form below.</p>
            </div>

            <div className="relative h-[280px] w-full md:h-[320px]">
              <Image
                src="https://marketplace-web-assets.vinted.com/assets/business-page/hero-illustration.svg"
                alt="Advertising hero illustration"
                fill
                className="object-contain md:object-right"
                priority
              />
            </div>
          </div>
          <div className="tear-divider bg-[#efefef]" />
        </section>

        <section className="px-4 pb-20 pt-14">
          <div className="mx-auto max-w-[700px] rounded-md border border-[#d9d9d9] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-5">
              <h2 className="text-[38px] font-semibold text-[#111827]">Submit a request</h2>
              <p className="mt-2 text-[22px] text-[#6b7280]">Complete each section in English.</p>
            </div>

            <FormSection number="1" title="Contact information">
              <div className={rowClass}>
                <p className={labelClass}>First name</p>
                <p className={valueClass}>Enter your first name(s)</p>
              </div>
              <div className={rowClass}>
                <p className={labelClass}>Last name</p>
                <p className={valueClass}>Enter your last name(s)</p>
              </div>
              <div className={rowClass}>
                <p className={labelClass}>Email address</p>
                <p className={valueClass}>Enter your email</p>
              </div>
              <div className={rowClass}>
                <p className={labelClass}>Phone number (optional)</p>
                <p className={valueClass}>Enter your phone number</p>
              </div>
            </FormSection>

            <FormSection number="2" title="Company information">
              <div className={rowClass}>
                <p className={labelClass}>Company type</p>
                <p className={valueClass}>Please select</p>
              </div>
              <div className={rowClass}>
                <p className={labelClass}>Company name</p>
                <p className={valueClass}>Enter company name</p>
              </div>
            </FormSection>

            <FormSection number="3" title="Additional information">
              <div className={rowClass}>
                <p className={labelClass}>Estimated budget (€)</p>
                <p className={valueClass}>Please select</p>
              </div>
              <div className={rowClass}>
                <p className={labelClass}>Where are you located?</p>
                <p className={valueClass}>Please select</p>
              </div>
              <div className={rowClass}>
                <p className={labelClass}>Type of request</p>
                <p className={valueClass}>Please select</p>
              </div>
              <div className="border-t border-[#e5e7eb] px-5 py-4">
                <p className="text-[15px] font-semibold text-[#111827]">
                  Share any other relevant information. <span className="font-normal text-[#6b7280]">Please write in English.</span>
                </p>
                <div className="mt-3 h-[120px] border border-[#e5e7eb] bg-white" />
                <p className="mt-2 text-right text-[12px] text-[#9ca3af]">300 characters left</p>
              </div>
            </FormSection>
          </div>

          <div className="mx-auto mt-5 flex w-full max-w-[700px] items-center justify-between gap-3">
            <p className="max-w-[520px] text-[12px] text-[#6b7280]">
              For more information on how we process your personal data, read our{" "}
              <a href="#" className="text-[#0a7d84] underline">
                Privacy Policy.
              </a>
            </p>
            <button className="rounded-md bg-[#0a7d84] px-5 py-2 text-[13px] font-semibold text-white">Submit</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#e5e7eb]">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a7d84] text-[12px] font-semibold text-white">
            {number}
          </span>
          <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
        </div>
        <span className="text-[15px] text-[#6b7280]">⌃</span>
      </div>
      {children}
    </section>
  );
}
