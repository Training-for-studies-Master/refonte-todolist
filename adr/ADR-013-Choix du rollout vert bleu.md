# ADR N°13 — Choix du rollout vert bleu
## Titre : Choix de la méthode de déploiment vert bleu
## Status : Accepted 
## Contexte : Dans le cadre de la mise en place de la chaîne de déploiement continu (CD), nous devons définir une stratégie de déploiement pour la mise en production de notre architecture microservices (Gateway, Auth, Tasks, etc.). Les exigences clés pour notre processus de déploiement sont : Zéro coupure de service (Zero-downtime) : Les utilisateurs ne doivent pas subir d'interruption pendant les mises à jour. Capacité de Rollback instantané : En cas de détection d'un bug critique ou d'un échec de healthcheck après déploiement, le retour à la version précédente doit être immédiat Validation post-déploiement : Possibilité de tester la nouvelle version en production avant d'y aiguiller le trafic utilisateur.

## Décision : 
Dans le cadre de la gestion du monorepo du projet Kanban, il a été décidé d’adopter le déploiement vert bleu.

## Alternative :
Option 1 : Déploiement Progressif (Canary Deployment)

Avantages : Risque minimal (le trafic est envoyé par petits pourcentages).

Inconvénients : Hors Kubernetes, sa mise en œuvre technique sur un reverse-proxy (comme Nginx ou Traefik) nécessite une logique de routage fine et dynamique (gestion des poids) complexe à scripter manuellement et difficile à corréler avec un monitoring automatisé.

Option 2 : Déploiement Bleu/Vert (Blue/Green Deployment)

Avantages : Zéro coupure, isolation complète de la nouvelle version avant bascule, rollback instantané par reconfiguration du reverse-proxy. Tout à fait gérable à l'aide de Docker Compose et d'un script Node.js.

Inconvénients : Nécessite temporairement le double de ressources (CPU/RAM) sur le serveur pendant la phase de transition où les deux environnements coexistent.

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
Conséquences Positives :
- Zéro Downtime : La bascule Nginx s'effectue en quelques millisecondes.
- Sécurité accrue : Si le nouveau code crash au démarrage, la production n'est jamais impactée.
- Simplicité : La logique est entièrement maîtrisée au sein de notre code applicatif (Node.js), sans dépendance à des outils tiers complexes.

Conséquences Négatives / Points de vigilance :
- Ressources serveur : Le serveur de production doit être dimensionné pour supporter la charge des conteneurs Bleus et Verts simultanément pendant les quelques minutes du déploiement.
- Rétrocompatibilité de la base de données : Les migrations de base de données (exécutées juste avant la bascule applicative) doivent être obligatoirement non-breaking (rétrocompatibles), car l'ancienne version de l'application tournera encore sur la base de données modifiée pendant la phase de validation de la nouvelle version.