import express from "express";
import { supabase } from "../lib/supabaseClient";
const router = express.Router();

// GET /specializations
router.get("/", async (req, res) => {
  const q = await supabase
    .from("specializations")
    .select("id,name")
    .order("name");
  if (q.error) return res.status(500).json({ error: q.error.message });
  res.json(q.data || []);
});

export default router;
