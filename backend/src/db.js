import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const initialData = {
  users: [],
  articles: []
};

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

export const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erreur lecture DB:', error);
    return initialData;
  }
};

export const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erreur écriture DB:', error);
  }
};

export const findUserByEmail = (email) => {
  const db = readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const findUserById = (id) => {
  const db = readDB();
  return db.users.find(u => u.id === id);
};

export const createUser = (user) => {
  const db = readDB();
  db.users.push(user);
  writeDB(db);
  return user;
};

export const getArticles = () => {
  const db = readDB();
  return db.articles;
};

export const createArticle = (article) => {
  const db = readDB();
  db.articles.unshift(article);
  writeDB(db);
  return article;
};
