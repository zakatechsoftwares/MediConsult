// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { supabase } from "../lib/supabaseClient"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET ??
  "dev-secret") as jwt.Secret;

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  approved?: boolean;
  [k: string]: any;
};

export function verifyAccessToken(
  token: string
): jwt.JwtPayload | string | null {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload | string;
  } catch {
    return null;
  }
}

export async function authMiddleware(
  req: Request & { user?: AuthUser },
  res: Response,
  next: NextFunction
) {
  try {
    const header = (req.headers.authorization || "") as string;
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : header || null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = verifyAccessToken(token);
    if (!decoded || typeof decoded === "string")
      return res.status(401).json({ error: "Invalid token" });

    // fetch user from supabase
    const userQ = await supabase
      .from("users")
      .select(
        "id,email,name,role,approved,medical_registration_number,licence_number,phone"
      )
      .eq("id", decoded.sub as string)
      .limit(1)
      .maybeSingle();

    if (userQ.error) {
      console.error("authMiddleware: supabase error", userQ.error);
      return res.status(500).json({ error: "internal" });
    }
    if (!userQ.data) return res.status(401).json({ error: "User not found" });

    req.user = userQ.data as AuthUser;
    return next();
  } catch (err) {
    console.error("authMiddleware error", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
