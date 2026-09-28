import express from 'express';
import { getArticles, createArticle } from '../db.js';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Action non autorisée. Veuillez vous connecter." });
  }
  next();
};

// GET /api/articles
router.get('/', (req, res) => {
  const articles = getArticles();
  res.json(articles);
});

// POST /api/articles (protected)
router.post('/', requireAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Le titre et le contenu sont obligatoires." });
  }

  const now = new Date();
  // Format as DD/MM/YYYY HH:mm:ss for exact match with UI design
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const newArticle = {
    id: Date.now().toString(),
    title,
    content,
    authorEmail: req.session.user.email,
    createdAt: formattedDate
  };

  createArticle(newArticle);
  res.status(201).json(newArticle);
});

export default router;
