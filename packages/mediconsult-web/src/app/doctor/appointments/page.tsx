"use client";

import React from "react";
import {
  useGetDoctorAppointmentsQuery,
  usePatchAppointmentMutation,
} from "../../../store/api"; // adjust path if needed
import { Appointment } from "@/types/store_api_types";

export default function DoctorAppointmentsPage() {
  // RTK Query hook (client)
  const {
    data: appointments,
    isLoading,
    isError,
  } = useGetDoctorAppointmentsQuery();
  const [patchAppointment, { isLoading: patching }] =
    usePatchAppointmentMutation();

  async function updateStatus(
    id: string,
    action: "ACCEPT" | "CANCEL" | "COMPLETE"
  ) {
    try {
      // patchAppointment returns a Promise via .unwrap()
      await patchAppointment({ id, action }).unwrap();
      // RTK Query invalidates tags and refetches automatically per your api.ts config
    } catch (err) {
      console.error("Failed to update appointment", err);
      // alert((err as any)?.data?.error ?? "Action failed");
    }
  }

  if (isLoading) return <div className="p-6">Loading appointments…</div>;
  if (isError)
    return <div className="p-6 text-red-600">Failed to load appointments.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>
      {(!appointments || appointments.length === 0) && (
        <div className="p-4 bg-white rounded shadow">No appointments</div>
      )}
      <div className="space-y-3">
        {appointments?.map((a: Appointment) => (
          <div
            key={a.id}
            className="bg-white rounded shadow p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">Patient: {a.patient_id}</div>
              <div className="text-sm text-slate-500">
                When: {new Date(a.scheduled_at).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Status: {a.status}</div>
            </div>
            <div className="flex gap-2">
              {a.status === "PENDING" && (
                <button
                  onClick={() => updateStatus(a.id, "ACCEPT")}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Accept
                </button>
              )}
              {a.status !== "CANCELLED" && (
                <button
                  onClick={() => updateStatus(a.id, "CANCEL")}
                  className="px-3 py-1 bg-red-50 text-red-600 rounded border"
                >
                  Cancel
                </button>
              )}
              {a.status !== "COMPLETED" && (
                <button
                  onClick={() => updateStatus(a.id, "COMPLETE")}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
