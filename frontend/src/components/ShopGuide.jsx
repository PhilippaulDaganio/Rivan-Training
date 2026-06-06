const steps = [
  {
    title: "Browse products",
    text: "Explore available items and compare styles, prices, and details.",
  },
  {
    title: "Open details",
    text: "View each product page for the full description and product image.",
  },
  {
    title: "Create an account",
    text: "Register or sign in when the backend authentication is connected.",
  },
];

const ShopGuide = () => {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Shop guide
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            A simple path from browsing to checkout.
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg border border-slate-200 bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#061947] text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopGuide;
