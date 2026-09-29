import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secureblog_jwt_secret_key_tp2_2026';

export const requireAuth = (req, res, next) => {
  let token = req.cookies?.token;

  // Optionnel: supporter aussi le header Authorization Bearer <token>
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Non authentifié. Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expiré. Veuillez vous reconnecter." });
    }
    return res.status(401).json({ error: "Token invalide ou altéré." });
  }
};
