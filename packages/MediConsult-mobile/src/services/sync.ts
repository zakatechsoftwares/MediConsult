// src/services/sync.ts
import { execSqlAsync } from "../db/sqlite";
import { supabase } from "../supabase";

/**
 * Simple sync runner skeleton:
 * - picks pending rows from local DB
 * - pushes them to server (via Supabase RPC or table inserts)
 * - updates local rows with server_id + synced status
 *
 * This is intentionally minimal — expand with batching, backoff, and conflict resolution.
 */

export async function pushPendingPatients(): Promise<void> {
  const res = await execSqlAsync(
    `SELECT * FROM patients WHERE sync_status = 'pending'`
  );
  const rows = res.rows._array;

  if (rows.length === 0) return;

  // Example push: insert one by one (change to batch if desired)
  for (const r of rows) {
    try {
      // adapt to your server schema
      const { data, error } = await supabase
        .from("patients")
        .insert([{ name: r.name, dob: r.dob, meta: r.meta }])
        .select()
        .single();

      if (error) {
        console.error("supabase insert error", error);
        continue;
      }
      // update local row
      await execSqlAsync(
        `UPDATE patients SET server_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
        [data.id, Date.now(), r.local_id]
      );
    } catch (e) {
      console.error("pushPendingPatients error", e);
    }
  }
}

export async function runSync() {
  try {
    // push local pending
    await pushPendingPatients();
    // TODO: pull changes from server and merge into local SQLite
  } catch (e) {
    console.error("runSync error", e);
  }
}
