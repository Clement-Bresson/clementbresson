---
title: "Combien de vos règles d’architecture cassent le build ?"
description: "Avec l’IA, une architecture standardisée devient un atout : chaque règle vérifiable par une machine est une contrainte, les autres ne sont que des intentions."
pubDate: 2026-08-30
tags: ["architecture", "ai-harnesses"]
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7499770330241118208/
sources:
  - title: "no-restricted-imports (ESLint rule)"
    url: https://eslint.org/docs/latest/rules/no-restricted-imports
draft: false
---

Quelle architecture permet un usage robuste et continu de l’IA malgré une mise à l’échelle ?

Celle qui apporte un maximum de règles vérifiables par une machine, de façon déterministe.

## La verbosité n’est plus le problème

On reproche souvent aux architectures structurées ([Clean Architecture](/fr/blog/what-is-clean-architecture/), Hexagonale, DDD…) d’être verbeuses. Mais avec l’IA, cela devient de moins en moins un problème. Le coût d’écriture dégringole… pendant que celui de lire et vérifier explose.

Et là, l’architecture ultra standardisée devient un atout, malgré sa potentielle verbosité.

Une IA produit du code qui ressemble à du code juste… très souvent sans l’être. La défense pour passer à l’échelle n’est pas une relecture ligne par ligne (vous ne tiendrez pas le rythme, et personne n’est infaillible) mais un [harnais](/fr/blog/ai-harness-guides-and-sensors/) qui valide si oui ou non le code est correct.

## Une intention contre une contrainte

Exemple de règle : le code métier du domaine n’importe rien de l’infrastructure (si on fait de la Clean Architecture ou de l’Hexagonale, par exemple).

Cette règle dans un README ou un CLAUDE.md, c’est une **intention**. Mieux que rien… mais souvent non lue ou ignorée.

Placée dans une config, elle devient une **contrainte** :

```js
// eslint.config.js, appliqué aux fichiers src/domain/**
"no-restricted-imports": ["error", {
  patterns: ["**/infrastructure/**", "pg", "express"]
}]
```

La règle ne peut plus être contournée.

## Le réflexe pour démarrer un projet en 2026

C’était déjà vrai avant… mais ça l’est encore plus aujourd’hui.

Une fois choisie une architecture cohérente avec le projet (un CRUD n’a pas besoin d’une Clean Architecture avec du DDD…), elle doit être standardisée à outrance.

Pour chaque règle :

- **Le Graal** : la rendre impossible à contourner, comme dans l’exemple ci-dessus.
- **Le fallback** (certaines règles ne peuvent tout simplement pas être imposées par un harnais) : une régularité telle que le prompt tient en deux lignes, et que toute divergence saute aux yeux.

Demain, posez-vous la question : combien de vos règles d’architecture cassent le build ?

Les autres sont en réalité des intentions.

[dependency-cruiser](/fr/blog/dependency-cruiser-as-a-sensor-for-ai-agents/) applique la même idée à l’ensemble du graphe d’imports.

Le même réflexe vaut pour la [séparation des données entre clients d’un SaaS](/fr/blog/multi-tenant-data-isolation-four-levels/) : un tenant omis doit rendre zéro donnée, pas une fuite.

Un [framework opinionated](/fr/blog/opinionated-frameworks-as-ai-harnesses/) applique déjà une partie de ces contraintes avant même que vous en écriviez une seule.

Un [ADR](/fr/blog/architecture-decision-records/) documente les intentions qui ne peuvent pas devenir une contrainte : ça n'empêchera pas un contournement, mais ça laisse une trace écrite et datée de pourquoi la règle existe.

PS : une règle qui passe ne dit pas que la règle est bonne. Réfléchir et faire les bons choix pour le contexte de chaque projet n’est pas en option.
