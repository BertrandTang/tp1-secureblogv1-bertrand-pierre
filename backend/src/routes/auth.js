import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import passport from '../config/passport.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secureblog_jwt_secret_key_tp2_2026';
const JWT_EXPIRES_IN = '15m'; // Expiration courte 15 minutes
const COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes en ms

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "L'email et le mot de passe sont requis." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: Date.now().toString(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    createUser(newUser);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // Génération du JWT signé
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Envoi du JWT dans un cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Passer à true en production avec HTTPS
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    });

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

// GET /api/auth/google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/auth/google/callback
router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error("Erreur callback Google OAuth:", err || info);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}?error=google_auth_failed`);
    }

    // Génération du JWT signé pour l'utilisateur authentifié via Google
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Envoi du JWT dans un cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(frontendUrl);
  })(req, res, next);
});

// POST /api/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Déconnexion réussie." });
});

// GET /api/me (route protégée via le middleware JWT requireAuth)
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

export default router;

