---
title: "Le TJM à l’expérience ne mesure plus rien"
description: "La grille de TJM reposait sur les années d’expérience parce que le clavier bornait l’écart entre bons et mauvais développeurs. Avec l’IA, ce goulot saute."
pubDate: 2026-09-09
tags: ["ai-era", "fractional"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7503531080134742017/
draft: false
---

Je pense que le modèle du TJM va fortement changer dans les années à venir.

## La grille d’hier

Jusqu’ici, en schématisant, ça donnait :

- ~200 à 300 : junior
- ~400 à 500 : intermédiaire
- ~600 à 800 : senior
- ~800+ : expert sur un sujet précis

Le problème ? Sauf exception, la grille se basait sur les années d’expérience, à la louche.

Et à chaque niveau, vous aviez un mix de mauvais et de bons développeurs.

Le mauvais était néfaste pour le projet : mauvais choix, dette technique à chaque commit. Le bon aidait grandement : moins de dette, bonnes pratiques, formation des autres.

## Pourquoi ça marchait quand même

Tant que le goulot d’étranglement était la vitesse d’écriture au clavier, le mauvais ne pouvait pas faire _trop_ de dégâts en une journée. Et le bon ne pouvait pas en réparer beaucoup plus.

L’écart existait, mais il était borné par le clavier. Donc payer à l’expérience restait une approximation acceptable.

## Avec l’IA, le goulot saute

Le mauvais prompte, copie-colle, et crée des problèmes vitesse grand V.

Le bon fait autre chose : il construit un [harnais](/fr/blog/ai-harness-guides-and-sensors/). [Des tests qui bloquent](/fr/blog/mutation-testing-in-the-age-of-ai-generated-tests/), une CI qui refuse, une architecture où l’agent ne _peut pas_ faire n’importe quoi.

Et là, l’IA ne va plus juste vite : elle va vite dans la bonne direction, potentiellement même toute seule, quand le bon développeur n’est plus devant l’écran.

Un excellent développeur avec un excellent harnais, c’est une vitesse que je n’avais jamais vue en douze ans de métier.

## Ce qui reste à mesurer

Le TJM à l’expérience marchait parce que l’écart était petit. L’IA rend l’écart énorme. Le TJM à l’expérience ne mesure donc plus rien.

Ce qui reste à mesurer, c’est le seul truc qui n’a pas bougé : est-ce que cette personne a déjà livré, et est-ce que ça a tenu ?

Je vois donc arriver un TJM basé sur les succès vérifiables et les recommandations.

Et le calcul devient simple :

- Un mauvais à 500, vous payez 500 plus la dette qu’il génère. Et cette dette, quelqu’un d’autre la paiera, plus cher.
- Un excellent à 1000 et plus, vous payez 1000 et vous récupérez tout le reste.

Le 1000 sera beaucoup plus rentable que le 500.

C’est le raisonnement qui sous-tend le modèle du [développeur senior à temps partiel](/fr/blog/the-part-time-senior-developer/).

PS : ça veut dire que le vrai risque n’est plus de payer trop cher. C’est de payer pas cher.
