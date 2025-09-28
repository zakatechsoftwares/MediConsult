// src/utils/auth.ts
import * as jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? "dev-secret";
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m";

export function signAccessToken(user: Partial<User>) {
  // keep the payload small and predictable
  const payload = { sub: user.id, role: user.role, approved: user.approved };

  // jwt.sign overloads expect jwt.Secret for the secret and jwt.SignOptions for the options
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
  return token;
}

/**
 * Returns the decoded token payload (JwtPayload | string) or null if invalid.
 */
export function verifyAccessToken(
  token: string
): jwt.JwtPayload | string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as jwt.JwtPayload | string;
  } catch (e) {
    return null;
  }
}
