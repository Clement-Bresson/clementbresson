---
title: "AI harnesses: guides and sensors, the four boxes to fill"
description: "A harness is everything in an agent that is not the model. Two axes, four boxes, and a painful conclusion about the harnessability of a codebase."
pubDate: 2026-09-07
tags: ["ai-harnesses"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7502834032964030465/
sources:
  - title: "Harness engineering for coding agent users"
    author: "Birgitta Böckeler"
    year: 2026
    url: https://martinfowler.com/articles/harness-engineering.html
  - title: "dependency-cruiser"
    author: "Sander Verweij"
    url: https://github.com/sverweij/dependency-cruiser
draft: false
---

A harness is everything in an agent that is not the model.

[Birgitta Böckeler](https://martinfowler.com/articles/harness-engineering.html) (martinfowler.com, April 2026) structures it along two axes.

## Axis 1: timing

- **Guides** act before: they raise the probability that the first draft is right.
- **Sensors** act after: they let the agent correct itself.

Without sensors, the agent repeats the same mistake. Without guides, it does not know which rules to apply.

## Axis 2: mode

- **Computational**: tsc, ESLint, [dependency-cruiser](/blog/dependency-cruiser-as-a-sensor-for-ai-agents/). Deterministic, a few seconds.
- **Inferential**: a review skill, an LLM judge. Semantic, expensive, non-deterministic.

## Four boxes

Cross the two axes and you get four boxes.

Your AGENTS.md occupies only one of them: inferential guides. The least deterministic box, yet often the only one filled.

A dependency-cruiser rule wired into a hook fills another box: the agent learns it violated a boundary before you open the PR.

Placement rule: the faster a check is, the further left it belongs. Hook, pre-commit, CI, human review.

## The harnessability of a codebase

But not all of these checks are available everywhere. Strict typing gives you a sensor. [Clean module boundaries](/blog/architecture-rules-that-break-the-build/) make a structural rule possible. Without those properties, the check does not exist.

Böckeler calls this the harnessability of a codebase, and draws the conclusion that hurts: the harness is most necessary where it is hardest to build.

A very [opinionated framework](/blog/opinionated-frameworks-as-ai-harnesses/) buys that harnessability upfront: its strict conventions fill several of the boxes before a single line of code is written.

An [ADR](/blog/architecture-decision-records/) is a guide in the same sense: a page written before the decision is made, so a human or an AI reading the repo later finds the rules of the game for free.
