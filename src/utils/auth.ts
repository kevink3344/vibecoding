import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthPayload {
  userId: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (user: { UserId: number; Email: string; Name: string }): string => {
  return jwt.sign(
    {
      userId: user.UserId,
      email: user.Email,
      name: user.Name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): AuthPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): AuthPayload | null => {
  try {
    const decoded = jwt.decode(token) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
