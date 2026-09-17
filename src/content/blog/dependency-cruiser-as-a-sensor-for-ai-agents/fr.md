---
title: "dependency-cruiser : un capteur computationnel pour vos agents IA"
description: "dependency-cruiser cartographie les imports et fait échouer la CI quand une frontière est violée. Un capteur pour l’IA, qui exige une architecture claire."
pubDate: 2026-09-08
tags: ["ai-harnesses", "architecture"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7503173496605351936/
sources:
  - title: "dependency-cruiser"
    author: "Sander Verweij"
    url: https://github.com/sverweij/dependency-cruiser
draft: false
---

Vous connaissez [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) ?

C’est un outil qui lit votre codebase et cartographie qui importe quoi.

Vous écrivez des règles : « [le domaine n’importe jamais l’infra](/fr/blog/what-is-clean-architecture/) », « pas de cycle », « l’UI ne touche pas la DB ».

Il tourne dans la CI et il prévient dès qu’une ligne d’import viole une règle.

## Un capteur computationnel pour l’IA

Beaucoup de gens le voient comme un outil d’archi, mais je le vois comme un **capteur computationnel** (computational sensor) pour l’IA.

Parce que votre agent (Claude Code, Cursor, peu importe) va faire des raccourcis. Toujours. Un import direct vers la DB depuis un composant, « ça marche ».

Avec dependency-cruiser dans le [harnais](/fr/blog/ai-harness-guides-and-sensors/), le raccourci pète en CI et l’agent est obligé de refaire proprement. Sans que vous ayez à relire 40 fichiers.

## Le twist

Ça ne marche que si vous avez [une architecture claire à décrire](/fr/blog/architecture-rules-that-break-the-build/). Des frontières nettes, des règles strictes.

Sur une codebase où tout importe tout, il n’y a rien à vérifier. Le capteur ne voit rien. Il n’y a pas de règle possible.

Et c’est là que ça devient vicieux : plus la codebase est chaotique, moins l’IA a de garde-fous, plus elle ajoute du chaos.

L’IA devient de moins en moins bonne sur _votre_ projet. Pas parce que le modèle baisse. Parce que le terrain se dégrade.

Donc avant d’empiler des agents sur une app générée en 3 semaines, faites regarder la structure par quelqu’un du métier. C’est là que se joue si l’IA vous aide encore dans 6 mois… ou plus du tout.

PS : dependency-cruiser est gratuit, open source, et s’installe en 10 minutes.
