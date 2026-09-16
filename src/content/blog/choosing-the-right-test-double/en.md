---
title: 'Three questions to pick the right tool for your next test'
description: 'Pure unit test, integration test, a Fake, or a double that records calls: a simple three-question strategy for choosing without hesitation.'
pubDate: 2026-08-28
tags: ['testing']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7499054779600379904/
draft: false
---

What simple strategy lets you pick the right tool for your next test? Start by asking yourself three questions, in order.

## 1. Can I observe the result directly on the thing I'm testing?

A return value, or the state of the object after the call. A [pure function](/blog/functional-core-imperative-shell/), a method on your entity. You call it, you check, done. No [Mock, no Spy, no Fake](/blog/test-doubles-dummy-stub-spy-mock-fake/), nothing.

This is the majority of tests in a healthy codebase: the unit tests on your domain or your basic utilities.

## 2. If not: is the effect observable from my system?

A use case that writes to the database: you run it, you read the database back, you check. Two options for observing the result:

- **The real thing**, your actual database. That's an integration test.
- **A Fake** if the real thing is too slow or too complicated to set up: a simplified implementation, in memory for example, that behaves like the real one. You keep the read-back, you gain speed.

## 3. If the effect is not observable in your system

Your code sends an email. You can't read your user's inbox. So, from your point of view, the call to `sendEmail` *is* the expected behaviour: in that case, you replace the Mailer with a double (one that records that it was called, without sending anything) and you check that the call was made.

This third case is a weaker test than the second: you're checking that you asked, not that the effect behind it actually happened. But it's better than nothing!

Happy designing!
