---
title: "Un framework opinionated, c'est un harnais pour l'IA"
description: "AdonisJS est réputé très opinionated. Discussion avec Jonathan Serra (AI2H) sur pourquoi cette rigidité donne un harnais de plus à l'IA."
pubDate: 2026-09-18
tags: ["ai-harnesses", "architecture"]
sources:
  - title: "AI2H"
    author: "Jonathan Serra"
    url: https://ai2h.tech/
  - title: "AdonisJS"
    url: https://adonisjs.com/
  - title: "Harness engineering for coding agent users"
    author: "Birgitta Böckeler"
    year: 2026
    url: https://martinfowler.com/articles/harness-engineering.html
draft: false
---

Aujourd'hui, on discutait avec Jonathan Serra, fondateur d'[AI2H](https://ai2h.tech/), du changement en cours dans le rôle du développeur.

Parmi les sujets passionnants abordés :

- l'apparition d'un nouveau besoin chez les PME, le [développeur fractionnel](/fr/blog/the-developer-market-is-shifting/)
- le harness engineering
- le nouveau rôle du développeur comme guide et créateur d'outils, pour que les clients puissent être en relative autonomie sur leur développement
- la facilité (toute relative) à faire 20 000 par mois avec un seul prompt — désolé, ça, ce n'est pas vrai, on laisse ça aux vendeurs de vent

## AdonisJS, ou la rigidité qui paie

De fil en aiguille, on en est venus à parler d'[AdonisJS](https://adonisjs.com/), un framework que je n'ai encore jamais eu l'occasion de tester.

AdonisJS, en gros, c'est un framework MVC pour Node très **opinionated** : peu de place laissée au choix, beaucoup de conventions imposées.

Jonathan me disait que c'est justement parce qu'il est ultra opinionated qu'il permet d'obtenir d'excellents résultats via un LLM.

Bien sûr, plus un framework est opinionated, plus il est rigide. Mais la rigidité, quand on laisse une IA travailler en relative autonomie, a du bon : documentation fournie, façons de faire strictes... tout ça donne un [harnais](/fr/blog/ai-harness-guides-and-sensors/) supplémentaire à l'IA.

## Ce que j'observe depuis un an

Ça fait écho à un constat que je fais depuis l'année dernière : plus une [codebase est standardisée et stricte](/fr/blog/architecture-rules-that-break-the-build/), moins l'IA part dans tous les sens.

C'est un des meilleurs guides feedforward (voir [la matrice de Böckeler](https://martinfowler.com/articles/harness-engineering.html)) qu'on puisse offrir à un bon harnais.

## Une question pour vous

D'où ma question, pour ceux qui se passionnent comme Jonathan et moi pour le sujet :

Avez-vous remarqué des frameworks avec lesquels les LLM semblent particulièrement efficaces ?

Et, à l'inverse, des frameworks avec lesquels les résultats sont plus erratiques ?

Ayant travaillé beaucoup sur du custom cette année, je n'en ai pas à proposer moi-même. Mais trouvons les potentiels AdonisJS cachés :)
