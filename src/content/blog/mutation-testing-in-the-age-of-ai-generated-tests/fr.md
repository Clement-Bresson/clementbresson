---
title: 'Vos tests sont verts, mais ça ne prouve rien : le mutation testing'
description: 'Le coverage mesure les lignes traversées, pas celles vérifiées. Le mutation testing mesure si vos tests détectent, vital quand des agents écrivent les tests.'
pubDate: 2026-09-05
tags: ['testing', 'ai-harnesses']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7502090523608973312/
sources:
  - title: 'Stryker Mutator'
    url: https://stryker-mutator.io/
  - title: 'PIT Mutation Testing'
    url: https://pitest.org/
  - title: 'mutmut'
    url: https://github.com/boxed/mutmut
draft: false
---

Vos tests sont verts. Mais ça ne prouve rien.

Le coverage mesure les lignes que vos tests **traversent**. Pas celles qu'ils vérifient.

La nuance est énorme, et pourtant on pilote la qualité avec cette métrique depuis 15 ans.

Concrètement : un test sans assertion passe dans le code, coche son coverage, et ne détecterait aucun bug. Jamais.

## Le principe du mutation testing

Le mutation testing part exactement de là.

On introduit volontairement des bugs dans votre code. On remplace un `>` par un `>=`, on inverse un booléen, on supprime un appel. Puis on relance la suite de tests.

- Si les tests passent au rouge, le mutant est tué : tout va bien.
- Si les tests restent verts, le mutant a survécu : votre test ne teste rien.

À la fin vous avez un score qui mesure la capacité de vos tests à **détecter**. Plus seulement la capacité de votre code à être traversé.

## Pourquoi si peu de monde l'utilise ?

Parce que c'est lent (chaque mutant est une exécution complète de la suite).

Parce que c'est bruyant au début (mutants équivalents, faux positifs).

Et surtout parce qu'on avait un filet : on écrivait les tests à la main, donc on savait à peu près ce qu'ils vérifiaient.

Le ROI paraissait faible. Moi le premier, je l'ai regardé de loin pendant des années.

## Le filet vient de disparaître

Aujourd'hui on génère le code **et** les tests avec des agents. Vite. Beaucoup. Et un LLM optimise pour ce qu'on mesure : du vert et du coverage.

Résultat : des tests qui décrivent l'implémentation au lieu de décrire le comportement attendu.

Ils passent toujours. Même quand le code est faux.

Donc vous vous retrouvez à relire des tests que vous n'avez pas écrits, qui protègent du code que vous n'avez pas écrit.

C'est précisément le trou que le mutation testing bouche : c'est un contrôle automatique du contrôle.

Et du coup l'argument de la lenteur tombe aussi. Vous ne le lancez pas en local à chaque sauvegarde, vous le lancez en CI, sur le diff uniquement. C'est la machine qui attend, plus vous.

## Pour essayer

- [Stryker](https://stryker-mutator.io/) pour JS/TS
- [PIT](https://pitest.org/) pour Java
- mutmut pour Python

Et commencez par votre domaine critique uniquement. Pas toute la codebase, sinon vous ne le ferez jamais.

Personnellement, je l'inclus dans le [harnais](/fr/blog/ai-harness-guides-and-sensors/) de mes clients.

Un test qui ne peut pas échouer n'est pas un test. C'est un commentaire qui coûte du CPU.

C'est une contrainte de plus qui casse le build, au même titre que les [règles d'architecture vérifiables par une machine](/fr/blog/architecture-rules-that-break-the-build/).

PS : si votre premier score de mutation vous déprime, c'est normal.
