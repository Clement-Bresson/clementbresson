---
title: 'dependency-cruiser: a computational sensor for your AI agents'
description: "dependency-cruiser maps imports and fails CI when a boundary is violated. A sensor for AI agents that only works if the architecture is clear enough to describe."
pubDate: 2026-09-08
tags: ['ai-harnesses', 'architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7503173496605351936/
sources:
  - title: 'dependency-cruiser'
    author: 'Sander Verweij'
    url: https://github.com/sverweij/dependency-cruiser
draft: false
---

Do you know [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)?

It is a tool that reads your codebase and maps who imports what.

You write rules: "[the domain never imports the infrastructure](/blog/what-is-clean-architecture/)", "no cycles", "the UI does not touch the DB".

It runs in CI and warns as soon as an import line violates a rule.

## A computational sensor for AI

Many people see it as an architecture tool, but I see it as a **computational sensor** for AI.

Because your agent (Claude Code, Cursor, whichever) will take shortcuts. Always. A direct import of the DB from a component, "it works".

With dependency-cruiser in the [harness](/blog/ai-harness-guides-and-sensors/), the shortcut blows up in CI and the agent has to redo it properly. Without you having to re-read 40 files.

## The twist

It only works if you have [a clear architecture to describe](/blog/architecture-rules-that-break-the-build/). Sharp boundaries, strict rules.

On a codebase where everything imports everything, there is nothing to check. The sensor sees nothing. No rule is possible.

And that is where it gets vicious: the more chaotic the codebase, the fewer guardrails the AI has, the more chaos it adds.

The AI gets worse and worse on *your* project. Not because the model is degrading. Because the terrain is.

So before stacking agents on an app generated in 3 weeks, have someone who does this for a living look at the structure. That is what decides whether AI is still helping you in 6 months… or not at all.

PS: dependency-cruiser is free, open source, and installs in 10 minutes.
