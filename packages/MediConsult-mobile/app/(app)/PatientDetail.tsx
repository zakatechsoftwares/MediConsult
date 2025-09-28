// app/(app)/PatientDetail.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useSearchParams } from "expo-router";
import { execSqlAsync } from "../../src/db/sqlite";

export default function PatientDetail() {
  const { local_id } = useSearchParams();
  const [patient, setPatient] = useState<any | null>(null);

  async function load() {
    if (!local_id) return;
    const res = await execSqlAsync(
      "SELECT * FROM patients WHERE local_id = ? LIMIT 1",
      [local_id]
    );
    setPatient(res.rows._array[0] ?? null);
  }

  useEffect(() => {
    load();
  }, [local_id]);

  if (!patient)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{patient.name}</Text>
      <Text>DOB: {patient.dob}</Text>
      <Text>Server ID: {patient.server_id ?? "—"}</Text>
      <Text>Sync status: {patient.sync_status}</Text>
      <Button
        title="Back"
        onPress={() => {
          /* user can swipe back */
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
});
