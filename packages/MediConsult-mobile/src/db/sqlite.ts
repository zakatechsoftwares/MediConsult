// src/db/sqlite.ts
import * as SQLite from "expo-sqlite";
import { openDatabase } from "expo-sqlite";

const DB_NAME = "mediconsult.db";
const db = openDatabase(DB_NAME);

export function execSqlAsync(
  sql: string,
  args: any[] = []
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          args,
          (_, result) => resolve(result),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      },
      (err) => reject(err)
    );
  });
}

/** Run migrations (idempotent) */
export async function migrate() {
  // patients
  await execSqlAsync(
    `CREATE TABLE IF NOT EXISTS patients (
      local_id TEXT PRIMARY KEY,
      server_id INTEGER,
      name TEXT,
      dob TEXT,
      meta TEXT,
      updated_at INTEGER,
      sync_status TEXT
    );`
  );

  // consultations
  await execSqlAsync(
    `CREATE TABLE IF NOT EXISTS consultations (
      local_id TEXT PRIMARY KEY,
      server_id INTEGER,
      patient_local_id TEXT,
      title TEXT,
      scheduled_at INTEGER,
      updated_at INTEGER,
      sync_status TEXT
    );`
  );

  // messages
  await execSqlAsync(
    `CREATE TABLE IF NOT EXISTS messages (
      local_id TEXT PRIMARY KEY,
      server_id INTEGER,
      consultation_local_id TEXT,
      author_id TEXT,
      body TEXT,
      created_at INTEGER,
      sync_status TEXT
    );`
  );

  // device tokens
  await execSqlAsync(
    `CREATE TABLE IF NOT EXISTS device_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expo_push_token TEXT,
      user_id TEXT,
      updated_at INTEGER
    );`
  );
}
