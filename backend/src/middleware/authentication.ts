import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Attach user to request for later use
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}
