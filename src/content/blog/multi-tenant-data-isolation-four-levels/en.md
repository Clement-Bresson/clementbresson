---
title: "Multi-tenancy: the four levels of data isolation"
description: "A SaaS handling sensitive data has to keep each customer’s data apart. Four levels, from a tenant_id column to dedicated infra, and the one I usually pick."
pubDate: 2026-09-16
tags: ['architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7506068368706215937/
draft: false
---

Building a SaaS that handles sensitive data for businesses? There is a software architecture question that will come up very quickly: how do you keep each customer's data apart?

Because the day company A sees company B's invoices… it's over (or very, very painful).

There are four levels of isolation.

## Level 1: one shared database, a label on every row

Everyone in the same database, with a "who owns this" label on every row (a `tenant_id` column, for example).

- **Pros**: cheap, easy.
- **Cons**: one forgotten filter can cost you dearly. And if a big customer runs heavy jobs and it is badly managed, everyone slows down, because resources are shared (we see you, giant data ingestion workers).

## Level 2: one shared database, one space per customer

Still a shared database, but each company gets its own separate space (one Postgres schema per customer, for example).

- **Pros**: cleaner. You can export or back up one customer's data with a single command.
- **Cons**: every structural change has to be repeated across all spaces (migrations × N customers). And resources are still shared.

## Level 3: one database per customer

- **Pros**: maximum isolation at the database level, with physically separate databases.
- **Cons**: much heavier to manage (creating/deleting), to monitor and to maintain (handling idle databases…).

## Level 4: a full installation per customer

Here we are no longer talking only about the database, but about 100% of the infrastructure: one API per customer, workers per customer, and so on.

- **Pros**: no leak possible from one customer to another. Resources are 100% separate and can scale independently.
- **Cons**: you have to pay up, and have full-time DevOps in-house.

## The services that run level 3 for you

There are services that promise to handle level 3 for you: Neon, Nile, Supabase… A new database created in one second through an API, that costs nothing while it sleeps, and so on.

It works very well, but your data lives with them: American companies. So even if the server is in Europe… the US can request the data.

These solutions can therefore be an option… unless you handle sensitive data (or you genuinely don't care… but that only lasts so long).

## What I often do personally

Level 2, with [guard rails in the code](/blog/architecture-rules-that-break-the-build/) so that an omission is either impossible or harmless (tenant omitted ⇒ zero rows returned).

And built so that moving a customer out into their own database, should the need arise (a dump of all the tenant's tables), is easy.
