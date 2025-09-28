// packages/mediconsult-web/src/store/api.ts
// DO NOT import your store or RootState here (that causes circular imports).
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Specialization,
  Appointment,
  User,
} from "./types"; // adjust path only if needed

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // use the getState argument (do NOT import your store here)
    prepareHeaders: (headers, { getState }) => {
      try {
        const state = getState() as any;
        const token = state?.auth?.token ?? null;
        if (token) headers.set("authorization", `Bearer ${token}`);
        headers.set("Content-Type", "application/json");
      } catch {
        // ignore
      }
      return headers;
    },
  }),
  tagTypes: ["Appointments", "Specializations", "Auth"],
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: build.mutation<{ user: User }, RegisterRequest>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    getSpecializations: build.query<Specialization[], void>({
      query: () => "/specializations",
      providesTags: ["Specializations"],
    }),
    getDoctorAppointments: build.query<Appointment[], void>({
      query: () => "/appointments/doctor",
      providesTags: ["Appointments"],
    }),
    patchAppointment: build.mutation<
      Appointment,
      { id: string; action: "ACCEPT" | "CANCEL" | "COMPLETE" }
    >({
      query: ({ id, action }) => ({
        url: `/appointments/${id}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["Appointments"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetSpecializationsQuery,
  useGetDoctorAppointmentsQuery,
  usePatchAppointmentMutation,
} = api;
