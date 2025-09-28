// app/(auth)/SignIn.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { supabase } from "../../src/supabase";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const router = useRouter();

  async function handleSignIn() {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }
      // navigate to app root
      router.replace("/PatientsList");
    } catch (e) {
      Alert.alert("Sign in error", String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mediconsult — Sign in</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Sign in" onPress={handleSignIn} />
      <Text style={styles.hint}>
        Use demo@example.com / demo123 for quick demo (seed your Supabase DB).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, marginBottom: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  hint: { marginTop: 12, color: "#666" },
});
