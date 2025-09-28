// app/admin/pending-doctors/page.tsx
"use client";
import { useEffect, useState } from "react";
import api from "../../../lib/api";
// import { useRouter } from "next/navigation";

type Doctor = { id: string; email: string; name?: string; createdAt: string };

export default function PendingDoctorsPage() {
  const [list, setList] = useState<Doctor[]>([]);
  //   const router = useRouter();

  async function load() {
    try {
      const res = await api.get("/admin/pending-doctors");
      setList(res.data);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "error" in err.response.data
      ) {
        alert(
          (err as { response: { data: { error?: string } } }).response.data
            .error ?? "Failed to load"
        );
      } else {
        alert("Failed to load");
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    await api.patch(`/admin/users/${id}/approve`);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete user?")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold mb-4">Pending doctors</h2>
      <div className="bg-white shadow rounded">
        {list.length === 0 ? (
          <div className="p-6 text-slate-600">No pending doctors</div>
        ) : (
          <ul>
            {list.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between p-4 border-b"
              >
                <div>
                  <div className="font-medium">{u.email}</div>
                  <div className="text-sm text-slate-500">{u.name ?? "—"}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(u.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => del(u.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 border rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
