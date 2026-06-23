import jwt from 'jsonwebtoken';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key-for-dev-only-change-in-prod')) {
  throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be securely set in production!");
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-change-in-prod';
const JWT_EXPIRES_IN = '24h';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
