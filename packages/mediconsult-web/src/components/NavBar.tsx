"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, logout, User } from "../lib/auth";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // getSession should call the backend /auth/me endpoint
    getSession()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .catch(() => setUser(null))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function onLogout() {
    logout();
    router.push("/login");
  }

  // Stable header markup for SSR -> ensures initial markup is identical (NavBar is client-only via dynamic import above)
  return (
    <header className="bg-white shadow">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold">
              MC
            </div>
            <div className="text-lg font-semibold">MediConsult</div>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/patients"
            className={`py-2 px-3 rounded ${
              pathname?.startsWith("/patients")
                ? "bg-primary-50 text-primary-600"
                : "text-slate-600"
            }`}
          >
            Patients
          </Link>

          {/* show doctor menu only when user.role === 'DOCTOR' */}
          {user?.role === "DOCTOR" && (
            <Link
              href="/consultations"
              className={`py-2 px-3 rounded ${
                pathname?.startsWith("/consultations")
                  ? "bg-primary-50 text-primary-600"
                  : "text-slate-600"
              }`}
            >
              Consultations
            </Link>
          )}

          {/* show admin menu only for admin */}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/pending-doctors"
              className={`py-2 px-3 rounded ${
                pathname?.startsWith("/admin")
                  ? "bg-primary-50 text-primary-600"
                  : "text-slate-600"
              }`}
            >
              Admin
            </Link>
          )}

          {/* Auth controls — render a stable placeholder while loading */}
          {loading ? (
            <div className="py-2 px-3 rounded text-slate-500">...</div>
          ) : !user ? (
            <Link
              href="/login"
              className="py-2 px-3 bg-primary-500 text-white rounded"
            >
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-700">
                Hi, {user.name ?? user.email}
              </div>
              <button
                onClick={onLogout}
                className="py-2 px-3 rounded border text-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
