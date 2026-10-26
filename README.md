# Gestion Montres

Plateforme de gestion pour un magasin de montres : Next.js + Supabase, déployée sur Netlify.

## Fonctionnalités

**Côté employé** (`/`, connexion par code d'accès)
- Recherche par référence, nom ou marque (plusieurs mots possibles)
- Fiche montre : photo, prix, disponibilité, description

**Côté admin** (`/admin/login`, mot de passe)
- Ajouter / modifier / supprimer des montres (référence, nom, marque, prix, stock, description, photo)
- Basculer « en stock / rupture » en un clic
- Import d'un fichier Excel (création ou mise à jour par référence) + modèle à télécharger
- Ajout des photos : en masse (fichier nommé avec la référence) ou une par une
- Gestion des employés : nom, prénom, code d'accès généré, activer/désactiver, nouveau code
- Droits par employé : **Lecture seule** (consulter) ou **Peut modifier** (prix, stock, infos, photo
  d'une montre existante). Ajout, suppression, import et gestion des employés restent réservés à l'admin.

**Réglages** (`/admin/reglages`)
- Changer le mot de passe admin. `ADMIN_PASSWORD` n'est que le mot de passe de départ : une fois
  changé, le nouveau (haché) est stocké dans Supabase et remplace celui de `.env`.

## Installation

### 1. Supabase
1. Créer un projet sur https://supabase.com
2. **SQL Editor** → coller et exécuter `supabase/schema.sql`
3. **Project Settings → API** : récupérer l'URL, la clé `anon` et la clé `service_role`

### 2. En local
```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

### 3. Netlify
1. Pousser le code sur GitHub
2. Netlify → **Add new site → Import from Git** → choisir le repo (Next.js détecté automatiquement)
3. **Site configuration → Environment variables** : ajouter toutes les variables de `.env.example`
4. Déployer

Générer un `SESSION_SECRET` :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Format Excel

| reference | nom | marque | prix | stock | description |
|---|---|---|---|---|---|
| GA-2100-1A | G-Shock GA-2100 | Casio | 18500 | oui | |

`reference`, `nom`, `prix` sont obligatoires. Pour les photos en masse, nommer chaque fichier
avec la référence (`GA-2100-1A.jpg`) ; majuscules, tirets et espaces sont ignorés pour la correspondance.

## Sécurité
- Les tables ont RLS activé sans policy : seul le serveur (clé `service_role`) y accède.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` (pas de préfixe `NEXT_PUBLIC_`).
- Les photos sont dans un bucket public (lisibles par URL), l'écriture passe par des URL signées.
