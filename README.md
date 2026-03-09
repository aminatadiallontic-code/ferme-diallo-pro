# Ferme Diallo (Frontend React + Backend Laravel)

## Démarrage en local

### Backend (Laravel API)

Depuis le dossier `backend` :

```sh
php artisan serve --host=127.0.0.1 --port=8000
```

URL backend :

- `http://127.0.0.1:8000`

Les endpoints API sont sous :

- `http://127.0.0.1:8000/api/...`

### Frontend (Vite / React)

Depuis la racine du projet :

```sh
npm install
npm run dev
```

URL frontend :

- Vite affiche l’URL dans le terminal (souvent `http://localhost:5173`)

Note : en développement, le frontend appelle l’API via le proxy Vite sur `/api`.

## Connexion (auth + rôles)

L’application utilise une authentification API (Sanctum, token Bearer). Après connexion, le token est stocké dans le navigateur.

### Comptes de test

- **Admin (fermier)**
  - Email : `admin@gmail.com`
  - Mot de passe : `Di@llo2026`

- **Gestionnaire**
  - Email : `gestionnaire@gmail.com`
  - Mot de passe : `Gest@2026`

### Règles d’accès (rôles)

- **Clients** : accessible à tout utilisateur authentifié
- **Stocks** : accessible à tout utilisateur authentifié
- **Finance (Transactions)** : accessible uniquement au rôle **`fermier`**

## Routes API principales

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Ressources protégées (auth:sanctum)

- `GET/POST/PUT/DELETE /api/clients`
- `GET/POST/PUT/PATCH/DELETE /api/stock-items`
- `PATCH /api/stock-items/{id}/quantity`

### Finance (protégée + role:fermier)

- `GET/POST/PUT/DELETE /api/transactions`

## Base de données (seed)

Depuis `backend` :

```sh
php artisan migrate
php artisan db:seed
```

Le seeding crée :

- des articles de stock (`stock_items`)
- les comptes de test ci-dessus (`users`)
