import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'aquaswap_jwt_production_secret_key_2026';

/**
 * Middleware to verify JWT token on protected endpoints
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Missing bearer token.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}
