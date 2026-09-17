---
title: "Functional Core, Imperative Shell: the end of mocks everywhere"
description: "Gary Bernhardt's 2012 talk Boundaries is still some of the best testing advice around: separate decisions from actions, and pass only values between them."
pubDate: 2026-09-11
tags: ["architecture", "testing"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7504254004768530433/
sources:
  - title: "Boundaries"
    author: "Gary Bernhardt"
    year: 2012
    url: https://www.destroyallsoftware.com/talks/boundaries
draft: false
---

Do your tests need [mocks](/blog/test-doubles-dummy-stub-spy-mock-fake/) everywhere? The problem isn't your tests.

Gary Bernhardt, 2012, the talk ["Boundaries"](https://www.destroyallsoftware.com/talks/boundaries). Fourteen years later, it's still one of the best pieces of testing advice I know.

## The starting observation

A unit test with mocks doesn't verify that your code works. It verifies that your code **calls** the right things. Change the how without changing the what, and the test breaks. That's not the sign of a good test, which is supposed to let you refactor with peace of mind.

So we fall back on [integration tests](/blog/choosing-the-right-test-double/). Except every `if` adds paths, and the number of tests needed to cover everything explodes. Either you write tons of them, or you don't traverse everything.

## The diagnosis

We mix two things in the same code:

- **decisions** (logic, lots of branches);
- **actions** (the database, the network, the disk, lots of dependencies).

So he separates them.

**The functional core**: pure functions. Data in, a decision out, as data. Zero dependencies, zero effects. Lots of branches, but each branch tests in three lines, with no mock.

**The imperative shell**: the code that touches the world. It reads, passes values to the core, executes the decision. Lots of dependencies, but almost no `if`. A few integration tests are enough.

## The point everyone forgets

It's the one that gives the talk its title: the boundary between the two is crossed with **values**. Not complex objects with behaviour.

The core doesn't say "send an email". It returns `{ kind: "send_reminder", to: ... }`. The shell does the sending.

We often write Services that do both at once. An `await db` at the top, three `if`s in the middle, an `await mailer` at the bottom. Impossible to test without mocking, impossible to cover with integration tests.

PS: the full talk is 30 minutes, and I can only recommend it.
