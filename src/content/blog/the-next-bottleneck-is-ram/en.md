---
title: "The next bottleneck in software development is RAM"
description: "AI moved the bottleneck from writing to reviewing. The next one is hardware: running five agents in parallel needs a machine not everyone will have."
pubDate: 2026-08-31
tags: ["ai-era"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7500251398761013251/
draft: false
---

Not long ago, the bottleneck in software development was typing speed.

AI moved it to thinking and reviewing.

The next one? The machine. More precisely: RAM.

## An agent is a full environment

A working agent is not a process. It is a complete environment.

node_modules. A TypeScript server. Docker. A Postgres database. A test suite running. A [harness](/blog/ai-harness-guides-and-sensors/).

Multiply by 5 agents. Across 3 codebases. The CPU waits. The RAM saturates.

## Meanwhile, the market

A 32 GB DDR5 kit that cost $72 last year now trades at $392. A 400 to 500% increase in twelve months, according to PCPartPicker's data.

The cause? AI itself. Samsung, SK Hynix and Micron are redirecting DRAM production toward server HBM, which is far more profitable.

In other words: the tool we want to use is blowing up the price of the tool we need to use it.

## The consequences are brutal

- Starting out as a developer will require a hardware entry ticket that did not exist before.
- The employee whose employer does not keep up will stay slow. Or will fund their machine out of their salary.
- The freelancer, meanwhile, puts the beast of a machine through their company. A clear advantage.

The gap will no longer be between those who know how to use AI and the others.

It will be between those who can run five in parallel and those who run one.

How much RAM is in your work machine today? And who decides on the next one?
