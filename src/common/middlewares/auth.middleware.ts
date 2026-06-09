import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../../modules/auth/utils/jwt.js";
import logger from "../logger.js";

export interface AuthRequest extends Request {
  user: JwtPayload;
}

//  Verify JWT & attaching user 
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ statusCode: 401, message: "Missing or invalid authorization header", data: null });
    return;
  }
  try {
    const token:any = header.split(" ")[1];
    const payload = verifyToken(token);
    (req as AuthRequest).user = payload;
    logger.info(payload)
    console.log(payload)
    next();
  } catch {
    res.status(401).json({ statusCode: 401, message: "Token expired or invalid", data: null });
  }
}

// Role-based auth
export function isPatient(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;
  if (user?.role !== "PATIENT") {
    res.status(403).json({ statusCode: 403, message: "Access restricted to patients", data: null });
    return;
  }
  next();
}

export function isDoctor(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;
  if (user?.role !== "DOCTOR") {
    res.status(403).json({ statusCode: 403, message: "Access restricted to doctors", data: null });
    return;
  }
  next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;
 
  if (user?.role !== "ADMIN") {
    res.status(403).json({ statusCode: 403, message: "Access restricted to admins", data: null });
    return;
  }
  next();
}

//  authenticate + role  
export const patientAuth  = [authenticate, isPatient];
export const doctorAuth   = [authenticate, isDoctor];
export const adminAuth    = [authenticate, isAdmin];

export function authorizeRoles(...roles: Array<"PATIENT" | "DOCTOR" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!roles.includes(user?.role)) {
      res.status(403).json({ statusCode: 403, message: `Access restricted to: ${roles.join(", ")}`, data: null });
      return;
    }
    next();
  };
}