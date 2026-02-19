import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(form);
      toast.success("Login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#151f2e]">
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="glass w-full max-w-md space-y-4 rounded-2xl p-6"
      >
        <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">Admin Login</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Sign in to manage elections, candidates, voters, and reports.
        </p>
        <div>
          <label htmlFor="admin-login-email" className="field-label">
            Email
          </label>
          <input
            id="admin-login-email"
            className="input"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="admin-login-password" className="field-label">
            Password
          </label>
          <div className="relative">
          <input
            id="admin-login-password"
            className="input pr-10"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-secondary"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" />
          Remember me
        </label>
        <button disabled={loading} className="btn-primary w-full" type="submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/admin/register" className="text-brand-primary hover:underline dark:text-brand-secondary">
            Create admin account
          </Link>
          <Link to="/login" className="hover:underline">
            Voter login
          </Link>
        </div>
      </motion.form>
    </div>
  );
}

