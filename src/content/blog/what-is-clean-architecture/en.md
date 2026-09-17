---
title: "Clean Architecture is one rule: the Dependency Rule"
description: "What Robert C. Martin extracted in 2012 from Hexagonal, Onion and friends: a single rule you can verify in the code, the Dependency Rule."
pubDate: 2026-08-25
tags: ["architecture"]
sources:
  - title: "The Clean Architecture"
    author: "Robert C. Martin"
    year: 2012
    url: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
  - title: "The Onion Architecture: part 1"
    author: "Jeffrey Palermo"
    year: 2008
    url: https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
  - title: "Hexagonal architecture"
    author: "Alistair Cockburn"
    url: https://alistair.cockburn.us/hexagonal-architecture/
draft: false
---

In 2012, Robert C. Martin (aka Uncle Bob) observed that many widespread architectures (Cockburn's Hexagonal, Palermo's [Onion](/blog/what-is-onion-architecture/), Jacobson's BCE, Coplien and Reenskaug's DCI, and his own Screaming Architecture) end up with roughly the same result:

Decoupling business code from infrastructure (frameworks, database, UI, and so on).

From these approaches he extracts **one** rule: the Dependency Rule.

## In theory, what is it?

Source code dependencies (imports, external names) point in a **single** direction: from the outside towards the inside.

So, whatever the [layers](/blog/what-is-a-layer-in-software-architecture/) of the program (his examples are only illustrative): a layer can **never** import, name, or know about, in any way, an element of a more outer layer.

## Fine, but in practice?

Instead of importing or naming an element from an outer layer, the inside declares interfaces, which the outside implements. The direction of dependency is therefore inverted relative to the direction of execution (and by the way, that is the Dependency Inversion Principle).

He also insists on what crosses the boundaries: only simple data structures, in whatever form is most convenient for the inner layer. No Entities travelling up to a Controller, no database rows travelling down into a use case.

## The takeaway

In the end, Martin gives us a single rule that can be verified in the code, instead of several diagrams.

Happy designing!
