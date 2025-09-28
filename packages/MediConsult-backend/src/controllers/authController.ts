// packages/backend/src/controllers/authController.ts
import express, { Request, Response } from "express";

import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { supabase } from "../lib/supabaseClient"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET ??
  "dev-secret") as jwt.Secret;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m";

function signAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Attach specializations by ID (IDs-only flow)
 */
async function attachDoctorSpecializationsById(
  userId: string,
  specializationIds?: number[] | null
) {
  if (!Array.isArray(specializationIds) || specializationIds.length === 0)
    return;
  const mapping = specializationIds.map((specId) => ({
    doctor_id: userId,
    specialization_id: specId,
  }));

  // insert mappings; ignore duplicates if composite PK or unique index exists
  // Using onConflict; fallback to plain insert if your supabase-js version doesn't support chaining
  const res = await (supabase as any)
    .from("doctor_specializations")
    .insert(mapping)
    .onConflict("doctor_id,specialization_id");

  if (res?.error) {
    // Try a non-onConflict fallback (some client versions):
    // const fallback = await supabase.from('doctor_specializations').insert(mapping);
    // if (fallback.error) throw fallback.error;
    console.error("attachDoctorSpecializationsById error", res.error);
    throw new Error(res.error.message || "Failed to assign specializations");
  }
}

/**
 * POST /auth/register
 * Accepts:
 *  - name, email, password, role
 *  - phone, graduationDate, yearQualified, licenseNumber, medicalRegistrationNumber
 *  - preferred (IDs-only) specializations: specializationIds: number[]
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role = "PATIENT",
      phone,
      graduationDate,
      yearQualified,
      licenseNumber,
      medicalRegistrationNumber,
      specializationIds,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password required" });
    }

    const emailLower = (email as string).toLowerCase().trim();

    // check if email exists
    const existQ = await supabase
      .from("users")
      .select("id")
      .eq("email", emailLower)
      .limit(1)
      .maybeSingle();
    if (existQ.error) {
      console.error("user exists check error", existQ.error);
      return res.status(500).json({ error: "internal" });
    }
    if (existQ.data) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const createPayload: any = {
      email: emailLower,
      password: hashed,
      name,
      role:
        role === "DOCTOR" ? "DOCTOR" : role === "ADMIN" ? "ADMIN" : "PATIENT",
      approved: role === "DOCTOR" ? false : true,
      phone: phone ?? null,
      graduation_date: graduationDate ?? null,
      year_qualified: yearQualified ?? null,
      licence_number: licenseNumber ?? null,
      medical_registration_number: medicalRegistrationNumber ?? null,
    };

    // create user
    const insertQ = await supabase
      .from("users")
      .insert(createPayload)
      .select("id,email,name,role,approved")
      .single();

    if (insertQ.error) {
      console.error("user insert error", insertQ.error);
      return res.status(500).json({ error: insertQ.error.message });
    }
    const user = insertQ.data;

    // If the user is a doctor and specializationIds is provided -> attach specializations (IDs-only)
    if (user.role === "DOCTOR") {
      try {
        await attachDoctorSpecializationsById(user.id, specializationIds);
      } catch (err) {
        console.error(
          "Failed to attach specializations, rolling back user creation",
          err
        );
        // rollback: delete created user to keep DB consistent
        await supabase.from("users").delete().eq("id", user.id);
        return res
          .status(500)
          .json({ error: "Failed to save doctor specializations" });
      }

      // Do not issue token until admin approval
      return res.status(201).json({ user });
    }

    // For patients: issue token immediately
    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      approved: user.approved,
    });
    return res.status(201).json({ accessToken: token, user });
  } catch (err: any) {
    console.error("register error", err);
    return res.status(500).json({ error: "internal" });
  }
});

// 🔑 POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("login: supabase error", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // check doctor approval
    if (user.role === "DOCTOR" && !user.approved) {
      return res
        .status(403)
        .json({ error: "Doctor account pending admin approval" });
    }

    // issue token
    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
