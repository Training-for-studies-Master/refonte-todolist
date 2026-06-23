# ADR N°15 — Choix manuel de l'upgrade du package JSON
## Titre : Choix de la mise en production de la migration
## Status : Accepted 
## Contexte : Dans une architecture microservices automatisée par une chaîne de CI/CD (incluant des tests d'intégration et une bascule Bleu/Vert), la stabilité des dépendances tierces (Node modules) est un enjeu critique.Il existe aujourd'hui des outils d'automatisation (tels que Dependabot ou Renovate Bot) qui analysent en continu les dépendances et ouvrent automatiquement des Pull Requests dès qu'une nouvelle version d'un package est disponible. Bien que séduisante, cette automatisation pose des risques dans notre contexte :Effet de bord sur les microservices : Une mise à jour mineure d'une dépendance partagée ou critique peut introduire des régressions subtiles, non détectées par les tests unitaires, mais destructrices en production. Bruit dans la CI/CD : L'ouverture incessante de Pull Requests automatisées surcharge la file d'attente de la CI et le temps d'attention de l'équipe pour les revues de code. Changements cassants dissimulés : Même en respectant le versionnage sémantique (SemVer), certains éditeurs introduisent des breaking changes non documentés dans des versions mineures ou des patchs. Nous devons définir notre stratégie quant au contrôle et au rythme de mise à jour de nos dépendances.

## Décision : 
Nous choisissons l'Option 3 : Processus d'upgrade manuel pour les fichiers package.json.

## Alternative :
Option 1 : Automatisation complète (Mises à jour automatiques via Bot)

Avantages : Dette technique théoriquement proche de zéro, les packages sont toujours à jour sans effort initial.

Inconvénients : Risque élevé de régressions en cascade, surcharge de la CI, perte de contrôle sur le contenu exact qui part en production.

Option 2 : Gel strict des versions (No-upgrade)

Avantages : Stabilité maximale à court terme, aucun comportement imprévu.

Inconvénients : Accumulation rapide d'une dette technique et exposition à des failles de sécurité critiques (détectées plus tard par nos scans Trivy).

Option 3 : Processus d'upgrade manuel et délibéré

Avantages : Contrôle total du cycle de vie des dépendances, analyse humaine des changelogs avant modification, réduction du bruit sur le dépôt.

Inconvénients : Demande une discipline d'équipe pour planifier régulièrement des sessions de maintenance de la dette technique.

## Conséquences : 
Conséquences Positives :
- Fiabilité et Stabilité : L'équipe sait exactement quels changements internes et externes entrent dans l'application à chaque commit sur main.
- Sérénité de la CI/CD : Élimination des Pull Requests "bruit de fond" générées par des robots pour des micro-correctifs non essentiels.
- Alignement avec le Bleu/Vert : Garantit que la bascule de production ne sera pas compromise par une mise à jour tierce invisible.

Conséquences Négatives / Points de vigilance :
- Discipline requise : Le danger principal est le vieillissement des dépendances. L'équipe doit sanctuariser un rituel régulier (par exemple, à chaque début de sprint ou une fois par mois) pour analyser les dépendances obsolètes et planifier leur mise à jour.
- Gestion des urgences : En cas de faille de sécurité majeure (0-day), l'équipe doit être capable de réagir manuellement très vite pour modifier le package.json concerné.