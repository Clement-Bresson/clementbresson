---
title: "Functional Core, Imperative Shell : la fin des mocks partout"
description: "Le talk Boundaries de Gary Bernhardt (2012) reste un des meilleurs conseils de testing : séparer décisions et actions, ne passer que des valeurs entre les deux."
pubDate: 2026-09-11
tags: ['architecture', 'testing']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7504254004768530433/
sources:
  - title: 'Boundaries'
    author: 'Gary Bernhardt'
    year: 2012
    url: https://www.destroyallsoftware.com/talks/boundaries
draft: false
---

Tes tests ont besoin de [mocks](/fr/blog/test-doubles-dummy-stub-spy-mock-fake/) partout ? Le problème, ce n'est pas tes tests.

Gary Bernhardt, 2012, talk [« Boundaries »](https://www.destroyallsoftware.com/talks/boundaries). Quatorze ans plus tard, c'est toujours un des meilleurs conseils de testing que je connaisse.

## Le constat de départ

Un test unitaire avec des mocks ne vérifie pas que ton code marche. Il vérifie que ton code **appelle** les bonnes choses. Tu changes le comment sans changer le quoi, et le test casse. Ce n'est pas le signe d'un bon test, qui est censé permettre de refactorer sereinement.

Alors on se rabat sur les [tests d'intégration](/fr/blog/choosing-the-right-test-double/). Sauf que chaque `if` ajoute des chemins, et le nombre de tests pour tout couvrir explose. Soit tu en fais des tonnes, soit tu ne traverses pas tout.

## Le diagnostic

On mélange deux choses dans le même code :

- les **décisions** (de la logique, plein de branches) ;
- les **actions** (la base, le réseau, le disque, plein de dépendances).

Donc il les sépare.

**Le functional core** : des fonctions pures. De la data en entrée, une décision en sortie sous forme de data. Zéro dépendance, zéro effet. Plein de branches, mais chaque branche se teste en trois lignes, sans mock.

**L'imperative shell** : le code qui touche le monde. Il lit, il passe les valeurs au core, il exécute la décision. Plein de dépendances, mais quasi aucun `if`. Quelques tests d'intégration suffisent.

## Le point que tout le monde oublie

C'est celui qui donne son titre au talk : la frontière entre les deux se traverse avec des **valeurs**. Pas des objets complexes avec du comportement.

Le core ne dit pas « envoie un mail ». Il retourne `{ kind: "send_reminder", to: ... }`. C'est le shell qui envoie.

On écrit souvent des Services qui font les deux à la fois. Un `await db` en haut, trois `if` au milieu, un `await mailer` en bas. Impossible à tester sans mocker, impossible à couvrir en intégration.

PS : le nom anglais, c'est « Functional Core / Imperative Shell ». Le talk complet dure 30 minutes, je ne peux que le recommander.
