---
title: "Why I ask for an ADR before every architecture decision"
description: "An ADR fits on one page: context, decision, consequences. Michael Nygard's 2011 idea hasn't aged, and it doubles as a free guide for AI reading the repo."
pubDate: 2026-09-18
tags: ["architecture", "ai-harnesses"]
sources:
  - title: "Documenting Architecture Decisions"
    author: "Michael Nygard"
    year: 2011
    url: https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
draft: false
---

An ADR, an Architecture Decision Record, is one page. Context, decision, consequences. Three paragraphs, no more.

The idea comes from [Michael Nygard](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions), in 2011. It hasn't aged a day.

## What it changes in a team

1. You stop rehashing the same decision every six months.
2. A new hire reads ten ADRs and understands why the code looks the way it does.
3. An AI reading the repo finds the rules of the game: it's a free, feedforward [guide](/blog/ai-harness-guides-and-sensors/).

## The classic trap

Writing the ADR after the fact, to justify a decision already made.

An ADR is written before, while you're still hesitating. If there's no serious alternative, there's no need for an ADR.

## Where to keep them

In the repository, a `docs/adr` folder, one file per decision, numbered. No tool, no wiki. Markdown is enough, and it lives with the code.

Unlike a [rule a CI pipeline can check](/blog/architecture-rules-that-break-the-build/), an ADR stays an intention. But a written, dated intention that anyone can find again.

Happy designing!
