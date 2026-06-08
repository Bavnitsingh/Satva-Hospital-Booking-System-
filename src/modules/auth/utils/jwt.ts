import jwt from "jsonwebtoken";
import { env } from "../../../config/index.js";

export interface JwtPayload {
  id: number;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export function sign(payload: JwtPayload): string {
  const token = jwt.sign(payload, env.JWT_SECRET_KEY as string, {
    expiresIn: "2h",
  });
  return token;
}

export function verifyToken(token: string): JwtPayload {
  const isValid = jwt.verify(token, env.JWT_SECRET_KEY as string);
  return isValid as JwtPayload;
}
