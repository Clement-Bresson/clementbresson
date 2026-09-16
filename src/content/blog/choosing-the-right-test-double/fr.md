---
title: 'Trois questions pour choisir le bon outil pour votre prochain test'
description: 'Test unitaire pur, intégration, Fake ou doublure qui enregistre les appels : une stratégie simple en trois questions pour choisir sans hésiter.'
pubDate: 2026-08-28
tags: ['testing']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7499054779600379904/
draft: false
---

Quelle stratégie simple permet de choisir le bon outil pour votre prochain test ? Commencez par vous poser trois questions, dans l'ordre.

## 1. Est-ce que je peux observer le résultat directement sur ce que je teste ?

Une valeur de retour, ou l'état de l'objet après l'appel. Une [fonction pure](/fr/blog/functional-core-imperative-shell/), une méthode de votre entité. Vous appelez, vous vérifiez, terminé. Pas de [Mock, de Spy, de Fake](/fr/blog/test-doubles-dummy-stub-spy-mock-fake/) ou quoi que ce soit.

C'est la majorité des tests dans une code base saine : les tests unitaires sur votre domaine ou vos utils de base.

## 2. Sinon : l'effet est-il observable depuis mon système ?

Un use case qui écrit en base : vous l'exécutez, vous relisez la base, vous vérifiez. Deux options pour observer le résultat :

- **Le réel**, votre vraie base. C'est un test d'intégration.
- **Un Fake** si le réel est trop lent ou trop compliqué à mettre en place : une implémentation simplifiée, par exemple en mémoire, qui se comporte comme la vraie. Vous gardez la relecture, vous gagnez en rapidité.

## 3. Si l'effet n'est pas observable dans votre système

Votre code envoie un email. Vous ne pouvez pas relire la boîte de votre utilisateur. Donc, de votre point de vue, l'appel à `sendEmail` est le comportement attendu : dans ce cas, vous remplacez le Mailer par une doublure (qui enregistre qu'on l'a appelé, sans rien envoyer) et vous vérifiez que l'appel a été émis.

Ce troisième cas est un test plus faible que le deuxième : vous vérifiez que vous avez demandé, pas que l'effet derrière a bien été effectué. Mais c'est mieux que rien !

Bon designs !
