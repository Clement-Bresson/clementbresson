---
title: "Opinionated frameworks are an AI harness"
description: "AdonisJS is famously opinionated. A talk with Jonathan Serra (AI2H) on why that rigidity gives an AI an extra harness, and an open question."
pubDate: 2026-09-18
tags: ["ai-harnesses", "architecture"]
draft: false
---

Today, I was talking with Jonathan Serra, founder of AI2H, about the ongoing shift in the developer's role.

Among the topics we covered:

- a new need showing up at small businesses: the [fractional developer](/blog/the-developer-market-is-shifting/)
- harness engineering
- the developer's new role as a guide and tool builder, so clients can be relatively autonomous on their own development
- how easy it supposedly is to make 20,000 a month with a single prompt — sorry, that one is not true, let's leave that to the hype merchants

## AdonisJS, or rigidity that pays off

One thing led to another, and we ended up talking about AdonisJS, a framework I have never had the chance to try myself.

AdonisJS, roughly, is a very **opinionated** MVC framework for Node: little room for choice, a lot of imposed conventions.

Jonathan told me it is precisely because it is so opinionated that it gets excellent results through an LLM.

Of course, the more opinionated a framework is, the more rigid it is. But rigidity, when you let an AI work with relative autonomy, has its upsides: built-in documentation, strict ways of doing things... all of that gives the AI an extra [harness](/blog/ai-harness-guides-and-sensors/).

## What I have been noticing for a year

That echoes something I have observed since last year: the more [standardised and strict a codebase](/blog/architecture-rules-that-break-the-build/) is, the less the AI goes off in every direction.

It is one of the best feedforward guides (see Böckeler's matrix) you can give a good harness.

## A question for you

Which brings me to a question, for those who are as passionate about this as Jonathan and I are:

Have you noticed frameworks where LLMs seem particularly effective?

And, conversely, frameworks where the results are more erratic?

Having worked a lot on custom stacks this past year, I do not have any to suggest myself. But let's find the hidden AdonisJS out there :)
