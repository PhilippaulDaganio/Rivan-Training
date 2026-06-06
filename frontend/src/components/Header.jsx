import { Link, NavLink } from "react-router-dom";

const Header = () => {
  const links = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <Link
        to="/"
        className="text-lg font-extrabold tracking-wide text-slate-950"
        aria-label="Rivansh home"
      >
        RIVANSH
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <nav className="flex items-center gap-5">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[#061947] ${
                  isActive ? "text-[#061947]" : "text-slate-600"
                }`
              }
              end={link.path === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#061947] px-5 text-sm font-medium text-[#061947] transition-colors hover:bg-[#061947] hover:text-white"
          >
            Register
          </Link>

          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#061947] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0b255f]"
          >
            Sign In
          </Link>
        </div>
      </div>
      </div>
    </header>
  );
};

export default Header;
