---
title: "Zero hand-written code: my harness engineering experiment"
description: "I set myself the challenge of writing a program without typing a single line myself, pushing the AI harness to its limit, inspired by an OpenAI experiment."
pubDate: 2026-09-21
tags: ["ai-harnesses", "architecture"]
sources:
  - title: "Harness engineering: leveraging Codex in an agent-first world"
    author: "Ryan Lopopolo"
    year: 2026
    url: https://openai.com/index/harness-engineering/
  - title: "AGENTS.md"
    url: https://agents.md/
draft: false
---

Write a program with **ZERO** lines by hand?

That's the challenge I recently set myself.

The idea: not pushing vibe coding to its limits (although it does look a lot like that) but pushing [the harness](/blog/ai-harness-guides-and-sensors/) to its maximum :)

It came to me from a fascinating post about a similar experiment run by [OpenAI](https://openai.com/index/harness-engineering/)'s teams in August 2025 (3 full-time engineers, 5 months, ~1M lines of code, 0 written by hand... and a tool now heavily used internally at OpenAI).

As a reminder, the harness is everything that sits around the model in agentic coding: the context, the environment, the specs, the verification sensors, the tools... etc (a vast topic, I'll come back to it).

And the goal is simple: I use agents **exclusively** to code, and as soon as something drifts or doesn't do what I want, I try to figure out how to change the harness so it does better on the 2nd run... and on the 100 that follow.

A trivial example: the agent invents a naming convention.

→ clean up the codebase (it copies whatever it sees...) + a rule in [AGENTS.md](https://agents.md/) + a deterministic template-creation script.

An import rule not being respected?

→ [a hard rule baked into the config](/blog/architecture-rules-that-break-the-build/). Not a guideline: something that breaks if you cheat.

And little by little, I'm starting to see skills, scripts, templates, [architecture rules](/blog/dependency-cruiser-as-a-sensor-for-ai-agents/), custom lints... etc emerge, framing the agents so they can produce extremely fast while keeping control.

Careful though, this demands just as much rigor as before, if not more. It burns through your brain at high speed, and touches a huge number of topics where there are 50 creative ways to answer.

And it burns a lot more tokens than I'd like.

I'll keep you posted on the results!
