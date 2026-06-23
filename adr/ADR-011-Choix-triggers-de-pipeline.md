# ADR N°11 — Choix de triggers de pipepline
## Titre : Choix de triggers de pipepline
## Status : Accepted 
## Contexte : L'application Kanban du projet est développée par plusieurs contributeurs dans le cadre d'une démarche d'intégration continue. Afin de garantir la qualité du code tout en limitant le coût d'exécution des pipelines, il est nécessaire de définir une stratégie de branches ainsi que les événements déclenchant les différents traitements d'intégration continue. Les pipelines mis en place réalisent des opérations potentiellement coûteuses, telles que la compilation des services, l'exécution des tests, les analyses de qualité et de sécurité, ainsi que la génération d'images Docker. L'exécution systématique de l'ensemble de ces traitements sur chaque commit pourrait augmenter inutilement les temps de validation et la consommation de ressources.

## Décision : 
Adopter une stratégie Git basée sur trois niveaux :
Les branches : 
feature/* : développement des fonctionnalités
develop : environnement de recette et d'intégration
main : environnement de production

Les intégrations depuis une branche feature/* vers develop sont réalisées via Pull Request avec une validation et merge automatique dans le cas ou tous les tests passent.
La branche main ne reçoit que du code préalablement validé sur develop.
L'analyse serait enclenché de develop à main

## Conséquences : 
Positive : 
- Séparation claire entre développement, recette et production
- Détection précoce des problèmes lors des Pull Requests
- Limitation de l'exécution des pipelines lourds aux étapes importantes
Négative : 
- Gestion supplémentaire des branches