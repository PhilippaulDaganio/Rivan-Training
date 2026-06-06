import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/base";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const [cartItems, setCartItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("accessToken");

      if (!token) {
        logout();
        navigate("/login");
        return;
      }

      try {
        setStatus("loading");
        setError("");

        const response = await fetch(`${baseUrl}/cart/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login");
            return;
          }

          throw new Error(data.detail || data.error || "Failed to load your cart.");
        }

        setCartItems(Array.isArray(data) ? data : []);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Failed to load your cart.");
        setStatus("error");
      }
    };

    fetchCart();
  }, [baseUrl, logout, navigate]);

  const total = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.product?.product_price || 0);
        return sum + price * item.qty;
      }, 0),
    [cartItems],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
              Cart
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">
              Your shopping cart
            </h1>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Continue shopping
          </Link>
        </div>

        {location.state?.addedProduct ? (
          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {location.state.addedProduct} was added to your cart.
          </p>
        ) : null}

        {status === "loading" ? (
          <p className="mt-8 text-sm text-slate-600">Loading cart...</p>
        ) : null}

        {status === "error" ? (
          <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {status === "success" && cartItems.length === 0 ? (
          <div className="mt-10 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Your cart is empty</h2>
            <p className="mt-3 text-sm text-slate-600">
              Add a product to your cart and it will show up here.
            </p>
          </div>
        ) : null}

        {status === "success" && cartItems.length > 0 ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <ul className="divide-y divide-slate-200">
                {cartItems.map((item) => {
                  const product = item.product;
                  const imageUrl = product?.image?.startsWith("http")
                    ? product.image
                    : `${baseUrl}${product?.image || ""}`;
                  const price = Number(product?.product_price || 0);
                  const subtotal = price * item.qty;

                  return (
                    <li
                      key={item.id}
                      className="grid gap-5 p-5 sm:grid-cols-[96px_1fr_auto]"
                    >
                      <img
                        src={imageUrl}
                        alt={product?.product_name || "Cart item"}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#061947]">
                          {product?.brand || "Product"}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                          {product?.product_name}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          Quantity: {item.qty}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500">Subtotal</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                          ${subtotal.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Order summary</h2>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="text-xl font-bold text-[#061947]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
