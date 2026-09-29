# SecureBlog v2 — Authentification par JWT (TP2 Docker)

Projet réalisé dans le cadre du **TP2 : SecureBlog v2 — Authentification par JWT**.

---

## 📌 Présentation et fonctionnement

SecureBlog v2 fait évoluer l'architecture d'authentification vers un modèle **stateless basé sur les jetons JWT (JSON Web Tokens)**.

### Architecture & Sécurité :
- **Backend (Node.js / Express)** :
  - **Génération de JWT (`POST /api/login`)** : À la connexion, un token JWT est signé avec la clé secrète (`JWT_SECRET`) et contient le payload `{ id, email }`. Le token a une expiration courte (15 minutes).
  - **Stockage dans un Cookie HttpOnly** : Transmis dans un cookie nommé `token` avec les attributs `HttpOnly: true`, `SameSite: lax` pour prémunir contre les failles XSS.
  - **Middleware de vérification (`requireAuth`)** : Middleware autonome validant la signature et l'expiration du JWT via `jwt.verify` pour sécuriser les routes (`GET /api/me`, `POST /api/articles`).
  - **Stateless** : Le serveur ne stocke plus d'état de session (remplacement complet d'express-session).
  - **Déconnexion (`POST /api/logout`)** : Invalidation côté client via la suppression du cookie `token`.
- **Frontend (React / Vite)** :
  - Interface mise à jour pour SecureBlog v2.
- **Conteneurisation (Docker)** :
  - Frontend Nginx + Backend Node.js orchestrés via `docker-compose`.

---

## 🛠️ Prérequis & Lancement du projet

### Prérequis
- **Docker Desktop** installé et démarré.

---

### Lancement avec Docker Compose

1. Ouvrir un terminal à la racine du projet.
2. Lancer la commande suivante pour construire et démarrer les conteneurs :
   ```bash
   docker-compose up --build
   ```
3. Accéder à l'application :
   - **Interface Web** : http://localhost:5173
   - **API Backend** : http://localhost:5001

*Pour arrêter les conteneurs :*
```bash
docker-compose down
```

---

## 🎬 Étapes pour effectuer la démo TP2

Suivez ces étapes dans l'ordre pour présenter l'application v2 et démontrer le respect des critères de sécurité du TP2 :

### 1. Inscription & Connexion
- Ouvrir `http://localhost:5173` dans le navigateur.
- Créer un compte avec un mot de passe valide (ex: `demo@test.com` / `password123`).
- Se connecter à l'application.

### 2. Inspection du Token JWT (Cookie HttpOnly)
- Ouvrir les outils de développement (`F12` ou `Inspecter`).
- Aller dans **Application** (ou **Stockage**) > **Cookies** > `http://localhost:5173`.
  - *Constat* : Le cookie `token` contient une chaîne en trois parties séparées par des points (`header.payload.signature`).
  - *Sécurité* : L'attribut **HttpOnly** est bien actif.
- Exécuter `console.log(document.cookie)` dans l'onglet **Console** : le token reste inaccessible en JavaScript côté client.

### 3. Validation de la route stateless (`GET /api/me`)
- Rafraîchir la page (`F5`).
  - *Résultat attendu* : Le serveur vérifie la signature du JWT envoyé par le cookie et restitue les informations de l'utilisateur sans qu'aucune session ne soit stockée en mémoire serveur.

### 4. Publication d'un article avec authentification JWT
- Saisir un **Titre** et un **Contenu** puis cliquer sur **"Publier"**.
  - *Résultat attendu* : La route `POST /api/articles` décode le JWT pour identifier l'auteur et créer l'article.

### 5. Rejet systématique des JWT altérés ou expirés (Critère de réussite TP2)
- Modifier la valeur du cookie `token` dans DevTools (ex: altérer un caractère de la signature).
- Rafraîchir la page ou tenter de publier un article.
  - *Résultat attendu* : L'API rejette le token avec une erreur `401 Unauthorized ("Token invalide ou altéré")` et l'utilisateur est déconnecté.

### 6. Déconnexion
- Cliquer sur **"Se déconnecter"**.
  - *Résultat attendu* : Le cookie `token` est supprimé et l'accès aux routes protégées est ré-interdit.
