---
title: 'Experience-based daily rates no longer measure anything'
description: 'Daily rate grids were built on years of experience because the keyboard capped the gap between good and bad developers. With AI, that bottleneck is gone.'
pubDate: 2026-09-09
tags: ['ai-era', 'fractional']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7503531080134742017/
draft: false
---

I think the daily rate model is going to change a lot in the coming years.

## Yesterday's grid

Until now, roughly speaking, it looked like this:

- ~200 to 300: junior
- ~400 to 500: mid-level
- ~600 to 800: senior
- ~800+: expert on a specific topic

The problem? With a few exceptions, the grid was based on years of experience, give or take.

And at every level you had a mix of bad and good developers.

The bad one hurt the project: poor choices, technical debt with every commit. The good one helped enormously: less debt, good practices, training others.

## Why it worked anyway

As long as the bottleneck was typing speed, the bad developer could not do *too much* damage in a day. And the good one could not repair much more than that.

The gap existed, but it was capped by the keyboard. So paying by experience remained an acceptable approximation.

## With AI, the bottleneck is gone

The bad developer prompts, copy-pastes, and creates problems at full speed.

The good one does something else: they build a [harness](/blog/ai-harness-guides-and-sensors/). [Tests that block](/blog/mutation-testing-in-the-age-of-ai-generated-tests/), a CI that refuses, an architecture where the agent *cannot* do whatever it wants.

And then AI is not just fast: it moves fast in the right direction, potentially even on its own, when the good developer is no longer in front of the screen.

An excellent developer with an excellent harness is a speed I had never seen in twelve years in this trade.

## What is left to measure

Experience-based rates worked because the gap was small. AI makes the gap enormous. So experience-based rates no longer measure anything.

What is left to measure is the one thing that has not moved: has this person already shipped, and did it hold up?

So I see daily rates based on verifiable successes and recommendations coming.

And the math becomes simple:

- A bad developer at 500: you pay 500 plus the debt they generate. And that debt, someone else will pay, at a higher price.
- An excellent developer at 1000 or more: you pay 1000 and you get everything else back.

The 1000 will be far more profitable than the 500.

This is the reasoning behind the [part-time senior developer](/blog/the-part-time-senior-developer/) model.

PS: this means the real risk is no longer paying too much. It is paying too little.
