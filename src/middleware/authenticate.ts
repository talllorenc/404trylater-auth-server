import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED } from "../constants/http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/env";

interface IIsAuth extends Request {
  userId?: string;
  sessionId?: string;
}

export const authenticate = async (
  req: IIsAuth,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    return res.status(UNAUTHORIZED).json({ message: "Not authorized" });
  }

  jwt.verify(accessToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      const errorMessage =
        err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
      return res.status(UNAUTHORIZED).json({ message: errorMessage });
    }

    req.userId = (decoded as { userId: string }).userId;
    req.sessionId = (decoded as { sessionId: string }).sessionId;

    next();
  });
};
