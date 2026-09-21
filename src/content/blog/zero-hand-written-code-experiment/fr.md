---
title: "Zéro ligne de code écrite à la main : mon expérience"
description: "J'ai relevé le défi d'écrire un programme sans taper une seule ligne moi-même, en poussant le harnais IA à son maximum, inspiré par une expérience d'OpenAI."
pubDate: 2026-09-21
tags: ["ai-harnesses", "architecture"]
sources:
  - title: "Harness engineering: leveraging Codex in an agent-first world"
    author: "Ryan Lopopolo"
    year: 2026
    url: https://openai.com/index/harness-engineering/
  - title: "AGENTS.md"
    url: https://agents.md/
draft: false
---

Écrire un programme avec **ZÉRO** ligne à la main ?

C'est le défi que je me suis lancé récemment.

L'idée : non pas pousser le vibe coding dans ses retranchements (bien que ça y ressemble drôlement) mais pousser le [harnais](/fr/blog/ai-harness-guides-and-sensors/) à son maximum :)

Ça m'est venu d'un post passionnant sur une expérience similaire lancée par les équipes d'[OpenAI](https://openai.com/index/harness-engineering/) en août 2025 (3 ingénieurs à temps plein, 5 mois, ~1M de lignes de code, 0 écrite à la main... et un outil à présent fortement utilisé en interne chez OpenAI).

Pour rappel, le harnais, c'est tout ce qu'il y a autour du modèle en agentic coding : le contexte, l'environnement, les specs, les capteurs de vérification, les tools... etc (sujet vaste, j'y reviendrai).

Et le but est simple : j'utilise **exclusivement** des agents pour coder, et dès que ça dérive ou ne fait pas ce que je veux, j'essaie de trouver comment modifier le harnais pour que ça fasse mieux au 2ᵉ run... et aux 100 suivants.

Exemple tout bête : l'agent m'invente une convention de nommage.

→ nettoyage de la codebase (il recopie ce qu'il voit...) + une règle dans le [AGENTS.md](https://agents.md/) + un script de création de template déterministe.

Une règle d'import non respectée ?

→ [une règle en dur dans la config](/fr/blog/architecture-rules-that-break-the-build/). Pas une consigne : un truc qui casse si on triche.

Et petit à petit, je commence à voir émerger des skills, scripts, templates, [règles d'archi](/fr/blog/dependency-cruiser-as-a-sensor-for-ai-agents/), lint custom... etc qui viennent cadrer les agents... pour produire extrêmement vite tout en gardant le contrôle.

Attention, ça demande une rigueur tout aussi importante voire plus qu'avant. Ça crame le cerveau à grande vitesse, ça touche énormément de sujets où il y a 50 façons créatives de répondre.

Et ça crame beaucoup plus de tokens que je ne voudrais.

Je vous tiendrai au courant des résultats !
