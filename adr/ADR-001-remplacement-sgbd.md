# ADR N°1 — Remplacement du système de gestion de base de données

**Statut :** Annulé 

---

## Contexte

L’application d’origine (`getting-started-app`) utilise SQLite comme base de données embarquée. SQLite stocke les données dans un fichier local au conteneur.

Dans le cadre de la refonte, l’application est déployée via Docker Compose avec trois services distincts : un backend en Node.js / TypeScript, un frontend en TypeScript et un service MySQL 8 avec volume persistant `mysql-data`. La base MySQL est persistée via un volume Docker dédié.

Le choix du système de gestion de base de données doit donc être cohérent avec une architecture multi-conteneurs, assurer une séparation claire entre application et données, permettre un plan de mise en production réaliste et garantir une persistance indépendante du cycle de vie du backend.

---

## Options

Différentes options de systèmes de gestion de base de données sont disponibles : MySQL et NoSQL.

### Option 1 : MySQL

MySQL est une base de données relationnelle exécutée comme service indépendant dans Docker. Cette option a été considérée car le fichier `docker-compose.yml` contient déjà un service MySQL, l’application manipule des données relationnelles simples (utilisateurs associés à des tâches) et l’authentification implique une structuration cohérente des données.

Les avantages sont une séparation claire entre backend et base de données, une persistance assurée via un volume dédié, la possibilité de redéployer le backend sans impacter les données, une cohérence avec une architecture conteneurisée standard ainsi qu’une facilité d’intégration dans un futur environnement cloud ou VPS.

Les inconvénients résident dans la nécessité de maintenir un service supplémentaire ainsi qu’une configuration plus complexe (variables d’environnement, gestion de la santé du service, etc.).

### Option 2 : NoSQL

NoSQL correspond à une base non relationnelle (document, clé-valeur, etc.). Cette option a été considérée pour la possibilité d’une plus grande flexibilité de schéma et une scalabilité horizontale potentielle.

Cependant, cette option a fait hésiter car les données du projet sont simples et relationnelles (un utilisateur associé à une liste de tâches), aucun besoin de schéma flexible n’a été identifié et aucune forte scalabilité n’est requise à ce stade.

Dans le cadre du projet, les inconvénients seraient une refactorisation importante de la couche de persistance, une complexité non justifiée par l’échelle du projet et une rupture avec la structure déjà prévue dans le Docker Compose.

---

## Décision

Le choix s’est porté sur MySQL. MySQL s’aligne naturellement avec l’architecture Docker déjà mise en place (service dédié et volume persistant). L’objectif étant d’avoir une séparation claire entre application et données, MySQL permet de redéployer le backend sans perte de données, de découpler la persistance du cycle de vie du conteneur applicatif et de préparer un déploiement production réaliste. Le recours à une base NoSQL ajouterait une complexité inutile au regard de la simplicité du modèle métier.

---

## Conséquences

Les bénéfices attendus sont une séparation nette entre backend et base de données, une persistance robuste via le volume `mysql-data`, une mise en production facilitée et une architecture cohérente avec Docker Compose.

Les inconvénients incluent la nécessité d’administrer un service supplémentaire ainsi que de prévoir des sauvegardes et des migrations.

Les impacts futurs sont la possibilité de faire évoluer le backend (ajout de fonctionnalités, montée en charge) sans refonte de la persistance, la facilitation d’un futur déploiement vers un service MySQL managé dans le cloud, mais également l’introduction d’une dépendance forte à une base relationnelle, un changement de modèle de données impliquant alors une migration.
