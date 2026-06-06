import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductList from "../components/ProductList";
import { products } from "../data/products";

const Products = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Products
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Browse the collection
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Product cards currently use local mock data while the Django REST
            Framework backend is not part of this workspace.
          </p>
        </div>
        <ProductList products={products} />
      </main>
      <Footer />
    </div>
  );
};

export default Products;
