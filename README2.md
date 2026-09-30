# Instructions et Guide du TP : OAuth 2.0 / OIDC & Passport.js

Ce document résume l'ensemble des étapes du TP et documente l'implémentation réalisée sur la branche **`TP3-OPENID`**.

---

## 🛠️ Implémentation réalisée sur le projet (Branche `TP3-OPENID`)

### 1. Configuration Google Cloud Console
* **Application** : `tp1-secureblogv1-bertrand-pierre`
* **Audience** : Externe (avec utilisateur de test configuré).
* **Scopes** : `openid`, `email`, `profile`.
* **URI de redirection** : `http://localhost:5001/api/auth/google/callback`

---

### 2. Backend Node.js (`backend/`)
* **Dépendances installées** :
  * `passport`
  * `passport-google-oauth20`
* **Fichier `.env` (`backend/.env`)** :
  * Configuré avec les variables d'environnement nécessaires (`PORT`, `JWT_SECRET`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `FRONTEND_URL`).
* **Configuration Passport (`backend/src/config/passport.js`)** :
  * Implémentation de `GoogleStrategy` (`passport-google-oauth20`).
  * Récupération automatique du profil Google (`email`, `displayName`, `photo`).
  * Création ou récupération de l'utilisateur dans `db.json`.
* **Routes d'authentification (`backend/src/routes/auth.js`)** :
  * `GET /api/auth/google` : Initie la connexion vers Google.
  * `GET /api/auth/google/callback` : Traite la réponse de Google, génère un JWT signé et pose un cookie `HttpOnly` avant de rediriger vers le frontend (`http://localhost:5173`).

---

### 3. Frontend React / Vite (`frontend/`)
* **Composant Login (`frontend/src/components/Login.jsx`)** :
  * Ajout du bouton **"Se connecter avec Google"** avec l'icône officielle.
  * Redirection automatique lors du clic vers `/api/auth/google`.
* **Styles CSS (`frontend/src/index.css`)** :
  * Ajout des classes `.btn-google`, `.google-icon` et du séparateur `.divider`.

---

### 🚀 Lancement et Tests

#### Option A : Avec Docker (Recommandé)
Pour construire et démarrer l'ensemble du projet (backend + frontend nginx) via Docker :
```bash
docker compose up --build
```

#### Option B : Sans Docker (Mode Développement Local)
1. **Démarrer le backend (Port 5001)** :
   ```bash
   cd backend
   npm run dev
   ```
2. **Démarrer le frontend (Port 5173)** :
   ```bash
   cd frontend
   npm run dev
   ```

---

#### 🧪 Procédure de Test
* Accéder à `http://localhost:5173` dans le navigateur.
* Cliquer sur **"Se connecter avec Google"**.
* Une fois authentifié chez Google, vous serez redirigé vers l'application en étant connecté.

---

## 🟢 Annexe 1 : Cours - OIDC avec Google en PHP

### 1. Configuration sur Google Cloud Console
* **Écran de consentement OAuth** : Mode Externe, scopes (`openid`, `email`, `profile`).
* **Identifiants** : ID Client OAuth 2.0 Web, URI de redirection (ex: `http://localhost:8000/connect.php`).

### 2. Code PHP
* **`config.php`** : Constantes `GOOGLE_ID` et `GOOGLE_SECRET`.
* **`login.php`** : Lien d'authentification vers `https://accounts.google.com/o/oauth2/v2/auth`.
* **`connect.php`** : Échange du `code` contre un `access_token` via Guzzle, récupération de l'email via l'endpoint `userinfo`, sauvegarde en session `$_SESSION['email']`.
* **`secret.php`** : Vérification de la session et protection de la page.

---

## 🔵 Annexe 2 : Cours - Passport.js avec React & Express

### 1. Structure du Projet
* `client/` : Frontend React
* `backend/` : Backend Express

### 2. Backend Express
* Installation : `express`, `passport`, `cors`, `cookie-session`, `passport-google-oauth20`, `passport-github2`.
* Setup `passport.initialize()`, `passport.session()`, routes `/auth/google` et `/auth/google/callback`.

### 3. Frontend React
* Navigation protégée, appel `/auth/login/success` avec `credentials: "include"` pour récupérer l'utilisateur en session.
