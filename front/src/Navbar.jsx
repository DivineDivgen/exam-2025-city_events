import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <nav className="relative z-50 block w-full max-w-6xl px-4 py-2 mx-auto bg-slate-900 border-b border-slate-800 text-slate-200">
      <div className="flex flex-wrap items-center justify-between mx-auto">
        <Link
          to="/"
          className="mr-4 block cursor-pointer py-1.5 text-base font-semibold !text-blue-300 visited:!text-blue-300 hover:!text-blue-200"
        >
          Klaipėda
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              id="account-button"
              type="button"
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-controls="account-menu"
              className="flex items-center gap-2 rounded px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm"
            >
              Account
            </button>

            {open && (
              <ul
                id="account-menu"
                role="menu"
                aria-labelledby="account-button"
                className="absolute right-0 top-full mt-2 z-50 min-w-[220px] overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-lg focus:outline-none text-slate-100"
              >
                {user ? (
                  <>
                    <li role="menuitem" className="flex w-full text-sm items-center rounded-md p-3">
                      <div className="min-w-0">
                        <div className="truncate text-blue-200">{user.email}</div>
                        <div className="text-xs text-slate-400">{user.role || "USER"}</div>
                      </div>
                    </li>
                    <li role="menuitem">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onLogout?.();
                        }}
                        className="block w-full text-left rounded-md p-3 transition-all hover:bg-slate-800 text-rose-200 hover:text-rose-100"
                      >
                        Atsijungti
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li role="menuitem">
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-800 !text-blue-300 visited:!text-blue-300 hover:!text-blue-200"
                      >
                        Prisijungimas
                      </Link>
                    </li>
                    <li role="menuitem">
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className="block w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-800 !text-blue-300 visited:!text-blue-300 hover:!text-blue-200"
                      >
                        Registracija
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

