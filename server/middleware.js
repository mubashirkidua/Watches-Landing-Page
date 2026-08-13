import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'ocean-dev-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { uid: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_TTL || '7d' }
  );
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

export function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    address: u.address,
    city: u.city,
    created_at: u.created_at
  };
}
