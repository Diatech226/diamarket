# Guide de Style Frontend - Écosystème Diamarket

Ce document définit les standards visuels et techniques pour l'intégration du frontend, basés sur le système de design **Diamarket Admin** et l'identité **Aura Luxury**.

## 1. Identité Visuelle & Couleurs

Le projet utilise une palette "Luxe & Tech" combinant des tons profonds et des surfaces claires pour une lisibilité optimale.

### Palette de Couleurs (Mode Clair)
| Rôle | Code Hex | Usage |
| :--- | :--- | :--- |
| **Primaire** | `#0058BE` | Actions principales, boutons CTA, liens actifs. |
| **Accent** | `#F59E0B` | Alertes, notifications, indicateurs de mise en avant. |
| **Surface** | `#F8F9FF` | Fond de page principal. |
| **Conteneur** | `#FFFFFF` | Cartes, sections blanches, zones de contenu. |
| **Bordure** | `#E2E8F0` | Séparateurs, bordures d'inputs, contours de cartes. |
| **Texte (Dark)** | `#0F172A` | Titres (Headlines) et texte principal. |
| **Texte (Muted)** | `#64748B` | Texte secondaire, labels, descriptions. |

---

## 2. Typographie

Le système repose sur deux familles de polices distinctes pour marquer la hiérarchie entre l'administration et la vitrine.

### Polices
- **Admin Console** : `Inter` (Sans-serif) - Moderne, neutre et hautement lisible pour les données.
- **Vitrine Estelle (Aura)** : `Playfair Display` (Serif) - Élégante et statutaire pour les titres de marque.

### Échelle Typographique (Mobile & Desktop)
- **Display L** : `Inter Bold`, 32px / `Playfair Display`, 40px (Hero Titles)
- **Headline M** : `Inter SemiBold`, 24px (Titres de sections)
- **Body M** : `Inter Regular`, 16px (Corps de texte principal)
- **Label S** : `Inter Medium`, 12px / Uppercase (Petits titres, badges, métadonnées)

---

## 3. Composants & États Graphiques

### Boutons (CTA)
- **Primary** : Background `#0058BE`, Texte `#FFFFFF`, Radius `4px`.
- **Secondary** : Border `1px solid #E2E8F0`, Background `Transparent`, Texte `#0F172A`.
- **Hover State** : Opacité `90%` ou léger assombrissement du fond.

### Champs de Saisie (Inputs)
- **Style** : Bordure `#E2E8F0`, Fond `#FFFFFF`.
- **Focus** : Bordure `#0058BE`, Outline léger (Ring).
- **Error** : Bordure `#EF4444`, Message d'erreur en rouge.

---

## 4. Spacing & Grille

Le système utilise une base de **8px** (8, 16, 24, 32, 48, 64) pour garantir la cohérence des marges.

- **Gutter (Mobile)** : `16px`
- **Gutter (Desktop)** : `24px` ou `32px`
- **Section Gap** : `48px` à `64px` sur Desktop.

---

## 5. Assets & Iconographie

- **Format** : Utiliser exclusivement des icônes vectorielles (SVG).
- **Style** : `Material Symbols Rounded` ou icônes linéaires fines (1.5px à 2px de trait).
- **Couleurs** : Suivre la hiérarchie du texte (`#0F172A` pour le fonctionnel, `#0058BE` pour l'actif).

---
*Ce document sert de spécification technique pour l'intégration CSS/Tailwind et la création de la bibliothèque de composants React/Vue.*
