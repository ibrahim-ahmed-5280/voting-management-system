import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { validatePassword } from "../utils/validators";
import api from "../api/client";

export default function AdminRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const pwd = useMemo(() => validatePassword(form.password), [form.password]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!pwd.valid) {
      toast.error("Password is too weak");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/admin/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });
      toast.success("Admin registered successfully");
      navigate("/admin/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#151f2e]">
      <form onSubmit={submit} className="glass w-full max-w-md space-y-4 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">Admin Registration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Create an administrator account with a strong password for secure access.
        </p>
        <div>
          <label htmlFor="admin-register-name" className="field-label">
            Full Name
          </label>
          <input
            id="admin-register-name"
            className="input"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="admin-register-email" className="field-label">
            Email
          </label>
          <input
            id="admin-register-email"
            className="input"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="admin-register-password" className="field-label">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-register-password"
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
        <p className={`text-xs ${pwd.valid ? "text-brand-primary dark:text-brand-secondary" : "text-slate-500 dark:text-slate-300"}`}>{pwd.message}</p>
        <div>
          <label htmlFor="admin-register-confirm-password" className="field-label">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="admin-register-confirm-password"
              className="input pr-10"
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-secondary"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button disabled={loading} className="btn-primary w-full" type="submit">
          {loading ? "Submitting..." : "Create Admin"}
        </button>
        <Link to="/admin/login" className="block text-center text-sm text-brand-primary hover:underline dark:text-brand-secondary">
          Back to login
        </Link>
      </form>
    </div>
  );
}

