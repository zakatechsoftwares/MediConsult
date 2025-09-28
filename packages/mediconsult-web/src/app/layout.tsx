// app/layout.tsx (server component)

import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
// import dynamic from "next/dynamic";
import NavBar from "../components/NavBar";
import { Provider } from "react-redux";
import { store } from "../store/store"; // adjust path if you placed store under src/store
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // optional if also using react-query
const queryClient = new QueryClient();

// Load NavBar as a client component (no server-side props)
// const NavBar = dynamic(() => import("../components/NavBar"), { ssr: false });

export const metadata: Metadata = {
  title: "MediConsult",
  description: "Telemedicine demo app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            {/* NavBar is loaded only on the client (ssr: false) to avoid server/client mismatch */}
            <NavBar />
            <main className="container">{children}</main>
          </QueryClientProvider>{" "}
        </Provider>
      </body>
    </html>
  );
}
