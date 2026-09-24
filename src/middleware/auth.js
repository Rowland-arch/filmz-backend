const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'filmz-development-secret';
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(authHeader.slice(7), getSecret());
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, getSecret };
