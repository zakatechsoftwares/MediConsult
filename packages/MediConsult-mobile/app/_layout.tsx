// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { migrate } from "../src/db/sqlite";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    migrate().catch((e) => console.error("migration error", e));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: true }} />
    </QueryClientProvider>
  );
}
