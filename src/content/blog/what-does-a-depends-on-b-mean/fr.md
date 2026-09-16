---
title: "« A dépend de B » : de quoi parle-t-on exactement ?"
description: "Une dépendance peut être vue par le compilateur, par un test, ou par personne. Trois questions pour rester précis, entre développeurs comme face à une IA."
pubDate: 2026-08-27
tags: ['architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7498651824695144448/
draft: false
---

En programmation, quand on dit « A dépend de B », cela peut vouloir dire énormément de choses différentes.

## Ce que le compilateur voit

- A ne peut pas exister sans B.
- A connaît le nom de B.
- A doit donner de la donnée à B.
- A reçoit de la donnée de B.

Tout ça se voit directement à l'intérieur du code de A.

## Ce que seul un test écrit verra

- A doit s'exécuter après B.
- A écrit au même endroit que B.
- A dépend de l'état de B.

Tout ça se voit quand on utilise A et B ensemble.

## Ce que potentiellement personne ne verra (ou que le client découvrira ?)

- A et B doivent interpréter une valeur de la même façon.
- A et B doivent utiliser une même constante.

Tout ça a tendance à ne pas forcément se voir. C'est le plus dangereux.

Et la liste n'est pas exhaustive.

## Être précis

Il est important d'être précis. Que ce soit pour discuter entre développeurs, ou quand on prompte une IA (qui, malheureusement, ou heureusement, ne lit pas dans nos pensées).

Quand vous parlez de dépendance, demandez-vous toujours :

- **sur quel plan ?** (source, exécution, données, déploiement...)
- **sous quelle forme ?** (nom, type, structure, sens, timing...)
- **qui la voit ?** (le compilateur, un test, personne)

C'est le genre de bon réflexe à avoir, que ce soit quand on conçoit un système, quand on code à la main, quand on prompte, ou quand on fait une revue.

Le plan « source » est celui que découpent les [couches de dépendances](/fr/blog/what-is-a-layer-in-software-architecture/) d'un programme.

Bon designs !
