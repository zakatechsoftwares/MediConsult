"use client";

import React, { useState } from "react";
import { useLoginMutation } from "../../store/api";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      // res expected shape: { accessToken, user }
      const token = res.accessToken; //?? res.accessToken ?? res.token;
      const user = res.user ?? res;
      dispatch(setCredentials({ token, user }));
      router.push("/"); // adjust
    } catch (err) {
      console.error("login failed", err);
      alert("Login failed");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button type="submit" disabled={isLoading}>
        Sign in
      </button>
    </form>
  );
}
