---
title: "L'Onion Architecture : le code métier au centre"
description: "Jeffrey Palermo, 2008 : une règle de dépendance unique pour que le code métier ne subisse plus les changements de technologie."
pubDate: 2026-08-24
tags: ['architecture']
sources:
  - title: 'The Onion Architecture: part 1'
    author: 'Jeffrey Palermo'
    year: 2008
    url: https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
  - title: 'Hexagonal architecture'
    author: 'Alistair Cockburn'
    url: https://alistair.cockburn.us/hexagonal-architecture/
draft: false
---

Quand le code métier d'un programme dépend de technologies qui évoluent vite :

- soit on subit la pénibilité des évolutions,
- soit on accepte l'obsolescence progressive.

Pour éviter ça, Jeffrey Palermo propose en 2008 un nouveau nom d'architecture, mettant le code métier au centre : l'Onion Architecture.

## Le problème avec les couches classiques

Il critique l'exemple d'une architecture en couches courante :

```
(UI) > (X couches) > (Métier) > (Data Access)
```

Ici, la couche Métier connaît les technologies de persistance (par exemple, elle importe et utilise directement un client PostgreSQL). Elle sera donc impactée si un jour on souhaite remplacer PostgreSQL par une autre technologie.

## L'oignon

À la place, Palermo propose de voir le programme comme un oignon (d'où le nom) avec :

- au centre, le cœur Métier, qui fait partie d'un Application Core où sont définies des interfaces ;
- à l'extérieur, la couche Infrastructure, dans laquelle on retrouve les implémentations technologiques de ces interfaces ;
- entre les deux, X couches au choix de l'architecte, faisant elles aussi partie de l'Application Core.

Et une règle pour régir toutes ces couches : **une couche ne peut dépendre que de couches plus centrales qu'elle.**

Corollaire : le cœur Métier, au centre, ne doit dépendre d'**aucune** autre couche. Pas d'imports, pas de noms de technologies (point parfois oublié).

## Concrètement, ça donne quoi ?

Si on reprend l'exemple de la persistance.

Pour un hypothétique besoin de persistance des utilisateurs : l'Application Core définit une interface `UserRepository`, la couche Infrastructure fournit une implémentation technologique `PostgresUserRepository`. Et le tout est composé pour le runtime.

Résultat ? Le schéma (imaginez-le concentrique, de l'extérieur vers l'intérieur) devient :

```
(UI + Data Access) > (X couches) > (Métier)
```

Le Data Access est remonté à l'extérieur.

Et si demain on ne veut plus PostgreSQL mais MongoDB, on remplace `PostgresUserRepository` par `MongoUserRepository`, et le code Métier n'a pas à changer : il ne subit plus les aléas des évolutions technologiques.

## Quelques précisions sur la vision de Palermo

1. Il le dit lui-même : il n'invente rien. Il propose un nouveau nom pour parler d'un concept d'architecture existant. Il cite notamment l'Architecture Hexagonale de Cockburn, avec laquelle il dit partager l'externalisation des considérations technologiques.
2. Malgré ses schémas, les couches intermédiaires ne sont que des exemples. Seuls comptent vraiment la couche Métier, la couche Infrastructure et le concept d'Application Core.
3. Il n'impose rien pour la couche Métier. On peut faire une Onion Architecture avec du DDD à l'intérieur, ou pas. C'est indépendant.

Quelques années plus tard, la [Clean Architecture](/fr/blog/what-is-clean-architecture/) de Robert C. Martin condense cette idée, commune à l'Onion et à l'Hexagonale, en une règle unique.

Bon designs !
