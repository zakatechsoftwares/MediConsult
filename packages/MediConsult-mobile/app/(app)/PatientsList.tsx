// app/(app)/PatientsList.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { execSqlAsync } from "../../src/db/sqlite";
import { v4 as uuidv4 } from "uuid";

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const router = useRouter();

  async function loadPatients() {
    try {
      const res = await execSqlAsync(
        "SELECT * FROM patients ORDER BY updated_at DESC"
      );
      setPatients(res.rows._array);
    } catch (e) {
      console.error("loadPatients", e);
    }
  }

  useEffect(() => {
    loadPatients();
    // subscribe to focus? simple approach: reload on mount
  }, []);

  async function handleCreateDemo() {
    const local_id = uuidv4();
    const now = Date.now();
    await execSqlAsync(
      `INSERT INTO patients (local_id, name, dob, meta, updated_at, sync_status) VALUES (?, ?, ?, ?, ?, ?)`,
      [local_id, "Demo Patient", "1990-01-01", "{}", now, "pending"]
    );
    loadPatients();
  }

  function renderItem({ item }: { item: any }) {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/PatientDetail",
            params: { local_id: item.local_id },
          })
        }
        style={styles.item}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>status: {item.sync_status ?? "unknown"}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Patients</Text>
        <Button title="New demo" onPress={handleCreateDemo} />
      </View>
      <FlatList
        data={patients}
        keyExtractor={(i) => i.local_id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No patients yet</Text>}
      />
      <Button
        title="Create patient"
        onPress={() => router.push("/CreatePatient")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "600" },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  name: { fontSize: 16 },
  meta: { fontSize: 12, color: "#666" },
});
