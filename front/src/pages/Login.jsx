import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onLogin, error }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onLogin(form.email, form.password);
      navigate("/");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="max-w-md w-full space-y-6 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow">
        <div>
          <h1 className="text-2xl font-bold text-blue-300">Prisijungimas</h1>
          <p className="text-sm text-slate-400">Įveskite el. paštą ir slaptažodį</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="el. paštas"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
          />
          <input
            type="password"
            required
            placeholder="slaptažodis"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
          />
          {error && <div className="text-sm text-rose-300">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Jungiama..." : "Prisijungti"}
          </button>
        </form>
        <p className="text-sm text-slate-400">
          Neturite paskyros?{" "}
          <Link to="/register" className="text-blue-300 hover:text-blue-200">
            Registruokitės
          </Link>
        </p>
      </div>
    </div>
  );
}
