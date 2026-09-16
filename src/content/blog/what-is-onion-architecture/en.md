---
title: "Onion Architecture: business code at the centre"
description: "What Jeffrey Palermo proposed in 2008 with Onion Architecture: a single dependency rule so that business code stops paying for every technology change."
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

When a program's business code depends on technologies that move fast:

- either you suffer through every painful upgrade,
- or you accept gradual obsolescence.

To avoid that, Jeffrey Palermo proposed a new architecture name in 2008, one that puts business code at the centre: Onion Architecture.

## The problem with classic layers

He criticises a common example of layered architecture:

```
(UI) > (N layers) > (Business) > (Data Access)
```

Here, the Business layer knows about the persistence technology (for instance, it imports and uses a PostgreSQL client directly). So it will be affected the day you want to swap PostgreSQL for something else.

## The onion

Instead, Palermo suggests seeing the program as an onion (hence the name), with:

- at the centre, the Business core, which is part of an Application Core where interfaces are defined;
- on the outside, the Infrastructure layer, where you find the technology-specific implementations of those interfaces;
- in between, any number of layers the architect chooses, also part of the Application Core.

And one rule governing all these layers: **a layer may only depend on layers more central than itself.**

Corollary: the Business core, at the centre, must depend on **no** other layer. No imports, no technology names (a point that is sometimes forgotten).

## What does that look like in practice?

Back to the persistence example.

Say you need to persist users: the Application Core defines a `UserRepository` interface, and the Infrastructure layer provides a technology-specific implementation, `PostgresUserRepository`. Everything is then wired together at runtime.

The result? The diagram (picture it as concentric rings, outside to inside) becomes:

```
(UI + Data Access) > (N layers) > (Business)
```

Data Access has moved to the outside.

And if tomorrow you want MongoDB instead of PostgreSQL, you replace `PostgresUserRepository` with `MongoUserRepository`, and the Business code does not have to change: it no longer suffers the whims of technology churn.

## A few clarifications on Palermo's view

1. He says it himself: he is not inventing anything. He is proposing a new name for an existing architectural concept. He notably cites Cockburn's Hexagonal Architecture, with which he says he shares the idea of pushing technology concerns outward.
2. Despite his diagrams, the intermediate layers are only examples. What really matters is the Business layer, the Infrastructure layer and the concept of an Application Core.
3. He imposes nothing on the Business layer. You can do Onion Architecture with DDD inside, or without. The two are independent.

A few years later, Robert C. Martin's [Clean Architecture](/blog/what-is-clean-architecture/) condensed this idea, shared by Onion and Hexagonal, into a single rule.

Happy designing!
