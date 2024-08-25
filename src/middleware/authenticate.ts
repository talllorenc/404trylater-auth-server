import { Request, Response, NextFunction } from 'express';
import { FORBIDDEN, UNAUTHORIZED } from '../constants/http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/env';

interface IIsAuth extends Request {
  userId?: string;
  sessionId?: string;
}

export const authenticate = (req: IIsAuth, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    return res.status(UNAUTHORIZED).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (err) {
    res.status(UNAUTHORIZED).json({ message: 'InvalidAccessToken' });
  }
};
