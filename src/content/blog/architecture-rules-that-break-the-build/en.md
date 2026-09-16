---
title: 'How many of your architecture rules break the build?'
description: 'With AI, a standardised architecture becomes an asset: every rule a machine can verify is a constraint. The others are only intentions.'
pubDate: 2026-08-30
tags: ['architecture', 'ai-harnesses']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7499770330241118208/
sources:
  - title: 'no-restricted-imports (ESLint rule)'
    url: https://eslint.org/docs/latest/rules/no-restricted-imports
draft: false
---

Which architecture allows robust, continuous use of AI even as a project scales?

The one that provides the maximum number of rules a machine can verify, deterministically.

## Verbosity is no longer the problem

Structured architectures ([Clean Architecture](/blog/what-is-clean-architecture/), Hexagonal, DDD…) are often criticised for being verbose. With AI, that is less and less of a problem. The cost of writing is collapsing… while the cost of reading and verifying is exploding.

That is where an ultra-standardised architecture becomes an asset, despite its potential verbosity.

An AI produces code that looks like correct code… and very often is not. The defence that scales is not a line-by-line review (you will not keep up, and nobody is infallible) but a [harness](/blog/ai-harness-guides-and-sensors/) that validates whether the code is correct or not.

## An intention versus a constraint

Example rule: domain code imports nothing from the infrastructure (if you are doing Clean Architecture or Hexagonal, for instance).

That rule in a README or a CLAUDE.md is an **intention**. Better than nothing… but often unread or ignored.

Placed in a config, it becomes a **constraint**:

```js
// eslint.config.js, applied to src/domain/** files
"no-restricted-imports": ["error", {
  patterns: ["**/infrastructure/**", "pg", "express"]
}]
```

The rule can no longer be bypassed.

## The reflex for starting a project in 2026

It was already true before… but it is even more true today.

Once you have chosen an architecture that fits the project (a CRUD does not need Clean Architecture plus DDD…), it must be standardised to the extreme.

For every rule:

- **The holy grail**: make it impossible to bypass, as in the example above.
- **The fallback** (some rules simply cannot be enforced by a harness): a regularity so strong that the prompt fits in two lines, and any divergence is obvious at a glance.

Tomorrow, ask yourself: how many of your architecture rules break the build?

The others are actually intentions.

[dependency-cruiser](/blog/dependency-cruiser-as-a-sensor-for-ai-agents/) applies the same idea to the whole import graph.

The same reflex applies to [isolating customer data in a SaaS](/blog/multi-tenant-data-isolation-four-levels/): an omitted tenant must return zero rows, not a leak.

PS: a rule that passes does not mean the rule is good. Thinking and making the right choices for each project's context is not optional.
