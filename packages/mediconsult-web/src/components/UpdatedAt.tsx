// src/components/UpdatedAt.tsx
"use client";
import { useMemo } from "react";

export default function UpdatedAt({ iso }: { iso?: string | null }) {
  const label = useMemo(() => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  }, [iso]);

  return <div className="text-sm text-slate-500">Updated: {label}</div>;
}
