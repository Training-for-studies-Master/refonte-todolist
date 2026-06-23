# ADR N°16 - Choix suppression de la migration pour rollback
## Titre : Choix suppression de la migration pour rollback
## Status : Accepted 
## Contexte : Lors de l'évolution de notre schéma de base de données (ajout de la colonne birth_date dans la table users), nous devons anticiper le scénario où le déploiement de la nouvelle version applicative (couleur Verte) échoue après l'exécution des migrations, déclenchant un rollback. Bien que la base de données ait été modifiée avec succès par le conteneur auth-migrations, si l'application crash lors de son healthcheck, le pipeline de CD va annuler la bascule et conserver l'ancienne version applicative (couleur Bleu). Se pose alors la question de l'état de la base de données : faut-il annuler la migration et supprimer la colonne birth_date (DROP COLUMN), ou faut-il la laisser en place en attendant un correctif ?

## Décision : 
Nous choisissons l'Option 2 : Exécuter une migration inverse destructive (DROP COLUMN) en cas de rollback.
Puisque le champ birth_date n'est pas indispensable au fonctionnement de l'application et sert uniquement d'information secondaire, nous privilégions la propreté et la stabilité du système plutôt que la persistance d'un schéma non exploité.

## Alternative :
Option 1 : Conserver la colonne en base de données malgré le rollback

Avantages : Si des utilisateurs ont eu le temps d'écrire dedans (non applicable ici car le rollback intervient avant la bascule du trafic), la donnée est préservée. Aucun script de "down" à exécuter.

Inconvénients : Désalignement entre le schéma réel de la BDD de production et la version du code applicatif qui tourne (le code Bleu ne connaît pas cette colonne). Risque de pollution du schéma.

Option 2 : Exécuter une migration inverse destructive (DROP COLUMN birth_date)

Avantages : Retour à un état strictement propre, parité parfaite entre le schéma de la base de données et le code applicatif en production (couleur Bleu).

Inconvénients : Perte définitive des données de cette colonne. (Risque jugé nul ici car la bascule de trafic n'a pas encore eu lieu).

## Conséquences : 
Conséquences Positives :
- Zéro résidu en production : Aucun risque de dérive de schéma (schema drift) en production. La base de données reste saine et synchrone avec l'application active.
- Simplicité de reprise : Pour retenter le déploiement après correction du bug, il suffira de relancer la CI normalement. La table sera propre et prête à recevoir à nouveau le ALTER TABLE ... ADD COLUMN.

Conséquences Négatives / Points de vigilance :
- Exception de cette règle : Cette stratégie destructive n'est acceptable que parce que le champ n'est pas critique et que la bascule de trafic n'a pas encore eu lieu. Pour de futurs champs critiques, cette stratégie sera interdite et fera l'objet d'un autre ADR (stratégie de migration non destructive).