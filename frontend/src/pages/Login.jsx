// src/pages/Login.jsx
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { BASE_URL } from "../api/base";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const baseUrl = BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Prefer server-provided message when available
        throw new Error(data.detail || data.error || "Login failed. Please check your details.");
      }

      // Save tokens using the keys other components expect
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Keep backward-compatible keys if other parts of app use them
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      setIsAuthenticated(true);
      setStatus("success");
      setMessage("Login successful.");
      navigate("/profile");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl justify-center px-5 py-14 lg:px-8">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Sign in
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Welcome back</h1>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#061947] focus:ring-2 focus:ring-[#061947]/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#061947] focus:ring-2 focus:ring-[#061947]/20"
              />
            </div>

            {message && (
              <p className={`text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
            >
              {status === "loading" ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need an account?{" "}
            <Link to="/register" className="font-semibold text-[#061947] hover:underline">
              Register
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;

