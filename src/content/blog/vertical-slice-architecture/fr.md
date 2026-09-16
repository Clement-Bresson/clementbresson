---
title: "Vertical Slice Architecture : ranger le code par requête"
description: "Ajouter un champ touche six fichiers dans quatre dossiers ? La fonctionnalité n'est rangée nulle part. La VSA de Jimmy Bogard range le code par requête."
pubDate: 2026-09-02
tags: ['architecture']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7500990856124874752/
sources:
  - title: 'Vertical Slice Architecture'
    author: 'Jimmy Bogard'
    year: 2018
    url: https://www.jimmybogard.com/vertical-slice-architecture/
draft: false
---

Dans ton programme, tu ajoutes un champ à un formulaire et ça te fait changer six fichiers dans quatre dossiers.

Dossier controllers, dossier services, dossier repositories, dossier modèles. Quand le code est rangé par rôle technique, la fonctionnalité, elle, n'est rangée nulle part : elle est éparpillée.

## Une requête = un dossier

La Vertical Slice Architecture (VSA) inverse le critère de rangement. Tu ne ranges plus par rôle technique mais par requête.

Une requête = un dossier, dans lequel se trouve tout ce qu'il faut pour y répondre, du HTTP jusqu'au SQL.

```
features/users/create
features/users/delete
features/payment/send-link
...
```

Le terme vient de Jimmy Bogard, dans [un billet de blog du 19 avril 2018](https://www.jimmybogard.com/vertical-slice-architecture/). Le texte fondateur se lit en trois minutes, et je recommande de le lire si le sujet vous intéresse. Voici l'idée :

> L'architecture est construite par requêtes distinctes, chacune encapsulant et regroupant toutes ses préoccupations, du front-end jusqu'au back.

## Chaque tranche décide pour elle-même

Jusque-là, ce n'est qu'un déplacement de fichiers. La vraie idée arrive juste après :

Chaque tranche décide par elle-même comment répondre au mieux à sa requête.

- Une feature ultra simple ? Un transaction script avec du SQL direct. Pas de Service, pas de Repository.
- Une feature avec des règles métier complexes ? On peut sortir nos plus beaux designs complexes (parce que c'est utile ici, pas pour faire beau).

Chaque feature utilise exactement la complexité dont elle a besoin.

Et la vraie VSA recommande de ne partager entre les features que le strict minimum possible. Essayer de faire DRY irait à l'encontre de la stratégie.

## Avantages

- Ajouter une fonctionnalité = ajouter des fichiers, ne plus en modifier. Pas d'effet de bord.
- Lire une fonctionnalité = ouvrir un dossier et tout avoir dedans.
- Supprimer une fonctionnalité = supprimer un dossier.

## Désavantages

- Du code qui se ressemble sans être partagé.
- Un même problème dans deux features peut être résolu de deux façons différentes.
- Il faut savoir repérer quand refactorer une feature (le transaction script a ses limites).
- Globalement, pas DRY du tout.

## À quoi ça s'oppose ?

À l'idée d'avoir une architecture unique imposée à l'entièreté d'un programme.

- Pas de [Clean Architecture](/fr/blog/what-is-clean-architecture/) + DDD partout.
- Pas d'Architecture Hexagonale partout.
- Pas de Transaction Script partout (quelqu'un a déjà essayé ?).

Sur ton projet actuel, est-ce que l'architecture choisie (en espérant qu'il y en ait une) est pertinente partout ?

PS : je n'ai pas encore d'avis tranché sur la question. J'ai un peu expérimenté avec la VSA, mais moins qu'avec des architectures plus répandues (Clean Architecture + DDD notamment). Donc si des personnes ont fait de la VSA sur de gros projets, et sur la durée, ce serait génial d'avoir des retours.

Bon designs !
