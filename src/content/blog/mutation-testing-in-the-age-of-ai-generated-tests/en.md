---
title: 'Your tests are green, but that proves nothing: mutation testing'
description: 'Coverage measures lines run through, not lines verified. Mutation testing measures whether tests detect bugs, essential once agents write the tests.'
pubDate: 2026-09-05
tags: ['testing', 'ai-harnesses']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7502090523608973312/
sources:
  - title: 'Stryker Mutator'
    url: https://stryker-mutator.io/
  - title: 'PIT Mutation Testing'
    url: https://pitest.org/
  - title: 'mutmut'
    url: https://github.com/boxed/mutmut
draft: false
---

Your tests are green. But that proves nothing.

Coverage measures the lines your tests **run through**. Not the ones they verify.

The nuance is huge, and yet we've been steering quality with this metric for 15 years.

Concretely: a test without an assertion runs through the code, ticks its coverage box, and would never detect a single bug. Ever.

## How mutation testing works

Mutation testing starts exactly there.

You deliberately introduce bugs into your code. Replace a `>` with a `>=`, flip a boolean, delete a call. Then you rerun the test suite.

- If the tests go red, the mutant is killed: all is well.
- If the tests stay green, the mutant survived: your test tests nothing.

At the end you get a score that measures your tests' ability to **detect**. No longer just your code's ability to be run through.

## So why does almost nobody use it?

Because it's slow (each mutant is a full run of the suite).

Because it's noisy at first (equivalent mutants, false positives).

And above all because we had a safety net: we wrote the tests by hand, so we roughly knew what they verified.

The ROI looked low. Me first: I watched it from a distance for years.

## That safety net just disappeared

Today we generate the code **and** the tests with agents. Fast. In bulk. And an LLM optimises for what we measure: green and coverage.

The result: tests that describe the implementation instead of describing the expected behaviour.

They always pass. Even when the code is wrong.

So you end up reviewing tests you didn't write, protecting code you didn't write.

That is precisely the hole mutation testing plugs: it's an automated check of the check.

And with that, the slowness argument falls too. You don't run it locally on every save; you run it in CI, on the diff only. The machine waits, not you.

## To try it

- [Stryker](https://stryker-mutator.io/) for JS/TS
- [PIT](https://pitest.org/) for Java
- mutmut for Python

And start with your critical domain only. Not the whole codebase, or you'll never do it.

Personally, I include it in my clients' [harness](/blog/ai-harness-guides-and-sensors/).

A test that cannot fail is not a test. It's a comment that burns CPU.

It is one more constraint that breaks the build, alongside [architecture rules a machine can verify](/blog/architecture-rules-that-break-the-build/).

PS: if your first mutation score depresses you, that's normal.
