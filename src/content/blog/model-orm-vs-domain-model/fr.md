---
title: "Un « Model », c'est quoi ? Deux choses qui n'ont rien à voir"
description: "« Model » désigne le Model d’un ORM comme le domain model du DDD. Les confondre fait croire qu’on a modélisé son métier alors qu’on a décrit ses tables."
pubDate: 2026-09-12
tags: ["architecture"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7504605709494407168/
sources:
  - title: "Domain-Driven Design"
    author: "Eric Evans"
    year: 2003
draft: false
---

En software engineering / architecture logicielle, c'est quoi un « Model » (modèle en français) ?

Couramment, ça désigne deux choses qui n'ont **rien** à voir. Et le savoir évite bien des confusions.

## 1. Le Model au sens ORM

Prisma, Sequelize, Mongoose et compagnie.

Ici le Model, c'est la définition de l'objet persisté en base : le Model `User`, le Model `Invoice`, etc.

Il dit à l'ORM à quoi ressemble la table. Ça permet de créer des instances et de les persister, ou de reconstituer une ligne de base de données en objet manipulable en mémoire.

Pure technique.

## 2. Le Model au sens design de programme

Par exemple dans le « domain model » d'Eric Evans, en DDD.

Ici, rien à voir avec la technique : le Model est le résultat de l'exercice de modélisation du métier. Ses concepts, ses règles, ses invariants.

Il peut bien sûr être implémenté dans le code ensuite, mais il vit bien en amont : sur un schéma, sur un tableau blanc, dans des discussions orales avec le métier.

## Le piège classique

Un seul mot, en anglais comme en français, pour deux choses qui n'ont rien à voir.

Et le piège classique, c'est de croire que parce qu'on a écrit ses Models Prisma, on a modélisé son métier. Non. On a décrit ses tables.

L'avoir bien en tête évite pas mal d'erreurs.
