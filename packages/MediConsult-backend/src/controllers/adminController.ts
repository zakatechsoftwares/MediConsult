// src/controllers/adminController.ts
import express, { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";
import { authMiddleware, AuthUser } from "../middleware/authMiddleware";

const router = express.Router();

function adminOnly(
  req: Request & { user?: AuthUser },
  res: Response,
  next: Function
) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ error: "Forbidden" });
  return next();
}

// GET /admin/pending-doctors
router.get(
  "/pending-doctors",
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const q = await supabase
        .from("users")
        .select(
          "id,email,name,medical_registration_number,licence_number,created_at"
        )
        .eq("role", "DOCTOR")
        .eq("approved", false)
        .order("created_at", { ascending: false });

      if (q.error) return res.status(500).json({ error: q.error.message });
      return res.json(q.data || []);
    } catch (err) {
      console.error("pending-doctors error", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

// PATCH /admin/users/:id/approve
router.patch(
  "/users/:id/approve",
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const q = await supabase
        .from("users")
        .update({ approved: true })
        .eq("id", id)
        .select(
          "id,email,name,role,approved,medical_registration_number,licence_number"
        )
        .single();

      if (q.error) return res.status(500).json({ error: q.error.message });
      return res.json(q.data);
    } catch (err) {
      console.error("approve error", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

// DELETE /admin/users/:id
router.delete(
  "/users/:id",
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const q = await supabase
        .from("users")
        .delete()
        .eq("id", id)
        .select("id")
        .single();
      if (q.error) return res.status(500).json({ error: q.error.message });
      return res.json({ ok: true });
    } catch (err) {
      console.error("delete user error", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

export default router;
