import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaIdBadge,
  FaMoon,
  FaSignInAlt,
  FaSun,
  FaThLarge,
  FaTimes,
  FaTrophy,
  FaUserTie,
  FaUsers,
  FaVoteYea
} from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";

const adminLinks = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FaThLarge },
  { label: "Elections", path: "/admin/elections", icon: FaCalendarAlt },
  { label: "Candidates", path: "/admin/candidates", icon: FaUserTie },
  { label: "Voters", path: "/admin/voters", icon: FaUsers },
  { label: "Votes", path: "/admin/votes", icon: FaVoteYea },
  { label: "Live Results", path: "/admin/live-results", icon: FaChartLine },
  { label: "Final Results", path: "/admin/final-results", icon: FaTrophy },
  { label: "Profile", path: "/admin/profile", icon: FaIdBadge }
];

const voterLinks = [
  { label: "Dashboard", path: "/voter/dashboard", icon: FaThLarge },
  { label: "My Elections", path: "/voter/elections", icon: FaCalendarAlt },
  { label: "Results", path: "/voter/results", icon: FaChartBar }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : voterLinks;
  const isAdmin = user?.role === "admin";
  const home = isAdmin ? "/admin/dashboard" : "/voter/dashboard";
  const loginRoute = isAdmin ? "/admin/login" : "/login";
  const displayName = user?.name || (isAdmin ? "Admin" : "Voter");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0b1220] dark:text-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-black/10 bg-white transition-transform duration-200 dark:border-slate-700 dark:bg-[#111b2d] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-screen flex-col">
          <div className="border-b border-black/10 p-5 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <Link to={home} className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-secondary text-white">
                  <FaVoteYea className="text-lg" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-none text-brand-primary dark:text-brand-secondary">ElectionMS</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-slate-400">
                    {isAdmin ? "Admin System" : "Voter System"}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                aria-label="Close sidebar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-black dark:border-slate-600 dark:text-slate-100 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {links.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-secondary text-white"
                      : "text-black/70 hover:bg-black/5 hover:text-black dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="text-base" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-black/10 p-4 dark:border-slate-700">
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={async () => {
                await logout();
                navigate(loginRoute);
              }}
            >
              <FaSignInAlt />
              Login
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-[#111b2d]/95">
          <div className="page-wrap flex items-center justify-between !py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-brand-primary dark:border-slate-600 dark:text-brand-secondary lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  {isAdmin ? "Administration" : "Voting"}
                </p>
                <p className="text-base font-bold text-brand-primary dark:text-brand-secondary">Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle theme"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-brand-primary dark:border-slate-600 dark:bg-[#0f1a2d] dark:text-yellow-300"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>

              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-slate-600 dark:bg-[#0f1a2d]">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                    {initials || "U"}
                  </span>
                )}
                <div className="leading-tight">
                  <p className="text-sm font-bold text-brand-primary dark:text-brand-secondary">{displayName}</p>
                  <p className="text-xs text-black/60 dark:text-slate-300">{user?.email || "system@local"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section>{children}</section>
      </div>
    </div>
  );
}

