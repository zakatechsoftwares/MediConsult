// app/(app)/CreatePatient.tsx
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { execSqlAsync } from "../../src/db/sqlite";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "expo-router";

export default function CreatePatient() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const router = useRouter();

  async function handleSave() {
    if (!name) {
      Alert.alert("Validation", "Name is required");
      return;
    }
    const local_id = uuidv4();
    const now = Date.now();
    await execSqlAsync(
      `INSERT INTO patients (local_id, name, dob, meta, updated_at, sync_status) VALUES (?, ?, ?, ?, ?, ?)`,
      [local_id, name, dob || null, "{}", now, "pending"]
    );
    router.replace("/PatientsList");
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="DOB (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
        style={styles.input}
      />
      <Button title="Save patient" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
});
