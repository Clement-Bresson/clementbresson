---
title: "Clean Architecture : la Dependency Rule, et rien d'autre"
description: "Ce que Robert C. Martin extrait en 2012 des architectures Hexagonale, Onion et consorts : une seule règle vérifiable dans le code, la Dependency Rule."
pubDate: 2026-08-25
tags: ['architecture']
sources:
  - title: 'The Clean Architecture'
    author: 'Robert C. Martin'
    year: 2012
    url: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
  - title: 'The Onion Architecture: part 1'
    author: 'Jeffrey Palermo'
    year: 2008
    url: https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
  - title: 'Hexagonal architecture'
    author: 'Alistair Cockburn'
    url: https://alistair.cockburn.us/hexagonal-architecture/
draft: false
---

Robert C. Martin (alias Uncle Bob) constate en 2012 que de nombreuses architectures répandues (l'Hexagonale de Cockburn, l'[Onion de Palermo](/fr/blog/what-is-onion-architecture/), BCE de Jacobson, DCI de Coplien et Reenskaug, la Screaming Architecture de lui-même) arrivent sensiblement au même résultat :

Découpler le code métier de l'infrastructure (frameworks, base de données, UI, etc.).

De ces approches, il extrait **une** règle : la Dependency Rule.

## Théoriquement, c'est quoi ?

Le fait que les dépendances du code source (imports, noms externes) vont dans un sens **unique** : de l'extérieur vers l'intérieur.

Donc, quelles que soient les [couches](/fr/blog/what-is-a-layer-in-software-architecture/) du programme (ses exemples ne sont qu'indicatifs) : une couche ne peut **jamais** importer, ni nommer, ni connaître d'aucune façon un élément d'une couche plus externe.

## Ok, mais en pratique ?

Au lieu de faire un import ou de nommer un élément d'une couche extérieure, l'intérieur déclare des interfaces, implémentées par l'extérieur. Le sens de dépendance s'inverse donc par rapport au sens de l'exécution (et au passage, ça, c'est le Dependency Inversion Principle).

Il insiste aussi sur ce qui traverse les frontières : uniquement des structures de données simples, dans la forme la plus pratique pour la couche intérieure. Pas d'Entities qui remontent vers un Controller, pas de lignes de base de données qui descendent vers un use case.

## Ce qu'il faut retenir

Au final, Martin nous donne une règle unique, vérifiable dans le code, au lieu de plusieurs schémas.

Bon designs !
