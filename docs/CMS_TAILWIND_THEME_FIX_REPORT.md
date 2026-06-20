# Rapport de correction — Tailwind olive Diamarket CMS

## Origine du problème

Le démarrage de `diamarket-cms` échouait avec l'erreur Tailwind suivante :

```txt
The `focus-visible:ring-olive-600` class does not exist
```

L'analyse a confirmé que `apps/diamarket-cms/src/app/globals.css` utilise plusieurs classes `olive-*`, notamment `focus-visible:ring-olive-600`, `bg-olive-700`, `hover:bg-olive-800` et des variantes en mode sombre. La configuration Tailwind du CMS ne déclarait toutefois qu'une seule nuance : `olive.700`. Les nuances `50`, `200`, `600`, `800`, `900` et `950` utilisées par l'interface n'existaient donc pas côté Tailwind.

Le fichier `apps/diamarket-cms/tailwind.config.js` n'existe pas dans ce projet ; la configuration active est `apps/diamarket-cms/tailwind.config.ts`.

## Palette retenue

La palette `olive` a été conservée et déclarée explicitement, car l'interface CMS utilise déjà cette identité visuelle pour la navigation, les boutons primaires, les liens d'administration et les états de focus.

Palette ajoutée :

```ts
olive: {
  50: "#f7f8f2",
  100: "#ecefdd",
  200: "#d9dfbb",
  300: "#c0ca8e",
  400: "#a6b260",
  500: "#8a9944",
  600: "#6f7c34",
  700: "#556B2F",
  800: "#464d23",
  900: "#3b411f",
  950: "#202412",
}
```

La nuance `700` conserve la couleur historique déjà présente (`#556B2F`) pour éviter une rupture visuelle.

## Fichiers modifiés

- `apps/diamarket-cms/tailwind.config.ts` : déclaration complète de la palette `olive` pour corriger toutes les classes `olive-*` utilisées dans le CMS.
- `apps/diamarket-web/tailwind.config.ts` : ajout de la même palette pour éviter une régression ultérieure, car `diamarket-web` utilise aussi des classes `text-olive-700` et `text-olive-800`.

## Impact visuel

L'identité Diamarket est conservée : les boutons primaires, liens, focus rings, zones de navigation et accents restent sur une teinte olive cohérente. Les états manquants utilisent maintenant des nuances progressives plutôt qu'un remplacement vers `lime`, `emerald` ou `green`, ce qui limite l'impact visuel.

Aucune capture d'écran n'a été ajoutée : la correction est une correction de thème Tailwind sans changement structurel d'interface.

## Nettoyage cache

Le dossier de cache/build `apps/diamarket-cms/.next` a été supprimé après correction afin d'éviter une compilation basée sur des artefacts obsolètes.

## Résultat build final

La commande de validation demandée est :

```bash
npm --prefix apps/diamarket-cms run build
```

Résultat dans cet environnement : la validation Tailwind n'atteint plus l'erreur `focus-visible:ring-olive-600`, mais la commande échoue avant compilation effective parce que le binaire `next` est absent (`sh: 1: next: not found`). Une tentative `npm --prefix apps/diamarket-cms ci --ignore-scripts --prefer-offline --no-audit --no-fund` a été lancée pour restaurer les dépendances, mais elle est restée bloquée dans cet environnement après les avertissements npm/Node et a dû être interrompue.
