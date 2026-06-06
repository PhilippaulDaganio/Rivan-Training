import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../api/base";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const getToken = () =>
  localStorage.getItem("access_token") || localStorage.getItem("accessToken");

const CheckoutResult = ({ result }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useContext(AuthContext);
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const externalId = searchParams.get("external_id");
  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      const token = getToken();

      if (!token) {
        logout();
        navigate("/login");
        return;
      }

      if (!externalId) {
        setError("Checkout reference is missing.");
        setStatus("error");
        return;
      }

      try {
        setStatus("loading");
        setError("");

        const response = await fetch(
          `${baseUrl}/checkout/status/${externalId}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login");
            return;
          }

          throw new Error(data.error || data.detail || "Unable to load payment status.");
        }

        setPayment(data);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Unable to load payment status.");
        setStatus("error");
      }
    };

    fetchStatus();
  }, [baseUrl, externalId, logout, navigate]);

  const isPaid = payment?.isPaid;
  const headline = isPaid
    ? "Payment received"
    : result === "failed"
      ? "Payment not completed"
      : "Payment is processing";
  const statusLabel = payment?.xendit_status || "PENDING";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl justify-center px-5 py-14 lg:px-8">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Checkout
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{headline}</h1>

          {status === "loading" ? (
            <p className="mt-6 text-sm text-slate-600">Loading payment status...</p>
          ) : null}

          {status === "error" ? (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {status === "success" && payment ? (
            <div className="mt-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <span className="text-sm font-bold text-[#061947]">
                  {isPaid ? "PAID" : statusLabel}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="text-lg font-bold text-slate-950">
                  PHP {Number(payment.totalPrice || 0).toFixed(2)}
                </span>
              </div>

              {!isPaid && payment.xendit_invoice_url ? (
                <a
                  href={payment.xendit_invoice_url}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
                >
                  Continue payment
                </a>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  View products
                </Link>
                <Link
                  to="/cart"
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
                >
                  View cart
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutResult;
