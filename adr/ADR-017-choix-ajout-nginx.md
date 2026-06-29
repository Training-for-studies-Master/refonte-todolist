# ADR-017 — Ajout de Nginx pour servir le frontend buildé
## Titre : Ajout de Nginx pour servir le frontend buildé
## Statut
Accepté

---

## Contexte

L’application est composée de deux services principaux :

### Frontend
- En développement : utilisation de `run dev` avec Node.js
- En production : génération d’un build statique via `run build`
- Les fichiers générés (HTML, CSS, JS) ne nécessitent plus Node.js
- Ils doivent être servis efficacement via un serveur web

### Backend (Gateway)
- Application Node.js basée sur Express
- Expose une API sur le port `3000`
- Utilisée par le frontend pour les appels API

---

## Problème

Avant cette décision :
- Le frontend était potentiellement servi via Node.js même en production
- Pas de séparation claire entre les responsabilités
- Utilisation non optimale des ressources côté frontend
- Absence de serveur web dédié pour les fichiers statiques

---

## Décision

Nous introduisons Nginx comme serveur web pour le frontend en production.

### Frontend (production)
- Le build (`npm run build`) génère des fichiers statiques
- Ces fichiers sont servis par :contentReference[oaicite:1]{index=1}
- Nginx expose le frontend sur le port `80`
- Configuration Docker : `80:80`

### Backend (Gateway)
- Application basée sur :contentReference[oaicite:2]{index=2}
- Expose une API sur le port `3000`
- Configuration Docker : `3000:3000`

### Communication Front / Back
- Le frontend appelle le backend via une URL configurable :
  - Exemple : `http://gateway:3000`
- Cette URL est injectée via variable d’environnement

---

## Architecture cible

- Frontend : statique servi par :contentReference[oaicite:3]{index=3} (port 80)
- Backend : API Node.js (port 3000)
- Communication via HTTP entre frontend et backend

---

## Conséquences

### Positives
- Séparation claire des responsabilités :
  - Frontend = statique
  - Backend = API
- Amélioration des performances en production
- Réduction de la charge Node côté frontend
- Utilisation d’un serveur web optimisé pour les fichiers statiques

### Négatives
- Ajout d’un composant supplémentaire (Nginx)
- Nécessité de gérer la configuration Nginx (SPA routing, fallback)
- Gestion des variables d’environnement pour les appels API

---

## Alternatives envisagées

### 1. Servir le frontend via Node.js
- Simple mais moins performant en production

### 2. Utilisation d’un CDN
- Très performant mais plus complexe à mettre en place localement

### 3. Reverse proxy unique
- Possible mais complexifie la séparation frontend / backend

---

## Notes

Cette architecture est compatible avec une évolution future vers :
- blue/green deployment
- scaling indépendant du frontend et du backend
- ajout d’un reverse proxy central si nécessaire