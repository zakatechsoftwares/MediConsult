// src/components/Layout.tsx
import Link from "next/link";
import React from "react";
import { User } from "../lib/auth";

export default function Layout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  return (
    <div>
      <header
        style={{
          padding: 12,
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Link href="/">
            <strong>Mediconsult</strong>
          </Link>
        </div>
        <nav>
          <Link href="/patients" style={{ marginRight: 12 }}>
            Patients
          </Link>
          {user?.role === "DOCTOR" && (
            <Link href="/consultations" style={{ marginRight: 12 }}>
              Consultations
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin/pending-doctors" style={{ marginRight: 12 }}>
              Admin
            </Link>
          )}
          {!user ? (
            <Link href="/login">Login</Link>
          ) : (
            <span style={{ marginLeft: 12 }}>Hi {user.name ?? user.email}</span>
          )}
        </nav>
      </header>

      <main style={{ padding: 20 }}>{children}</main>
    </div>
  );
}
