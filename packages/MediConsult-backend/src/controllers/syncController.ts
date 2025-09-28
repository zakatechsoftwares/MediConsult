// src/controllers/syncController.ts
import express, { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * POST /sync/push
 * body: { patients: [], consultations: [], messages: [] }
 * Upserts items by id (client should send id for existing items, otherwise server will create)
 */
router.post(
  "/push",
  authMiddleware,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const { patients = [], consultations = [], messages = [] } = req.body;

      // Upsert patients
      if (patients.length) {
        const up = await supabase
          .from("patients")
          .upsert(patients, { onConflict: "id" })
          .select();
        if (up.error) {
          console.error("patients upsert error", up.error);
          return res.status(500).json({ error: up.error.message });
        }
      }

      // Upsert consultations
      if (consultations.length) {
        const up2 = await supabase
          .from("consultations")
          .upsert(consultations, { onConflict: "id" })
          .select();
        if (up2.error) {
          console.error("consultations upsert error", up2.error);
          return res.status(500).json({ error: up2.error.message });
        }
      }

      // Upsert messages
      if (messages.length) {
        const up3 = await supabase
          .from("messages")
          .upsert(messages, { onConflict: "id" })
          .select();
        if (up3.error) {
          console.error("messages upsert error", up3.error);
          return res.status(500).json({ error: up3.error.message });
        }
      }

      return res.json({ ok: true });
    } catch (err: any) {
      console.error("sync push error", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

/**
 * GET /sync/pull?since=TIMESTAMP_MS
 * Return consultations (and included patients & messages) updated since the client timestamp
 */
router.get(
  "/pull",
  authMiddleware,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const sinceMs = parseInt((req.query.since as string) || "0", 10);
      const sinceDate = new Date(sinceMs ? sinceMs : 0).toISOString();

      // Fetch consultations based on role
      let consultQ;
      if (req.user.role === "ADMIN") {
        consultQ = await supabase
          .from("consultations")
          .select(
            "id,patient_id,clinician_id,status,scheduled_at,notes,created_at,updated_at"
          )
          .gte("updated_at", sinceDate)
          .order("updated_at", { ascending: true });
      } else if (req.user.role === "DOCTOR") {
        consultQ = await supabase
          .from("consultations")
          .select(
            "id,patient_id,clinician_id,status,scheduled_at,notes,created_at,updated_at"
          )
          .eq("clinician_id", req.user.id)
          .gte("updated_at", sinceDate)
          .order("updated_at", { ascending: true });
      } else {
        // PATIENT -> find patient records owned by user, then consultations for those patients
        const pRes = await supabase
          .from("patients")
          .select("id")
          .eq("owner_id", req.user.id);
        const patientIds = (pRes.data || []).map((p: any) => p.id);
        consultQ = await supabase
          .from("consultations")
          .select(
            "id,patient_id,clinician_id,status,scheduled_at,notes,created_at,updated_at"
          )
          .in("patient_id", patientIds)
          .gte("updated_at", sinceDate)
          .order("updated_at", { ascending: true });
      }

      if (consultQ.error) {
        console.error("consultations query error", consultQ.error);
        return res.status(500).json({ error: consultQ.error.message });
      }
      const consultations = consultQ.data || [];

      // Collect patient ids & consultation ids
      const patientIds = Array.from(
        new Set(consultations.map((c: any) => c.patient_id))
      );
      const consultationIds = consultations.map((c: any) => c.id);

      // Fetch patients and messages in batch
      const patientsQ = patientIds.length
        ? await supabase
            .from("patients")
            .select("id,name,dob,meta,owner_id,created_at,updated_at")
            .in("id", patientIds)
        : { data: [] as any[], error: null };

      if (patientsQ.error) {
        console.error("patients fetch error", patientsQ.error);
        return res.status(500).json({ error: patientsQ.error.message });
      }

      const messagesQ = consultationIds.length
        ? await supabase
            .from("messages")
            .select("id,consultation_id,author_id,body,created_at")
            .in("consultation_id", consultationIds)
            .order("created_at", { ascending: true })
        : { data: [] as any[], error: null };

      if (messagesQ.error) {
        console.error("messages fetch error", messagesQ.error);
        return res.status(500).json({ error: messagesQ.error.message });
      }

      // Compose nested objects
      const patientById = new Map<string, any>();
      for (const p of patientsQ.data || []) patientById.set(p.id, p);

      const messagesByConsult = new Map<string, any[]>();
      for (const m of messagesQ.data || []) {
        const arr = messagesByConsult.get(m.consultation_id) ?? [];
        arr.push(m);
        messagesByConsult.set(m.consultation_id, arr);
      }

      const consultationsWithRelations = consultations.map((c: any) => ({
        ...c,
        patient: patientById.get(c.patient_id) ?? null,
        messages: messagesByConsult.get(c.id) ?? [],
      }));

      return res.json({
        consultations: consultationsWithRelations,
        serverTime: Date.now(),
      });
    } catch (err: any) {
      console.error("sync pull error", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

export default router;
