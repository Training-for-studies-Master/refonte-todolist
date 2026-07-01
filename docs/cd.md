# Documentation CD 

## Changes 
1. Détection des changements

## Matrix docker apps / Docker service
1. Build des images sur le registry github 

## Compatibility-check
1. Run check-compatibility.js
2. Run des tests d'integration end-to-end.js du dossier gateway
3. Mise à jour du manifest 
4. Auto-commit 

## Deploy-intégration 
1. Copie SCP 
2. Connexion SSH 
3. Pull des images "latest" 
4. Mise à jour de la bdd

## Deploy-production
1. Copie SCP 
2. Connexion SSH 
3. Pull des images "latest" 
4. Mise à jour de la bdd