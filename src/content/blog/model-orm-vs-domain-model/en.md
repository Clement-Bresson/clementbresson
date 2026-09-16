---
title: 'What is a "Model"? Two things that have nothing in common'
description: '"Model" means both an ORM Model and the DDD domain model. Confusing them makes you think you modelled your business when you only described your tables.'
pubDate: 2026-09-12
tags: ['architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7504605709494407168/
sources:
  - title: 'Domain-Driven Design'
    author: 'Eric Evans'
    year: 2003
draft: false
---

In software engineering and software architecture, what is a "Model"?

In common usage, it refers to two things that have **nothing** to do with each other. Knowing that saves a lot of confusion.

## 1. The Model in the ORM sense

Prisma, Sequelize, Mongoose and friends.

Here the Model is the definition of the object persisted in the database: the `User` Model, the `Invoice` Model, and so on.

It tells the ORM what the table looks like. That lets you create instances and persist them, or turn a database row back into an object you can manipulate in memory.

Purely technical.

## 2. The Model in the program-design sense

For instance the "domain model" in Eric Evans's DDD.

Here it has nothing to do with technology: the Model is the result of the exercise of modelling the business. Its concepts, its rules, its invariants.

It can of course be implemented in code afterwards, but it lives well upstream: in a diagram, on a whiteboard, in conversations with the business.

## The classic trap

One word, in English as in French, for two things that have nothing in common.

And the classic trap is to believe that because you've written your Prisma Models, you've modelled your business. No. You've described your tables.

Keeping that clearly in mind avoids quite a few mistakes.
