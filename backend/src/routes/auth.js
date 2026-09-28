import express from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../db.js';

const router = express.Router();

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

    // Bcrypt hashing (salt generated automatically with cost factor 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: Date.now().toString(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    createUser(newUser);

    // Return created user without password hash
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

    // Verify password with bcrypt.compare
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // Save user info in express-session
    req.session.user = {
      id: user.id,
      email: user.email
    };

    res.json({
      message: "Connexion réussie",
      user: req.session.user
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Impossible de se déconnecter." });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Déconnexion réussie." });
  });
});

// GET /api/me (protected route)
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Non authentifié. Session invalide ou expirée." });
  }

  res.json({
    user: req.session.user
  });
});

export default router;
