import express from 'express';
import { getArticles, createArticle } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/articles
router.get('/', (req, res) => {
  const articles = getArticles();
  res.json(articles);
});

// POST /api/articles (protected via JWT)
router.post('/', requireAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Le titre et le contenu sont obligatoires." });
  }

  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const newArticle = {
    id: Date.now().toString(),
    title,
    content,
    authorEmail: req.user.email,
    createdAt: formattedDate
  };

  createArticle(newArticle);
  res.status(201).json(newArticle);
});

export default router;
