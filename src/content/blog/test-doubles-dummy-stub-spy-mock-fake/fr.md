---
title: 'Dummy, stub, spy, mock, fake : cinq doublures, une seule question'
description: 'Les cinq types de doublures de test se confondent facilement. Une question posée à la doublure, tirée de Meszaros, suffit à les distinguer pour de bon.'
pubDate: 2026-08-29
tags: ['testing']
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7499465319887867904/
sources:
  - title: 'Test Double (xUnit Test Patterns)'
    author: 'Gerard Meszaros'
    year: 2007
    url: http://xunitpatterns.com/Test%20Double.html
  - title: 'Test Double'
    author: 'Martin Fowler'
    year: 2006
    url: https://martinfowler.com/bliki/TestDouble.html
draft: false
---

Dummy, stub, spy, mock, fake.

Tous désignent une doublure (« test double » chez les Anglais, soit une version d'un élément dédiée au test), mais il est fréquent de les confondre (moi le premier).

Or, pour bien communiquer entre développeurs (ou avec l'IA), il est important d'être précis.

Pour trancher, il suffit de retenir une question posée à la doublure. Gerard Meszaros la présente en 2007 : « à quoi sert cette doublure par rapport à ce qui **entre** et ce qui **sort** du code testé ? »

## Ce qui entre, ce qui sort

Commençons par définir ces deux notions.

- **Ce qui entre** : la data que le code reçoit de ses dépendances. Par exemple l'heure que lui donne l'horloge, une valeur reçue d'une API.
- **Ce qui sort** : les appels que le code émet vers ses dépendances. Un email envoyé, une ligne écrite en base.

Maintenant, si on reprend la question, on peut facilement définir la doublure de cinq façons.

## 1. Dummy : la doublure n'est jamais appelée

Elle est là pour être là. Par exemple elle est requise en paramètre pour que le code compile ou soit instancié, mais inutilisée pour le test. Elle n'a besoin d'aucune implémentation.

Métaphore : un figurant au cinéma.

## 2. Stub : il contrôle ce qui entre

Il est configuré en amont pour retourner une valeur, mais on ne vérifie rien sur lui. L'assertion du test porte sur ce que le code testé a produit avec cette valeur.

Par exemple : une horloge figée à une date précise, pour tester le calcul d'expiration d'une réservation.

Métaphore : un texte dicté dans l'oreillette.

## 3. Spy : il enregistre ce qui sort, et cet enregistrement est lu après

Il note les appels reçus. Et une fois le code exécuté, le test vient dépouiller ce registre et fait ses assertions.

Métaphore : la boîte noire d'un avion.

## 4. Mock : il connaît d'avance ce qu'il doit recevoir, avant le test

On configure le mock **avant** l'exécution avec les appels qu'il attend. Et c'est lui qui fait échouer le test, à la première déviation, pendant l'exécution.

La différence fondamentale avec le spy est le timing et le fonctionnement : le mock fait lui-même ses assertions en cours de test, là où le spy est vérifié a posteriori.

Métaphore : l'alarme préréglée.

## 5. Fake : il fonctionne vraiment

Une implémentation qui fonctionne vraiment, mais de façon dédiée au test, et qui ne conviendrait pas à la prod.

Métaphore : le simulateur de vol. Il vole vraiment, il ne décolle pas.

## L'arbre complet

- Jamais appelé ? **Dummy.**
- Une vraie implémentation ? **Fake.**
- Vous contrôlez ce qui entre ? **Stub.**
- Vous relisez ce qui sort, après ? **Spy.**
- Vous le déclarez avant, et il peut râler tout seul ? **Mock.**

## Une doublure peut être plusieurs choses

Considération importante : une doublure peut cumuler plusieurs rôles. Exemples :

- un Fake dont une méthode agit comme un Spy ;
- une doublure qui est un Stub et un Spy (on vérifie qu'elle est appelée **et** elle donne de la data au code testé).

Certaines combinaisons sont en revanche impossibles : un spy ne peut pas être un mock.

Reste à savoir laquelle utiliser : [trois questions](/fr/blog/choosing-the-right-test-double/) suffisent à choisir le bon outil pour un test donné.
