---
title: "Vertical Slice Architecture: organise code by request"
description: "When adding one field touches six files in four folders, the feature lives nowhere. Jimmy Bogard's Vertical Slice Architecture flips the way code is organised."
pubDate: 2026-09-02
tags: ["architecture"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7500990856124874752/
sources:
  - title: "Vertical Slice Architecture"
    author: "Jimmy Bogard"
    year: 2018
    url: https://www.jimmybogard.com/vertical-slice-architecture/
draft: false
---

In your program, you add a field to a form and it makes you change six files in four folders.

The controllers folder, the services folder, the repositories folder, the models folder. When code is organised by technical role, the feature itself lives nowhere: it is scattered.

## One request = one folder

Vertical Slice Architecture (VSA) flips the organising principle. You no longer group by technical role but by request.

One request = one folder, containing everything needed to answer it, from HTTP all the way down to SQL.

```
features/users/create
features/users/delete
features/payment/send-link
...
```

The term comes from Jimmy Bogard, in [a blog post from 19 April 2018](https://www.jimmybogard.com/vertical-slice-architecture/). The founding text takes three minutes to read, and I recommend it if the topic interests you. Here is the idea:

> The architecture is built around distinct requests, each one encapsulating and grouping all of its concerns, from the front end to the back end.

## Each slice decides for itself

So far, this is just moving files around. The real idea comes right after:

Each slice decides for itself how best to answer its request.

- A dead-simple feature? A transaction script with raw SQL. No Service, no Repository.
- A feature with complex business rules? Bring out your finest elaborate designs (because they are useful here, not for show).

Each feature uses exactly the complexity it needs.

And true VSA recommends sharing as little as possible between features. Trying to be DRY would go against the strategy.

## Advantages

- Adding a feature = adding files, no longer modifying them. No side effects.
- Reading a feature = opening one folder and having everything in it.
- Removing a feature = deleting one folder.

## Drawbacks

- Code that looks alike without being shared.
- The same problem in two features may be solved in two different ways.
- You have to know when to refactor a feature (the transaction script has its limits).
- Overall, not DRY at all.

## What does it stand against?

The idea of a single architecture imposed on the entire program.

- No [Clean Architecture](/blog/what-is-clean-architecture/) + DDD everywhere.
- No Hexagonal Architecture everywhere.
- No Transaction Script everywhere (has anyone ever tried?).

On your current project, is the chosen architecture (assuming there is one) relevant everywhere?

PS: I do not have a firm opinion on this yet. I have experimented a little with VSA, but less than with more widespread architectures (Clean Architecture + DDD in particular). So if people have done VSA on large projects, over the long term, feedback would be very welcome.

Happy designing!
