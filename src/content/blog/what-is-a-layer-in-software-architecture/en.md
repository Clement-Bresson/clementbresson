---
title: 'What is a "layer" in software architecture?'
description: 'Abstraction, technical role, call flow, dependencies, deployment: "layer" names five ways of slicing a program, and yours probably has all of them.'
pubDate: 2026-08-26
tags: ["architecture"]
draft: false
---

It is the kind of question everyone thinks they can answer... until they actually look into it.

The notion of a "layer" comes up constantly in programming literature. It is always an inside (the elements included in the layer) separated from an outside by a boundary... but the word sometimes refers to completely different things depending on the context.

Here is a summary (personal, subjective and open to discussion) of what "layers" can mean.

## Five meanings of "layer"

1. **Abstraction layers.** Boundaries are drawn by level of abstraction: layer N uses the abstractions of layer N-1.
2. **Technical layers.** Boundaries are drawn by role within the program. One layer = one role from an operational point of view. For example: the persistence layer, the UI layer, and so on.
3. **Call-flow layers.** Boundaries are drawn by depth relative to the entry point. The classic example: Controller > Domain > Persistence.
4. **Dependency layers.** Boundaries are drawn by which elements know about each other: within a layer, elements depend only on elements of the layer immediately below (strict version) or of any lower layer (relaxed version).
5. **Deployment layers ("tiers").** Boundaries are physical. Each layer is a piece of the program deployed separately (client server, API server, and so on).

And you have to understand that in any program, you almost certainly have all of these at once.

Dependency layers are, incidentally, exactly what [Onion Architecture](/blog/what-is-onion-architecture/) and [Clean Architecture](/blog/what-is-clean-architecture/) formalise.

## Five angles for analysing a program

They are simply different angles for diagramming, analysing and understanding your program, depending on what you need:

- **Abstraction**: where is the concrete code? The conceptual code? Is everything mixed together from this point of view?
- **Technical**: who does what? Are the operational roles clear? Or does everything take part a little in everything?
- **Call flow**: is the data flow clear? Could it be simplified? Is it performant? Are there a huge number of round trips?
- **Dependencies**: is the [import graph](/blog/what-does-a-depends-on-b-mean/) clear? Or are there circular dependencies everywhere? Is there harmful, avoidable coupling? Is it easy to change one part and know exactly what is affected? Is that impact as small as it could be?
- **Deployment**: what is deployed together, and what separately? What does that imply?

## An exercise

Try drawing a diagram for each type of layer on one of your programs. You may be surprised, and you will certainly learn something.

In particular: if you cannot produce a diagram for one type of layer, that may well be the sign of a flaw to fix.
