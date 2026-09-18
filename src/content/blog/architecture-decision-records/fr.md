---
title: "Pourquoi je demande un ADR avant chaque décision d'architecture"
description: "Un ADR tient sur une page : contexte, décision, conséquences. L'idée de Michael Nygard (2011) n'a pas pris une ride, et c'est un guide gratuit pour l'IA."
pubDate: 2026-09-18
tags: ["architecture", "ai-harnesses"]
sources:
  - title: "Documenting Architecture Decisions"
    author: "Michael Nygard"
    year: 2011
    url: https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
draft: false
---

Un ADR, Architecture Decision Record, c'est une page. Contexte, décision, conséquences. Trois paragraphes, pas plus.

L'idée vient de [Michael Nygard](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions), en 2011. Elle n'a pas pris une ride.

## Ce que ça change dans une équipe

1. On arrête de rediscuter la même décision tous les six mois.
2. Le nouvel arrivant lit dix ADR et comprend pourquoi le code ressemble à ça.
3. Une IA qui lit le dépôt trouve les règles du jeu : c'est un [guide](/fr/blog/ai-harness-guides-and-sensors/) feedforward, gratuit.

## Le piège classique

Écrire l'ADR après coup, pour justifier une décision déjà prise.

Un ADR s'écrit avant, quand on hésite encore. S'il n'y a pas d'alternative sérieuse, il n'y a pas besoin d'ADR.

## Où les ranger

Dans le dépôt, un dossier `docs/adr`, un fichier par décision, numéroté. Pas d'outil, pas de wiki. Le markdown suffit, et il vit avec le code.

Contrairement à une [règle vérifiable par la CI](/fr/blog/architecture-rules-that-break-the-build/), l'ADR reste une intention. Mais une intention écrite, datée, que tout le monde peut retrouver.

Bon designs !
