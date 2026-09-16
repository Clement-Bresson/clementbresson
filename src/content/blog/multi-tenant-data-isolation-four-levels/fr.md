---
title: "Multi-tenant : les quatre niveaux de séparation des données"
description: "Un SaaS qui gère des données sensibles doit séparer celles de chaque client. Quatre niveaux, du tenant_id à l’infra dédiée, et celui que je choisis souvent."
pubDate: 2026-09-16
tags: ['architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7506068368706215937/
draft: false
---

Vous montez un SaaS qui gère de la data sensible pour des entreprises ? Il y a une question d'architecture logicielle qui va arriver très vite : comment séparer les données de chaque client ?

Parce que le jour où l'entreprise A voit les factures de l'entreprise B… c'est fini (ou très, très pénible).

Il y a quatre niveaux de séparation.

## Niveau 1 : une base partagée, une étiquette par ligne

Tout le monde dans la même base, avec une étiquette « à qui ça appartient » sur chaque ligne (une colonne `tenant_id`, par exemple).

- **Pour** : pas cher, facile.
- **Contre** : un filtre oublié peut coûter cher. Et si un gros client fait tourner des trucs lourds et que c'est mal géré, tout le monde rame, car les ressources sont partagées (on vous voit, les énormes workers d'ingestion de données).

## Niveau 2 : une base partagée, un espace par client

Toujours une base de données partagée, mais chaque boîte a son espace séparé (un schéma Postgres par client, par exemple).

- **Pour** : plus propre. On peut sortir ou sauvegarder les données d'un client en une commande.
- **Contre** : chaque changement de structure doit être répété sur tous les espaces (migrations × N clients). Et toujours des ressources partagées.

## Niveau 3 : une base par client

- **Pour** : séparation maximale au niveau des bases de données, qui sont physiquement séparées.
- **Contre** : beaucoup plus lourd à gérer (créations/suppressions), à monitorer et à maintenir (gestion des bases idle…).

## Niveau 4 : une installation complète par client

Là, on ne parle plus seulement de la base de données, mais de 100 % de l'infra : une API par client, des workers par client, etc.

- **Pour** : aucune fuite possible d'un client à l'autre. Ressources 100 % séparées, qui peuvent scaler indépendamment.
- **Contre** : il faut passer à la caisse et avoir des DevOps à temps plein en interne.

## Les services qui gèrent le niveau 3 pour vous

Il y a les services qui promettent de gérer le niveau 3 pour vous : Neon, Nile, Supabase… Une nouvelle base créée en une seconde par API, qui ne coûte rien quand elle dort, etc.

Ça marche très bien, mais vos données sont chez eux : des boîtes américaines. Donc même si le serveur est en Europe… les USA peuvent demander les data.

Ces solutions peuvent donc être une option… sauf si vous manipulez des données sensibles (ou que vous vous en fichez totalement… mais bon, ça va bien deux minutes).

## Ce que je fais souvent personnellement

Niveau 2, avec des [gardes-fous dans le code](/fr/blog/architecture-rules-that-break-the-build/) pour qu'un oubli soit impossible ou sans aucune incidence (tenant omis ⇒ zéro donnée retournée).

Et fait de façon à ce que sortir un client dans sa propre base si le besoin se présente (un dump de toutes les tables du tenant) soit facile.
