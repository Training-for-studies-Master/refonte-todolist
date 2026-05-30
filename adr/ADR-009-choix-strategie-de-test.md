# ADR N°9 — Choix des tests d'intégration 
## Titre : Choix des tests d'intégration 
## Status : Accepted 
## Contexte : Dans le cadre de la refonte d'une application Todolist vers une application de gestion de projet type kaban afin de préparer la CI nous avions besoin de couvrir le code par des tests.
## Décision : 
Faire un test d'intégration du gateway à la persitance pour couvrir tout le backend ainsi qu'un test playwright avec API mocké pour couvrir tout le frontend. 

## Conséquences : 
Positive : Tout le code est maintenant couvert en séparant frontend et backend
Négative : Le test de backend n'est pas décomposé ce qui va pénaliser la détection de la compatibilité des différents services pour la CD. 