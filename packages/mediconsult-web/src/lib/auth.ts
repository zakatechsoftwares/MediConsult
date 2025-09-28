// src/lib/auth.ts
import api from "./api";
import Cookies from "js-cookie";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  approved?: boolean;
};

// Login - existing
export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  const { accessToken, user } = res.data;
  Cookies.set("mediconsult_token", accessToken, {
    expires: 7,
    sameSite: "Lax",
  });
  return user as User;
}

// Register - NEW
export async function register(payload: {
  email: string;
  password: string;
  name?: string;
  role?: "DOCTOR" | "PATIENT";
  licenseNumber?: string | null;
}) {
  // adapt payload shape to your backend contract (licenseNumber optional)
  const res = await api.post("/auth/register", payload);
  // some backends return { user } only without token (if doctors require approval).
  // We'll handle both cases:
  const { accessToken, user } = res.data || {};
  if (accessToken) {
    Cookies.set("mediconsult_token", accessToken, {
      expires: 7,
      sameSite: "Lax",
    });
  }
  return user as User;
}

export function logout() {
  Cookies.remove("mediconsult_token");
}

export async function getSession(): Promise<User | null> {
  try {
    const res = await api.get("/auth/me");
    return res.data.user as User;
  } catch {
    return null;
  }
}
