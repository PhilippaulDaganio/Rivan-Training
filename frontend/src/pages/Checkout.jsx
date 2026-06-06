import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/base";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const getToken = () =>
  localStorage.getItem("access_token") || localStorage.getItem("accessToken");

const Checkout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const [cartItems, setCartItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      const token = getToken();

      if (!token) {
        logout();
        navigate("/login");
        return;
      }

      try {
        setStatus("loading");
        setError("");

        const response = await fetch(`${baseUrl}/cart/`, {
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

          throw new Error(data.detail || data.error || "Failed to load checkout.");
        }

        setCartItems(Array.isArray(data) ? data : []);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Failed to load checkout.");
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

  const handleCheckout = async () => {
    const token = getToken();

    if (!token) {
      logout();
      navigate("/login");
      return;
    }

    try {
      setCheckoutStatus("loading");
      setError("");

      const response = await fetch(`${baseUrl}/checkout/`, {
        method: "POST",
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

        throw new Error(data.error || data.detail || "Checkout failed.");
      }

      if (!data.invoice_url) {
        throw new Error("Checkout did not return a payment link.");
      }

      window.location.href = data.invoice_url;
    } catch (err) {
      setCheckoutStatus("error");
      setError(err.message || "Checkout failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
              Checkout
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">
              Review your order
            </h1>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Back to cart
          </Link>
        </div>

        {status === "loading" ? (
          <p className="mt-8 text-sm text-slate-600">Loading checkout...</p>
        ) : null}

        {error ? (
          <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {status === "success" && cartItems.length === 0 ? (
          <div className="mt-10 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Your cart is empty</h2>
            <p className="mt-3 text-sm text-slate-600">
              Add a product before starting checkout.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
            >
              View products
            </Link>
          </div>
        ) : null}

        {status === "success" && cartItems.length > 0 ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <ul className="divide-y divide-slate-200">
                {cartItems.map((item) => {
                  const price = Number(item.product?.product_price || 0);
                  const subtotal = price * item.qty;

                  return (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#061947]">
                          {item.product?.brand || "Product"}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                          {item.product?.product_name}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-slate-950">
                        ${subtotal.toFixed(2)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Payment</h2>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="text-xl font-bold text-[#061947]">
                  PHP {total.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutStatus === "loading"}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {checkoutStatus === "loading" ? "Creating payment..." : "Pay with Xendit"}
              </button>
            </aside>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
