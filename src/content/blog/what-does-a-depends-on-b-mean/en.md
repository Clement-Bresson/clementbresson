---
title: "\"A depends on B\": what exactly are we talking about?"
description: "A dependency can be seen by the compiler, by a test, or by nobody. Three questions to stay precise, with developers and with an AI."
pubDate: 2026-08-27
tags: ['architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7498651824695144448/
draft: false
---

In programming, when we say "A depends on B", it can mean a huge number of different things.

## What the compiler sees

- A cannot exist without B.
- A knows B's name.
- A has to hand data to B.
- A receives data from B.

All of that is visible directly inside A's code.

## What only a written test will see

- A has to run after B.
- A writes to the same place as B.
- A depends on B's state.

All of that shows up when A and B are used together.

## What potentially nobody will see (or that the customer will discover?)

- A and B have to interpret a value the same way.
- A and B have to use the same constant.

This kind of thing tends not to show up at all. It is the most dangerous.

And the list is not exhaustive.

## Being precise

It matters to be precise. Whether you are discussing with other developers, or prompting an AI (which, unfortunately, or fortunately, cannot read your mind).

When you talk about a dependency, always ask yourself:

- **on which plane?** (source, execution, data, deployment...)
- **in which form?** (name, type, structure, meaning, timing...)
- **who sees it?** (the compiler, a test, nobody)

It is the kind of good reflex to have, whether you are designing a system, coding by hand, prompting, or doing a review.

The "source" plane is the one that a program's [dependency layers](/blog/what-is-a-layer-in-software-architecture/) carve up.

Happy designing!
