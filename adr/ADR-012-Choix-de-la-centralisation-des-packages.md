# ADR N°8 — Choix de la centralisation des packages
## Titre : Choix de la centralisation des packages
## Status : Accepted 
## Contexte : Le projet Kanban est structuré sous forme de monorepo regroupant plusieurs applications et services (frontend, backend et services annexes) reposant sur Node.js. Dans ce contexte, plusieurs sous-projets partagent des dépendances communes (frameworks, outils de test, linters, bibliothèques de sécurité), ce qui entraîne une duplication importante des packages et une complexité accrue dans leur gestion. Sans mécanisme de centralisation, chaque service possède son propre dossier node_modules, ce qui entraîne une augmentation significative de l’espace disque utilisé ainsi que des temps d’installation plus longs lors des pipelines d’intégration continue. De plus, la cohérence des versions de dépendances entre les différents services peut devenir difficile à garantir, augmentant le risque d’incompatibilités ou de comportements divergents entre environnements.

## Décision : 
Dans le cadre de la gestion du monorepo du projet Kanban, il a été décidé d’adopter pnpm comme gestionnaire de packages principal pour la centralisation et l’optimisation des dépendances.

pnpm sera utilisé pour :

- La gestion des dépendances de l’ensemble des services (frontend, backend, services partagés)
- La mise en place d’un stockage global des packages via un store central
- La gestion des workspaces afin de mutualiser les dépendances communes entre les différents sous-projets
- L’optimisation des installations dans les pipelines CI

## Alternative :
1. npm workspaces

npm propose nativement une gestion de monorepo via les workspaces.

Avantages :

- Solution native à Node.js (pas d’outil supplémentaire) ;
- Intégration simple dans les projets existants ;
- Courbe d’apprentissage faible.

Inconvénients :

- Performances d’installation moins optimisées que pnpm ;
- Duplication plus importante des dépendances dans certains cas ;
- Gestion du cache moins efficace dans les environnements CI.

2. pnpm (retenu)

pnpm utilise un système de stockage global avec liens symboliques permettant de mutualiser les dépendances entre projets.

Avantages :

- Installation plus rapide grâce au cache global ;
- Réduction importante de l’espace disque utilisé ;
- Meilleure reproductibilité des environnements ;
- Gestion efficace des monorepos via workspaces ;
- Très adapté aux pipelines CI/CD.

Inconvénients :

- Légère courbe d’apprentissage ;
- Changement d’outillage par rapport à npm ;
- Compatibilité à vérifier avec certains outils legacy.

## Conséquences : 
Positives
- Réduction significative du temps d’installation des dépendances dans les pipelines CI ;
- Optimisation de l’espace disque grâce au partage des packages ;
- Meilleure cohérence des versions entre les services du monorepo ;
- Meilleure scalabilité du projet à mesure que les services augmentent.
Négatives
- Nécessité de migration des scripts npm existants vers pnpm ;
- Adaptation des pipelines CI/CD pour utiliser pnpm ;
- Prise en main initiale de l’outil pour les développeurs ;
- Dépendance à un outil tiers (non natif Node.js contrairement à npm).