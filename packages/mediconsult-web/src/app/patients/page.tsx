// app/patients/page.tsx
"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import UpdatedAt from "../../components/UpdatedAt";

type Patient = {
  id: string;
  name: string;
  dob?: string | null;
  updatedAt?: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  async function load() {
    try {
      const res = await api.get("/sync/pull?since=0");
      const consults = res.data.consultations || [];
      const map: Record<string, Patient> = {};
      //   consults.forEach((c: any) => {
      //     if (c.patient)
      //       map[c.patient.id] = {
      //         id: c.patient.id,
      //         name: c.patient.name,
      //         dob: c.patient.dob,
      //         updatedAt: c.patient.updatedAt,
      //       };
      //   });
      console.log(consults);
      for (const c of consults) {
        if (c.patient)
          map[c.patient.id] = {
            id: c.patient.id,
            name: c.patient.name,
            dob: c.patient.dob,
            updatedAt: c.patient.updatedAt,
          };
      }
      setPatients(Object.values(map));
    } catch (err: unknown) {
      console.error(err);
      setPatients([]);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold mb-4">Patients</h2>
      <div className="grid gap-4">
        {patients.length === 0 && (
          <div className="text-slate-600">No patients available</div>
        )}
        {patients.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded shadow p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-slate-500">DOB: {p.dob ?? "—"}</div>
            </div>
            <div className="text-sm text-slate-500">
              <UpdatedAt iso={p.updatedAt} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
