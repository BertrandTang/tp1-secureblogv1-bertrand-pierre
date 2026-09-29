# SecureBlog v1 — Authentification par session (TP1 Docker)

Projet réalisé dans le cadre du TP1 : Inscription, connexion par session HTTP et conteneurisation Docker.

---

## 📌 Présentation et fonctionnement

SecureBlog v1 est un blog sécurisé permettant la gestion des utilisateurs et la publication d'articles.

### Architecture & Sécurité
- **Backend (Node.js / Express)** :
  - **Inscription (`POST /api/register`)** : Hachage des mots de passe avec `bcrypt` (10 rounds de salt). Validation de la longueur (minimum 8 caractères).
  - **Connexion (`POST /api/login`)** : Vérification des identifiants avec `bcrypt.compare` et création d'une session via `express-session`.
  - **Cookie de session (`connect.sid`)** : Configuré en `HttpOnly: true` pour empêcher tout accès via JavaScript côté client (protection XSS).
  - **Route protégée (`GET /api/me`)** : Maintien de l'état connecté après rafraîchissement de la page.
  - **Déconnexion (`POST /api/logout`)** : Destruction de la session côté serveur et suppression du cookie.
- **Frontend (React / Vite)** :
  - Interface réactive reprenant la maquette du TP (connexion, inscription, formulaire de publication et fil d'articles).
- **Conteneurisation (Docker)** :
  - Multi-stage build Nginx pour le frontend, conteneur Node.js pour le backend, orchestrés par `docker-compose`.

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

## 🎬 Étapes pour effectuer la démo

Suivez ces étapes dans l'ordre pour présenter l'application et démontrer le respect des critères de sécurité :

### 1. Inscription & Validation du mot de passe
- Ouvrir `http://localhost:5173` dans le navigateur.
- Cliquer sur **"Créer un compte"**.
- Taper un email (ex: `demo@test.com`) et un mot de passe court (`12345`) puis soumettre.
  - *Résultat attendu* : Message d'erreur demandant au moins 8 caractères.
- Saisir un mot de passe valide (`password123`) puis valider.
  - *Résultat attendu* : Création du compte et connexion automatique.

### 2. Démonstration de la protection du cookie (HttpOnly)
- Ouvrir les outils de développement (`F12` ou `Inspecter`).
- Aller dans **Application** (ou **Stockage**) > **Cookies** > `http://localhost:5173`.
  - *Constat* : Le cookie `connect.sid` est bien présent et la case **HttpOnly** est cochée.
- Ouvrir l'onglet **Console** et exécuter :
  ```javascript
  console.log(document.cookie)
  ```
  - *Résultat attendu* : Le cookie de session n'apparaît pas, prouvant la protection contre les failles XSS.

### 3. Maintien de session après rafraîchissement
- Rafraîchir la page (`F5` ou `Cmd+R`).
  - *Résultat attendu* : L'utilisateur reste connecté sans repasser par le formulaire grâce à l'appel automatique à `/api/me`.

### 4. Publication d'un article
- Dans le tableau de bord, saisir un **Titre** et un **Contenu**.
- Cliquer sur **"Publier"**.
  - *Résultat attendu* : L'article s'affiche directement dans la liste ci-dessous avec l'horodatage.

### 5. Déconnexion & Invalidation de session
- Cliquer sur le bouton **"Se déconnecter"** en haut à droite.
  - *Résultat attendu* : Retour à l'écran de connexion.
- Tenter d'appeler l'API protégée directement dans le navigateur ou via curl (`http://localhost:5001/api/me`).
  - *Résultat attendu* : Erreur `401 Unauthorized`.

### 6. Vérification de l'absence de mot de passe en clair en base
- Inspecter le fichier `backend/data/db.json`.
  - *Résultat attendu* : Le champ `passwordHash` contient un empreinte bcrypt (ex: `$2a$10$...`) et le mot de passe original en clair n'existe nulle part.
