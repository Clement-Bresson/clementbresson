---
title: 'Harnais IA : guides et capteurs, les quatre cases à remplir'
description: 'Un harnais, c’est tout ce qui, dans un agent, n’est pas le modèle. Deux axes, quatre cases, et une conclusion qui fait mal sur la harnessability d’une codebase.'
pubDate: 2026-09-07
tags: ['ai-harnesses']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7502834032964030465/
sources:
  - title: 'Article on AI agent harnesses (martinfowler.com)'
    author: 'Birgitta Böckeler'
    year: 2026
  - title: 'dependency-cruiser'
    author: 'Sander Verweij'
    url: https://github.com/sverweij/dependency-cruiser
draft: false
---

Un harnais, c’est tout ce qui, dans un agent, n’est pas le modèle.

Birgitta Böckeler (martinfowler.com, avril 2026) le structure sur deux axes.

## Axe 1 : le moment

- Les **guides** agissent avant : ils augmentent la probabilité que le premier jet soit bon.
- Les **capteurs** (sensors) agissent après : ils permettent à l’agent de se corriger.

Sans capteurs, l’agent répète la même erreur. Sans guides, il ne sait pas quelles règles appliquer.

## Axe 2 : le mode

- **Computationnel** : tsc, ESLint, [dependency-cruiser](/fr/blog/dependency-cruiser-as-a-sensor-for-ai-agents/). Déterministe, quelques secondes.
- **Inférentiel** : skill de revue, juge LLM. Sémantique, cher, non déterministe.

## Quatre cases

Croisez les deux axes : cela donne quatre cases.

Votre AGENTS.md n’en occupe qu’une : les guides inférentiels. La moins déterministe, mais souvent la seule remplie.

Une règle dependency-cruiser branchée en hook remplit une autre case : l’agent apprend qu’il a violé une frontière avant que vous ouvriez la PR.

Règle de placement : plus un contrôle est rapide, plus il doit être à gauche. Hook, pre-commit, CI, relecture humaine.

## La harnessability d’une codebase

Mais tous ces contrôles ne sont pas disponibles partout. Un typage strict donne un capteur. Des [frontières de modules nettes](/fr/blog/architecture-rules-that-break-the-build/) rendent une règle structurelle possible. Sans ces propriétés, le contrôle n’existe pas.

Böckeler appelle ça la harnessability d’une codebase, et elle en tire la conclusion qui fait mal : le harnais est le plus nécessaire là où il est le plus difficile à construire.
