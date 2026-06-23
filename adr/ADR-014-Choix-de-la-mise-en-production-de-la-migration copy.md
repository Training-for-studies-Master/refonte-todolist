# ADR N°14 — Choix de la mise en production de la migration
## Titre : Choix de la mise en production de la migration
## Status : Accepted 
## Contexte : Dans une architecture microservices avec un déploiement continu et une stratégie Bleu/Vert, la mise à jour de la base de données (le schéma SQL) est une étape critique. Auparavant, la tentation était d'exécuter les migrations directement au démarrage de l'application (par exemple, dans le CMD du Dockerfile de l'API auth). Cependant, cette approche pose plusieurs problèmes majeurs en production : Concurrence et Conflits : Si nous démarrons plusieurs instances (replicas) du service auth en même temps, elles vont tenter d'exécuter les mêmes migrations simultanément, provoquant des verrous (locks) ou des crashs de BDD. Timing dans le Bleu/Vert : Les migrations doivent impérativement être terminées et réussies avant que la nouvelle couleur applicative (la couleur cible) ne commence à démarrer et à s'y connecter. Observabilité : Si une migration échoue, il est difficile de séparer le log de l'échec de la migration du log de démarrage de l'application. Nous avons besoin d'une méthode pour isoler l'exécution des migrations dans le pipeline de production.

## Décision : 
Nous choisissons l'Option 3 : Un conteneur éphémère dédié (auth-migrations) dans docker-compose.prod.yml.

## Alternative :
Option 1 : Exécution au démarrage du conteneur applicatif (auth)

Avantages : Rien à configurer dans le pipeline de déploiement, le conteneur migre puis démarre.

Inconvénients : Risque de conflits si multi-instances, impossibilité d'isoler l'étape dans la CI/CD, et l'application risque de crash en boucle en prod si la BDD est temporairement inaccessible.

Option 2 : Un conteneur éphémère dédié aux migrations (auth-migrations)

Avantages : Utilise la même image Docker de production que l'application (garantie des mêmes dépendances et scripts), s'exécute de manière unique, se détruit après exécution (--rm), et son code de sortie (0 ou 1) est directement exploitable par notre pipeline de CD.

Inconvénients : Nécessite une entrée supplémentaire à maintenir dans le fichier docker-compose.prod.yml.

## Conséquences : 
Conséquences Positives :
- Séquençage parfait : Les migrations s'exécutent au moment exact choisi par la CI/CD (après le build, mais avant le déploiement applicatif Bleu/Vert).
- Sécurité des données : Pas de risque d'exécutions concurrentes. Si le conteneur auth-migrations échoue, le script de déploiement s'arrête net, empêchant le déploiement d'un code instable.
- Propreté de l'infrastructure : Le serveur de production reste "propre" (aucune dépendance Node.js/pnpm installée sur l'hôte, tout passe par Docker).

Conséquences Négatives / Points de vigilance :
- Images Docker volumineuses : L'image utilisée pour les migrations doit contenir les outils de migration (comme Prisma, Knex ou TypeORM), ce qui est déjà le cas puisqu'elle partage celle de l'application.
- Maintenance : Il faut s'assurer que les variables d'environnement de connexion à la base de données de production soient correctement transmises à ce conteneur éphémère lors du docker compose run.