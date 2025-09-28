import express from "express";
import { supabase } from "../lib/supabaseClient";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// helpers
function isoToDate(s: string) {
  return new Date(s);
}

/**
 * POST /appointments
 * body: { doctorId, scheduledAt (ISO string), durationMinutes?, reason? }
 * patient is taken from auth token (req.user)
 */
router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    const { doctorId, scheduledAt, durationMinutes = 30, reason } = req.body;
    if (!doctorId || !scheduledAt)
      return res
        .status(400)
        .json({ error: "doctorId and scheduledAt required" });

    // basic checks: patient cannot book with self if doctor
    if (user.id === doctorId)
      return res.status(400).json({ error: "cannot book with yourself" });

    const scheduled = new Date(scheduledAt);
    if (isNaN(scheduled.getTime()))
      return res.status(400).json({ error: "invalid scheduledAt" });

    // scheduling window: not in the past, and within next 6 months
    const now = new Date();
    if (scheduled <= now)
      return res.status(400).json({ error: "cannot schedule in the past" });
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    if (scheduled > maxDate)
      return res
        .status(400)
        .json({ error: "can only schedule up to 6 months in advance" });

    // server-side conflict check: overlapping appointments for same doctor where status != CANCELLED
    const scheduledEnd = new Date(
      scheduled.getTime() + durationMinutes * 60000
    );

    // SQL-like: SELECT * FROM appointments WHERE doctor_id = $1 AND status != 'CANCELLED' AND NOT (scheduled_at + interval 'duration_minutes minutes' <= $start OR scheduled_at >= $end)
    // We emulate via Supabase query: fetch appointments for doctor in the +- window
    const windowStart = new Date(scheduled.getTime() - 60 * 60 * 1000); // 1 hour before
    const windowEnd = new Date(scheduledEnd.getTime() + 60 * 60 * 1000); // 1 hour after

    const q = await supabase
      .from("appointments")
      .select("id,scheduled_at,duration_minutes,status")
      .eq("doctor_id", doctorId)
      .in("status", ["PENDING", "ACCEPTED", "COMPLETED"]) // consider these for conflicts
      .gte("scheduled_at", windowStart.toISOString())
      .lte("scheduled_at", windowEnd.toISOString());

    if (q.error) return res.status(500).json({ error: q.error.message });
    // inspect conflicts precisely
    const conflicts = (q.data || []).filter((a: any) => {
      const aStart = new Date(a.scheduled_at);
      const aEnd = new Date(
        aStart.getTime() + (a.duration_minutes || 30) * 60000
      );
      return !(aEnd <= scheduled || aStart >= scheduledEnd);
    });
    if (conflicts.length > 0)
      return res
        .status(409)
        .json({ error: "Requested time conflicts with existing appointment" });

    // Insert appointment
    const insert = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id: doctorId,
        scheduled_at: scheduled.toISOString(),
        duration_minutes: durationMinutes,
        reason,
      })
      .select("*")
      .single();

    if (insert.error)
      return res.status(500).json({ error: insert.error.message });
    return res.status(201).json(insert.data);
  } catch (err: any) {
    console.error("appointments create error", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /appointments/doctor
 * doctor sees appointments for them
 */
router.get("/doctor", authMiddleware, async (req: any, res) => {
  const user = req.user;
  if (user.role !== "DOCTOR")
    return res.status(403).json({ error: "for doctors only" });

  const q = await supabase
    .from("appointments")
    .select(
      "id,patient_id,doctor_id,scheduled_at,duration_minutes,status,reason,created_at"
    )
    .eq("doctor_id", user.id)
    .order("scheduled_at", { ascending: true });

  if (q.error) return res.status(500).json({ error: q.error.message });
  res.json(q.data);
});

/**
 * PATCH /appointments/:id
 * body: { action: 'ACCEPT' | 'CANCEL' | 'COMPLETE' }
 * Only doctor (owner) or admin can change status
 */
router.patch("/:id", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const { action } = req.body;
    if (!["ACCEPT", "CANCEL", "COMPLETE"].includes(action))
      return res.status(400).json({ error: "invalid action" });

    const aQ = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();
    if (aQ.error) return res.status(404).json({ error: aQ.error.message });
    const appt = aQ.data;

    // permission
    if (
      !(
        user.role === "ADMIN" ||
        (user.role === "DOCTOR" && user.id === appt.doctor_id)
      )
    ) {
      return res.status(403).json({ error: "forbidden" });
    }

    // Accept -> check conflicts again
    if (action === "ACCEPT") {
      const scheduled = new Date(appt.scheduled_at);
      const scheduledEnd = new Date(
        scheduled.getTime() + (appt.duration_minutes || 30) * 60000
      );
      const windowStart = new Date(scheduled.getTime() - 60 * 60 * 1000);
      const windowEnd = new Date(scheduledEnd.getTime() + 60 * 60 * 1000);
      const q = await supabase
        .from("appointments")
        .select("id,scheduled_at,duration_minutes,status")
        .eq("doctor_id", appt.doctor_id)
        .in("status", ["PENDING", "ACCEPTED", "COMPLETED"])
        .gte("scheduled_at", windowStart.toISOString())
        .lte("scheduled_at", windowEnd.toISOString());

      if (q.error) return res.status(500).json({ error: q.error.message });
      const conflicts = (q.data || []).filter(
        (a: any) =>
          a.id !== appt.id &&
          !(
            new Date(a.scheduled_at).getTime() +
              (a.duration_minutes || 30) * 60000 <=
              scheduled.getTime() ||
            new Date(a.scheduled_at).getTime() >= scheduledEnd.getTime()
          )
      );
      if (conflicts.length > 0)
        return res.status(409).json({
          error: "Cannot accept — time conflicts with existing appointment",
        });
    }

    const newStatus =
      action === "ACCEPT"
        ? "ACCEPTED"
        : action === "CANCEL"
        ? "CANCELLED"
        : "COMPLETED";
    const upd = await supabase
      .from("appointments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (upd.error) return res.status(500).json({ error: upd.error.message });
    res.json(upd.data);
  } catch (err: any) {
    console.error("appointments patch error", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;
