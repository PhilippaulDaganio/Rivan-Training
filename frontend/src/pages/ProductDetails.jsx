import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { BASE_URL } from "../api/base";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [cartStatus, setCartStatus] = useState("idle");
  const [cartMessage, setCartMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setStatus("loading");
        setError("");

        const response = await fetch(`${baseUrl}/products/${id}/`);
        if (!response.ok) {
          throw new Error("Product could not be loaded.");
        }

        const data = await response.json();
        setProduct(data);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Product could not be loaded.");
        setStatus("error");
      }
    };

    loadProduct();
  }, [baseUrl, id]);

  const handleAddToCart = async () => {
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("accessToken");

    if (!token) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setCartStatus("error");
      setCartMessage("Please log in before adding products to your cart.");
      navigate("/login");
      return;
    }

    try {
      setCartStatus("loading");
      setCartMessage("");

      const response = await fetch(`${baseUrl}/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          qty: 1,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
          throw new Error("Your login expired. Please log in again.");
        }

        throw new Error(
          data.detail || data.error || "Failed to add this product to your cart."
        );
      }

      setCartStatus("success");
      setCartMessage("Product added to cart.");
      navigate("/cart", {
        state: { addedProduct: product.product_name },
      });
    } catch (err) {
      setCartStatus("error");
      setCartMessage(err.message || "Failed to add this product to your cart.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white text-slate-950">
        <Header />
        <main className="mx-auto w-full max-w-3xl px-5 py-20 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Loading product
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Getting product details...
          </h1>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "error" || !product) {
    return (
      <div className="min-h-screen bg-white text-slate-950">
        <Header />
        <main className="mx-auto w-full max-w-3xl px-5 py-20 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Product not found
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            We could not find that product.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {error || "The product may have moved, or the link may be incorrect."}
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
          >
            Back to products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${baseUrl}${product.image}`;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:px-8">
        <img
          src={imageUrl}
          alt={product.product_name}
          className="h-full max-h-[520px] w-full rounded-lg object-cover shadow-lg"
        />
        <section className="flex flex-col justify-center">
          <Link
            to="/products"
            className="mb-6 text-sm font-semibold text-[#061947] hover:underline"
          >
            Back to products
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            {product.brand || "Product details"}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            {product.product_name}
          </h1>
          <p className="mt-4 text-2xl font-bold text-[#061947]">
            ${product.product_price}
          </p>
          <p className="mt-6 text-base leading-8 text-slate-600">
            {product.description}
          </p>
          <p className="mt-4 text-sm font-medium text-slate-700">
            In stock: {product.countInStock}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartStatus === "loading" || product.countInStock < 1}
            className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f] disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          >
            {cartStatus === "loading" ? "Adding..." : "Add to cart"}
          </button>
          {cartMessage && (
            <p
              className={`mt-4 text-sm font-medium ${
                cartStatus === "success" ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {cartMessage}
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
