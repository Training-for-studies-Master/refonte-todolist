# Documentation CI

Ce document décrit l’architecture globale de la CI du projet, basée sur plusieurs workflows GitHub Actions indépendants. Chaque workflow est déclenché par un événement spécifique (Pull Request, push, planification) et a un rôle dédié : tests, sécurité, build ou déploiement.

---

# Architecture globale CI

Le projet repose sur une architecture CI **événementielle**, composée de plusieurs workflows GitHub Actions :

- Workflows sur Pull Request (qualité, tests, sécurité)
- Workflows de sécurité et d’analyse statique
- Workflows de build et de publication
- Workflows nocturnes (tests d’intégration et E2E)
- Mise à jour automatique des dépendances (Dependabot)

Chaque workflow est indépendant et spécialisé.

---

# Déclencheurs des workflows

## Pull Request (develop / main)

Déclenché lors de l’ouverture ou de la mise à jour d’une PR.

Utilisé pour :
- Tests unitaires
- Lint du code
- Couverture de tests
- Vérifications de sécurité
- Analyse de qualité
- Validation du CI gate
- Auto-merge si tout est valide

---

## Push sur main

Déclenché lors d’un merge sur `main`.

Utilisé pour :
- Construction des images Docker
- Publication dans une registry (GHCR)

---

## Exécution planifiée (cron)

Déclenchée chaque nuit.

Utilisée pour :
- Tests d’intégration
- Tests end-to-end (E2E) sur stack complète

---

## Dependabot

Génère automatiquement des Pull Requests pour la mise à jour des dépendances.

Ces PR déclenchent ensuite la CI classique.

---

#  Monorepo et gestion des dépendances

Le projet est organisé en **monorepo** utilisant **pnpm workspaces**.

### Avantages :
- Mutualisation des dépendances
- Réduction des installations redondantes
- CI plus rapide
- Moins d’espace disque utilisé

### Exécution ciblée :
La CI utilise des filtres pnpm :

- `pnpm --filter frontend`
- `pnpm --filter backend`
- `pnpm --filter gateway`
- `pnpm --filter "services/*"`

Cela permet une exécution **incrémentale** selon les fichiers modifiés.

---

# Pipeline CI (Pull Request)

## Détection des changements

La CI utilise `dorny/paths-filter` pour détecter les modules modifiés :

- frontend
- backend
- gateway
- services

Cela permet d’exécuter uniquement les jobs nécessaires.

---

## Tests

Exécutés par module :
- Tests backend
- Tests frontend
- Tests des services

---

## Couverture de tests

Les rapports de couverture sont générés et stockés comme artefacts GitHub.

---

## Linting

- ESLint (qualité du code JavaScript/TypeScript)
- Hadolint (validation des Dockerfiles)

---

## CI Gate

Étape de validation finale qui vérifie que tous les jobs requis :
- ont réussi
- ou ont été ignorés volontairement

Si une étape échoue, la PR ne peut pas être fusionnée.

---

## Auto-merge

Si le CI gate est validé :
- la Pull Request est fusionnée automatiquement (squash merge)

---

#  Sécurité et qualité

## Sécurité des dépendances

- `npm audit` détecte les vulnérabilités connues

## Détection de secrets

- Gitleaks analyse le code pour détecter des clés ou secrets exposés

## Validation Docker

- `docker compose config` vérifie la validité des fichiers Docker Compose

## Vérification des licences

- License Checker valide la conformité des licences utilisées

Licences autorisées :
MIT, Apache-2.0, BSD, ISC, etc.

---

# Analyse statique et sécurité

## CodeQL

- Analyse statique de sécurité
- Détection de vulnérabilités (injections, mauvaises pratiques)
- Exécuté sur :
  - push
  - pull request
  - planification hebdomadaire

---

## SonarCloud

- Analyse de la qualité du code
- Dette technique
- Complexité
- Code smells
- Duplication

---

## Trivy

- Analyse des vulnérabilités dans les dépendances
- Génération de rapports SARIF
- Intégration dans GitHub Security

---

# Build et publication Docker

Déclenché uniquement lors d’un push sur `main`.

## Stratégie de build

- Utilisation de Docker Buildx
- Architecture multi-services :
  - frontend
  - backend
  - gateway
  - services (auth, tasks, projects, notifications)

## Résultat

Les images sont publiées dans :

- GitHub Container Registry (GHCR)

Chaque image est versionnée :
- `latest`
- hash du commit

---

# Pipeline nocturne (Integration & E2E)

Exécuté chaque nuit.

## Objectif

Valider le système complet dans un environnement réaliste.

## Étapes

- Lancement de la stack via Docker Compose
- Tests d’intégration
- Tests end-to-end (Playwright)
- Arrêt de l’environnement

---

# 9. Résumé CI

| Domaine | Outils |
|----------|--------|
| Tests | pnpm test |
| Couverture | Jest / coverage |
| Lint | ESLint, Hadolint |
| Sécurité | CodeQL, Trivy |
| Qualité | SonarCloud |
| Secrets | Gitleaks |
| Dépendances | npm audit, Dependabot |
| Build | Docker Buildx |
| Registry | GHCR |
| E2E | Playwright |
| Intégration | Nightly CI |

---

# Principes de conception

- Workflows événementiels
- Séparation des responsabilités (CI / sécurité / build / nightly)
- Exécution incrémentale avec filtrage des fichiers
- Optimisation monorepo avec pnpm workspaces
- Automatisation complète (auto-merge + Dependabot)
- Traçabilité via GitHub (artifacts + Security tab)

---

# Conclusion

Cette architecture CI/CD permet de garantir :

- Un feedback rapide sur les Pull Requests
- Une forte exigence de qualité et de sécurité
- Une automatisation complète des dépendances
- Des builds reproductibles via Docker
- Une validation continue du système complet