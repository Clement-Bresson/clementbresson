---
title: "Dummy, stub, spy, mock, fake: five test doubles, one question"
description: "The five kinds of test doubles are easy to mix up. One question asked of the double, borrowed from Meszaros, is enough to tell them apart for good."
pubDate: 2026-08-29
tags: ["testing"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7499465319887867904/
sources:
  - title: "Test Double (xUnit Test Patterns)"
    author: "Gerard Meszaros"
    year: 2007
    url: http://xunitpatterns.com/Test%20Double.html
  - title: "Test Double"
    author: "Martin Fowler"
    year: 2006
    url: https://martinfowler.com/bliki/TestDouble.html
draft: false
---

Dummy, stub, spy, mock, fake.

They all refer to a test double (a version of a component dedicated to testing), but they are frequently confused with one another (me first).

Yet to communicate well between developers (or with an AI), precision matters.

To settle it, you only need to remember one question asked of the double. Gerard Meszaros put it forward in 2007: "what is this double for, in terms of what goes **in** and what comes **out** of the code under test?"

## What goes in, what comes out

Let's define those two notions first.

- **What goes in**: the data the code receives from its dependencies. For instance the time given by the clock, a value returned by an API.
- **What comes out**: the calls the code makes to its dependencies. An email sent, a row written to the database.

Now, with that question in hand, the double can easily be defined in five ways.

## 1. Dummy: the double is never called

It's there to be there. For example, it's required as a parameter so the code compiles or can be instantiated, but it's unused by the test. It needs no implementation at all.

Metaphor: an extra in a film.

## 2. Stub: it controls what goes in

It's configured up front to return a value, but nothing is checked on it. The test's assertion is about what the code under test produced with that value.

For example: a clock frozen at a specific date, to test a booking's expiry calculation.

Metaphor: lines fed through an earpiece.

## 3. Spy: it records what comes out, and the recording is read afterwards

It notes the calls it receives. Once the code has run, the test goes through that log and makes its assertions.

Metaphor: an aircraft's black box.

## 4. Mock: it knows in advance what it should receive, before the test

You configure the mock **before** execution with the calls it expects. And it's the mock that fails the test, at the first deviation, during execution.

The fundamental difference from the spy is timing and mechanism: the mock makes its own assertions while the test runs, whereas the spy is checked after the fact.

Metaphor: a pre-set alarm.

## 5. Fake: it actually works

A real, working implementation, but one built for tests, that wouldn't be suitable for production.

Metaphor: a flight simulator. It really flies, it just never takes off.

## The full decision tree

- Never called? **Dummy.**
- A real implementation? **Fake.**
- You control what goes in? **Stub.**
- You read what came out, afterwards? **Spy.**
- You declare it beforehand, and it can complain on its own? **Mock.**

## A double can be several things at once

An important consideration: a double can play several roles. Examples:

- a Fake where one method acts as a Spy;
- a double that is both a Stub and a Spy (you check that it was called **and** it feeds data to the code under test).

Some combinations are impossible, though: a spy cannot be a mock.

Which one to use is a separate question: [three questions](/blog/choosing-the-right-test-double/) are enough to pick the right tool for a given test.
