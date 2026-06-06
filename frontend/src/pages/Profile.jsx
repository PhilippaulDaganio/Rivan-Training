import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/base";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}user-profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        setError("Unable to load your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl justify-center px-5 py-14 lg:px-8">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#061947]">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Your account
          </h1>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-600">Loading profile...</p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {user ? (
            <div className="mt-8 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Username</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {user.username}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {user.email}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              View products
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#061947] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b255f]"
            >
              Logout
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
