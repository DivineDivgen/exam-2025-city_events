import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const normalizeApiBase = (value) => {
  const trimmed = (value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const fmtDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString();
};

function App() {
  const { pathname } = useLocation();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });

  const headers = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    [token]
  );

  const filtersRef = useRef({ search: "", categoryId: "", dateFrom: "", dateTo: "" });

  useEffect(() => {
    filtersRef.current = { search, categoryId, dateFrom, dateTo };
  }, [search, categoryId, dateFrom, dateTo]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (!res.ok) throw new Error("Nepavyko gauti kategorijų");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setCategories([]); // keep it always iterable
    }
  }, []);

  const loadEvents = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError("");
    try {
      const { search: s, categoryId: cId, dateFrom: dFrom, dateTo: dTo } = {
        ...filtersRef.current,
        ...overrides,
      };
      const params = new URLSearchParams();
      if ((s || "").trim()) params.set("search", (s || "").trim());
      if (cId) params.set("categoryId", cId);
      if (dFrom) params.set("dateFrom", dFrom);
      if (dTo) params.set("dateTo", dTo);

      const res = await fetch(`${API_BASE}/api/events?${params.toString()}`);
      if (!res.ok) throw new Error("Nepavyko gauti renginių");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    void loadCategories();
    void loadEvents();
  }, [pathname, loadCategories, loadEvents]);

  const login = async (email, password) => {
    setError("");
    if (!email || !password) {
      setError("Įveskite el. paštą ir slaptažodį");
      throw new Error("validation");
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Autentifikacija nepavyko");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setMessage("Prisijungta");
      return;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, name) => {
    setError("");
    if (!email || !password) {
      setError("Iveskite el. pasta ir slaptazodi");
      throw new Error("validation");
    }
    if (false && (!email || !password)) {
      setError("Įveskite el. paštą ir slaptažodį");
      throw new Error("validation");
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Registracija nepavyko");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setMessage("Registracija sekminga");
      return;
      setMessage("Registracija sėkminga");
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  };

  const handleAuth = async (mode) => {
    if (mode === "register") {
      return register(authForm.email, authForm.password, authForm.name);
    }
    return login(authForm.email, authForm.password);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const rateEvent = async (eventId, stars) => {
    if (!token) {
      setError("Prisijunkite, kad galėtumėte vertinti renginius.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/rate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ stars }),
      });
      if (!res.ok) throw new Error("Nepavyko įvertinti renginio");
      setMessage("Įvertinimas įrašytas");
      await loadEvents();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (pathname === "/login") {
    return user ? (
      <Navigate to="/" replace />
    ) : (
      <Login onLogin={login} error={error} />
    );
  }

  if (pathname === "/register") {
    return user ? (
      <Navigate to="/" replace />
    ) : (
      <Register onRegister={register} error={error} />
    );
  }

  if (pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar user={user} onLogout={logout} />
      <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-300">Miesto renginiai</h1>
            <p className="text-sm text-slate-400">
              Vieša sritis: paieška, filtrai, vertinimai (SPA, be perkrovimo)
            </p>
          </div>
          <div className={user ? "flex items-center gap-3" : "hidden"}>
            {user ? (
              <>
                <div className="text-right">
                  <div className="text-sm text-blue-200">{user.email}</div>
                  <div className="text-xs text-slate-400">{user.role || "USER"}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm"
                >
                  Atsijungti
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="email"
                  placeholder="el. paštas"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                  className="px-3 py-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="slaptažodis"
                  value={authForm.password}
                  onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                  className="px-3 py-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="vardas (registracijai)"
                  value={authForm.name}
                  onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))}
                  className="px-3 py-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500 hidden md:block"
                />
                <button
                  onClick={() => handleAuth("login")}
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Prisijungti
                </button>
                <button
                  onClick={() => handleAuth("register")}
                  className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Registruotis
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Paieška (pavadinimas, aprašymas, vieta)"
            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500 col-span-2"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Visos kategorijos</option>
            {(Array.isArray(categories) ? categories : []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 col-span-2 md:col-span-2 lg:col-span-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 col-span-2 md:col-span-2 lg:col-span-1">
            <button
              onClick={loadEvents}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white w-full"
            >
              Filtruoti
            </button>
            <button
              onClick={() => {
                setSearch("");
                setCategoryId("");
                setDateFrom("");
                setDateTo("");
                loadEvents();
              }}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
            >
              Išvalyti
            </button>
          </div>
        </section>

        {error && <div className="p-3 rounded bg-rose-900/40 border border-rose-700 text-rose-100">{error}</div>}
        {message && <div className="p-3 rounded bg-emerald-900/40 border border-emerald-700 text-emerald-100">{message}</div>}

        <section className="grid gap-4 md:grid-cols-2">
          {loading && <div className="text-slate-300">Kraunama...</div>}
          {!loading && events.length === 0 && (
            <div className="text-slate-400">Nėra renginių pagal pasirinktus filtrus.</div>
          )}
          {!loading &&
            events.map((event) => (
              <article
                key={event.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-200">{event.title}</h3>
                    {event.category && (
                      <span className="text-xs px-2 py-1 bg-slate-700 text-slate-100 rounded-full">
                        {event.category.name}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <div>Pradžia: {fmtDate(event.startAt)}</div>
                    {event.endAt && <div>Pabaiga: {fmtDate(event.endAt)}</div>}
                  </div>
                </div>
                {event.location && (
                  <div className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-slate-500">Vieta:</span> {event.location}
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-slate-200">{event.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <span className="font-semibold">
                    {event.averageRating ? event.averageRating.toFixed(1) : "Neįvertinta"}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <svg
                        key={n}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={event.averageRating && event.averageRating >= n ? "currentColor" : "none"}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.888 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557L2.947 10.38a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.219-5.106z"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="text-slate-400">({event.ratingsCount || 0})</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700">
                    Publikuota: {event.published ? "Taip" : "Ne"}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700">
                    Blokuota: {event.blocked ? "Taip" : "Ne"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Įvertinkite:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => rateEvent(event.id, n)}
                      className="text-amber-300 hover:text-amber-200"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </article>
            ))}
        </section>
      </main>
      </div>
    </>
  );
}

export default App;
