import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductList from "../components/ProductList";
import ShopGuide from "../components/ShopGuide";
import heroImage from "../assets/hero.png";
import { products } from "../data/products";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
              Rivansh store
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Clean essentials for simple everyday shopping.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Browse a small set of featured products, open product details, and
              use the account pages prepared for the Django REST backend.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
              >
                Browse products
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#061947] hover:text-[#061947]"
              >
                Create account
              </Link>
            </div>
          </div>
          <img
            src={heroImage}
            alt="Featured Rivansh product display"
            className="h-full max-h-[430px] w-full rounded-lg object-cover shadow-lg"
          />
        </section>

        <ShopGuide />

        <section className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
                Featured products
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Popular picks
              </h2>
            </div>
            <Link
              to="/products"
              className="text-sm font-semibold text-[#061947] hover:underline"
            >
              View all products
            </Link>
          </div>
          <ProductList products={products} limit={3} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
