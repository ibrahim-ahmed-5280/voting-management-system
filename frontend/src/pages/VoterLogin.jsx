import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

export default function VoterLogin() {
  const [form, setForm] = useState({ idno: "", email: "" });
  const [loading, setLoading] = useState(false);
  const { voterLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await voterLogin(form);
      toast.success("Welcome back");
      navigate("/voter/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#151f2e]">
      <form onSubmit={submit} className="glass w-full max-w-md space-y-4 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">Voter Login</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Enter your voter ID and email exactly as assigned by the administrator.
        </p>
        <div>
          <label htmlFor="voter-login-id" className="field-label">
            ID Number
          </label>
          <input
            id="voter-login-id"
            className="input"
            placeholder="ID Number"
            required
            value={form.idno}
            onChange={(e) => setForm({ ...form, idno: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="voter-login-email" className="field-label">
            Email
          </label>
          <input
            id="voter-login-email"
            className="input"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <button disabled={loading} className="btn-primary w-full" type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

