# Comment lancer le projet 
1. Cloner le repo suivant : https://github.com/Mickaeldev67/refonte-todolist.git
2. Faites "cd refonte-todolist" pour entrer dans le projet. 
3. Faites npm install dans : 
   3.a Le dossier racine
   3.b services/auth
   3.c services/notifications
   3.d services/projects
   3.e services/tasks 
4. Ensuite pour lancer le projet lancer l'application docker puis tapez les commandes suivantes à la racine du projet : docker-compose up --build
   4.a Pour pouvoir consulter les logs liés aux évènements (par exemple réouverture d'une tâche) en temps réel, taper la commande : docker compose logs -f notifications
5. Vous pouvez ensuite lancer les différents tests : 
   5.a. backend workflow : allez dans à la racine du projet et tapez : npm run test. 
   5.b. Tasks : allez dans le dossier **services/tasks** et tapez : npm run test
   ATTENTION ! pour jouer les tests frontend, assurez-vous d'avoir au préalable inscrit un utilisateur avec username "test" et password "test"
   5.b. Frontend : dans le dossier **frontend** ouvrir un terminal et tapez : 
   npx playwright test

Les différents tests : 
1. Création d’un projet
2. Création d’une tâche sur le projet
3. Marquer la tâche comme terminée
4. Vérifier la présence de la notification dans les logs


Arrêter les services :
lancer la commande docker compose down

Rénitialiser totalement l'environnement : 
docker compose down -v


# Refonte – Getting Started Application

Ce projet est une refonte de l'application  :
https://github.com/docker/getting-started

La refonte apporte :

- Séparation du back-end et du front-end
- Migration du backend vers Node.js (upgrade de la version utilisée) + TypeScript
- Migration de SQLite vers MySQL
- Mise en place d’une authentification utilisateur (session + bcrypt)
- Architecture multi-conteneurs via Docker Compose
- Tests end-to-end avec Playwright

---

# 🧱 Architecture

L’application est composée de huit services Docker :

- **frontend** : Interface utilisateur React (port 5173)
- **gateway** : Point d'entrée API (Backend For Frontend) (port 3000)
- **auth** : Gestion des utilisateurs et authentification (port 3001)
- **tasks** : Gestion des tâches (port 3002)
- **projects** : Gestion des projets (port 3003)
- **notifications** : Gestion des notifications via événements
- **mysql** : Base de données MySQL 8 (port 3307)
- **rabbitmq** : Message broker (port 5672 / 15672)

Les données MySQL sont persistées via le volume Docker :
mysql-data

---

# Communication entre services

L'application utilise deux types de communication : 

- Communication synchrone (HTTP)
   Le frontend communique uniquement avec le gateway
   Frontend -> Gateway -> Services métier 

   Le gateway : 
   - gère les sessions
   - route les requêtes
   - injecte l'identité utilisateur
   - évite l'exposition directe des microservices

- Communication asynchrone (RabbitMQ)

Les services communiquent également via RabbitMQ pour les évènements métier. Par exemple : task.created, project.closed ...

Ce qui permet : 
- découplage des services
- autonomie des bounded contexts

---

# Organisation des bases de données

Chaque service possède sa propre base

auth -> auth_db
tasks -> task_db
projects -> project_db
notifications -> notification_db

Même si elles se trouvent dans une seule instance MySQL cela permet : 
- l'isolation des données
- l'indépendance des services
- l'absence d'accès direct entre domaines

Les services échangent les informations via RabbitMQ ainsi que des projections locales.


---

# ⚙️ Prérequis

- Docker
- Docker Compose

Node.js est requis uniquement si exécution hors Docker.

---

# 🔄 Version Node (hors Docker uniquement)

Si vous lancez le projet localement sans Docker :


nvm install --lts

nvm use 24.13.1

---

# 🚀 Accès aux services frontend 

   Frontend : http://localhost:5173

---

# 📦 Gestion des dépendances

Les dépendances sont séparées entre :

dependencies : nécessaires à l’exécution

devDependencies : outils de développement, build et tests

Tout était fait automatiquement 


# 📚 Architecture Decision Records (ADR)

Les décisions d’architecture sont documentées dans le dossier `/adr`.

- ADR-001 : Choix du SGBD
- ADR-002 : Choix du mécanisme de hachage
- ADR-003 : Choix du mécanisme d’authentification
- ADR-004 : Choix de l’outil de tests E2E
- ADR-005 : Choix de du message broker
- ADR-006 : Choix du nombre de base de données
- ADR-007 : Choix du langage backend
- ADR-008 : Choix de réimplémenter Sqlite 

# 🚀 Migration de la database 
Dans un fichier .env placé dans le service auth, mettez ces variables avec leurs valeurs : 
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DB=
RUN_MIGRATION="false"
Puis lancez "docker compose up" 
Pour la production il faudra lancer : 
   docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up