import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import type { AuthPayload } from '../utils/auth.js';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};
