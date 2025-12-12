import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register({ onRegister, error }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onRegister(form.email, form.password, form.name);
      navigate("/");
    } catch (_err) {
      // handled via `error` prop
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="max-w-md w-full space-y-6 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow">
        <div>
          <h1 className="text-2xl font-bold text-blue-300">Registracija</h1>
          <p className="text-sm text-slate-400">Sukurkite paskyrą, kad galėtumėte skelbti ir vertinti renginius.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            placeholder="vardas (nebūtina)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
          />
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
            className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Kuriama..." : "Registruotis"}
          </button>
        </form>
        <p className="text-sm text-slate-400">
          Jau turite paskyrą?{" "}
          <Link to="/login" className="text-blue-300 hover:text-blue-200">
            Prisijunkite
          </Link>
        </p>
      </div>
    </div>
  );
}
