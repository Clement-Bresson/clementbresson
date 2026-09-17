---
title: "Une « couche » en architecture logicielle, c'est quoi ?"
description: "Abstraction, technique, flux d'appel, dépendances, déploiement : « couche » désigne cinq découpages différents, et votre programme les a sans doute tous."
pubDate: 2026-08-26
tags: ["architecture"]
draft: false
---

C'est le genre de question à laquelle tout le monde pense avoir la réponse... avant de s'y intéresser réellement.

Dans la littérature sur la programmation, on retrouve souvent la notion de « couche ». C'est toujours un dedans (les éléments inclus dans la couche) séparé d'un dehors par une frontière... mais le mot désigne parfois des choses totalement différentes selon le contexte.

Voici une synthèse (personnelle, subjective et ouverte à discussion) de ce que peuvent désigner des « couches ».

## Cinq sens du mot « couche »

1. **Les couches d'abstraction.** Les frontières sont tracées en fonction du niveau d'abstraction : une couche N utilise les abstractions de la couche N-1.
2. **Les couches techniques.** Les frontières sont tracées en fonction du rôle dans le programme. Une couche = un rôle du point de vue du fonctionnement. Exemple : la couche de persistance, la couche d'interface graphique, etc.
3. **Les couches du flux d'appel.** Les frontières sont tracées en fonction de la profondeur par rapport au point d'entrée. Exemple classique : Controller > Domaine > Persistance.
4. **Les couches de dépendances.** Les frontières sont tracées en fonction de la connaissance mutuelle entre les éléments : au sein d'une couche, les éléments ne dépendent que d'éléments de la couche inférieure (version stricte) ou des couches inférieures (version laxiste).
5. **Les couches de déploiement (« tiers »).** Les frontières sont physiques. Chaque couche est un morceau du programme qui se déploie à part (serveur client, serveur API, etc.).

Et il faut bien comprendre que dans un programme, vous avez sûrement toutes ces versions à la fois.

Les couches de dépendances sont d'ailleurs exactement ce que formalisent l'[Onion Architecture](/fr/blog/what-is-onion-architecture/) et la [Clean Architecture](/fr/blog/what-is-clean-architecture/).

## Cinq angles pour analyser un programme

Elles ne sont que différents angles pour schématiser, analyser et comprendre votre programme, selon le besoin :

- **Abstraction** : où se trouve le code concret ? Le code conceptuel ? Est-ce que tout est mélangé de ce point de vue ?
- **Technique** : qui fait quoi ? Les rôles pour le fonctionnement sont-ils clairs ? Ou tout participe-t-il un peu à tout ?
- **Flux d'appel** : le flux de données est-il clair ? Simplifiable ? Performant ? Y a-t-il énormément d'allers-retours ?
- **Dépendances** : le [graphe d'imports](/fr/blog/what-does-a-depends-on-b-mean/) est-il clair ? Ou y a-t-il des dépendances circulaires dans tous les sens ? Y a-t-il du couplage nuisible et évitable ? Est-il facile de changer une partie et de savoir exactement ce qui est impacté ? Cet impact est-il aussi faible que possible ?
- **Déploiement** : qu'est-ce qui se déploie ensemble ou séparément ? Qu'est-ce que cela suppose ?

## Un exercice

Tentez de faire un schéma pour chaque type de couches sur un de vos programmes. Vous aurez peut-être des surprises, et vous aurez assurément appris des choses.

Notamment : si vous n'arrivez pas à produire un schéma pour un type de couche, c'est potentiellement le signe d'une défaillance à résoudre.
