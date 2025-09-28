// app/page.tsx
"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-12">
      <div className="rounded-lg bg-white shadow p-8">
        <h1 className="text-3xl font-semibold mb-4">MediConsult</h1>
        <p className="text-slate-600 mb-6">
          Offline-first telemedicine demo. Use the web to manage users, approve
          doctor accounts, and view consultations.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-primary-500 text-white rounded"
          >
            Sign in
          </Link>
          <Link href="/patients" className="px-4 py-2 border rounded">
            View patients
          </Link>
        </div>
      </div>
    </div>
  );
}
