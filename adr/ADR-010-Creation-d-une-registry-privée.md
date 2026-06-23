# ADR N°10 — Création d'une registry privée
## Titre : Choix pour création d'une registry privée
## Status : Accepted 
## Contexte : Dans le cadre du projet d'intégration continue, chaque modification du code source déclenche la reconstruction et l'analyse des services impactés. Les pipelines CI produisent des images Docker versionnées correspondant aux différents composants de l'application (frontend, backend et services associés). Afin de permettre leur stockage, leur partage entre les différents environnements et leur réutilisation lors des phases de déploiement, un mécanisme centralisé de distribution des images est nécessaire. Ce mécanisme doit également garantir la confidentialité des artefacts produits, assurer la traçabilité des versions publiées et s'intégrer au processus automatisé mis en place dans GitHub Actions. Une décision doit donc être prise concernant la mise en place d'une registry privée destinée à héberger les images Docker générées par les pipelines CI.

## Alternative :
GitHub Container Registry (GHCR)
Docker Hub

## Décision : 
Utiliser GitHub Container Registry (GHCR) comme registry privée pour le stockage et la distribution des images Docker du projet puisque notre projet est déjà hebergé sur GitHub.

## Conséquences : 
Positive : 
- Intégration native avec GitHub Actions
- Authentification via GitHub
- Conservation de l'historique des versions
- Hébergement des images au même endroit que le code source
Négative : 
- Dépendance à l'écosystème GitHub
- Migration nécessaire si changement de plateforme
- Quotas éventuels selon l'offre utilisée