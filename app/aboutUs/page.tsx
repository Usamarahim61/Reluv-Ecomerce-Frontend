import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const storyBlocks = [
  {
    title: "From a local start-up",
    text: "Reluv began with one clear idea: great fashion should stay in use, not in storage. What started as a small resale community quickly became a daily habit for people who wanted to buy smarter and sell faster.",
  },
  {
    title: "To a thriving community",
    text: "Today, thousands of members use Reluv to refresh wardrobes, discover unique pieces, and give pre-loved items a second life. Our team continues to build tools that keep circular shopping simple.",
  },
  {
    title: "More than just clothing",
    text: "Reluv supports categories beyond apparel, from accessories to lifestyle finds. By keeping items in circulation longer, we reduce waste and help users get more value from what they already own.",
  },
  {
    title: "Better than new",
    text: "Second-hand is no longer second choice. With trusted listings, clear product details, and a growing member base, Reluv makes it easy to shop with confidence and sell with speed.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#ececec] text-[#111827]">
      <Navbar />

      <section className="bg-[#ececec] px-6 py-20 md:py-28">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            On a mission to make second-hand first choice
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
            We want to show how great second-hand can be. Sell what you no longer
            need, or shop unique pieces you will not find in stores. Reluv is for
            everyone who believes quality items should live longer.
          </p>
        </div>
      </section>

      <section className="w-full">
        <img
          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2200&q=80"
          alt="People gathering in a modern courtyard"
          className="h-[300px] w-full object-cover md:h-[520px]"
        />
      </section>

      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            1 simple idea now unites a community of millions
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {storyBlocks.map((item) => (
              <article key={item.title}>
                <h3 className="text-2xl font-medium text-gray-900">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-gray-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-3xl font-semibold md:text-5xl">Investors & Leadership</h2>
          <p className="mt-8 text-base leading-8 text-gray-600 md:text-lg">
            Reluv is backed by long-term partners and led by a product-focused
            team building the future of circular commerce. We share major company
            updates through our newsroom and community channels.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
