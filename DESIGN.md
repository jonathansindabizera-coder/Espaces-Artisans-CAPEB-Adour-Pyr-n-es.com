# Système de design — Espace Artisan CAPEB

## Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--capeb-red` | #E2001A | Rouge marque, boutons principaux |
| `--capeb-red-dark` | #B00013 | Bas du dégradé sidebar, hover boutons |
| `--capeb-red-deeper` | #8A000F | Pressed state |
| `--capeb-ink` | #1A1714 | Texte principal |
| `--capeb-secondary` | #4A453F | Texte secondaire |
| `--capeb-muted` | #8B847D | Texte discret, placeholders |
| `--capeb-bg` | #FAF8F5 | Fond général de l'app |
| `--capeb-card` | #FFFFFF | Fond des cartes |
| `--capeb-border` | #ECE7E1 | Bordures au repos |
| `--capeb-border-hover` | #E2DCD4 | Bordures au survol |

### Statuts
| Statut | Couleur texte | Fond badge |
|---|---|---|
| Vert (terminé, succès) | #1E8E55 | #E7F4EC |
| Ambre (en attente) | #D98A00 | #FBF1DE |
| Bleu (en cours) | #2563C9 | #E8EFFB |
| Violet (à signer) | #6D4AC4 | #EEE9FA |
| Rouge (action requise) | #E2001A | #FDECEA |

## Typographie

- **Titres** : Oswald, MAJUSCULES, `font-display`
- **Corps** : Work Sans, `font-sans`
- Titre de page : 30px (text-3xl)
- Chiffres clés : 36px (text-4xl)
- Corps standard : 14px (text-sm)
- Labels discrets : 11-12px

## Espacement

Multiples de 4px. Padding cartes : 20px (p-5). Gap entre cartes : 16px (gap-4).

## Formes & profondeur

- Arrondi cartes : 14px (rounded-[14px])
- Arrondi boutons : 10px (rounded-[10px])
- Arrondi pastilles : 8px (rounded-lg) ou full (rounded-full)

### 3 niveaux de surface
1. Fond app teinté `#FAF8F5`
2. Cartes blanches `#FFFFFF` avec ombre douce
3. Éléments en relief (boutons, badges) avec ombre plus marquée

### Ombres
```css
--shadow-card: 0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05);
--shadow-card-hover: 0 4px 12px rgba(26,23,20,.10), 0 12px 28px rgba(26,23,20,.08);
--shadow-btn: 0 1px 3px rgba(26,23,20,.15), 0 2px 6px rgba(26,23,20,.10);
```

## Micro-interactions

- Transitions : `150ms ease` sur hover/focus
- Cartes : translateY(-2px) au survol + ombre renforcée
- Boutons : légère compression (scale 0.98) au clic
- Focus ring : 2px offset, couleur rouge CAPEB
- Cascade de cartes : animation-delay progressif (0ms, 50ms, 100ms…)

## Composants clés

### Bouton principal
- Fond : dégradé `#EA1227 → #D2001A`
- Hover : `#D2001A → #B00013`
- Arrondi : 10px, hauteur min 44px
- Ombre légère

### Sidebar
- Dégradé vertical `#E2001A → #B00013`
- Fine ombre interne droite
- Onglet actif : pastille blanche, texte rouge, ombre douce
- Logo : carré blanc arrondi + marteau rouge

### Cartes de stat
- Icône dans pastille colorée (rouge/bleu/ambre/vert)
- Grand chiffre Oswald
- Ligne de contexte en texte discret

### Badges de statut
- Texte coloré + fond teinté de la même couleur
- Padding : px-2 py-0.5, arrondi full

## Règle d'or
Le rouge est réservé à la marque et aux actions principales.  
Le contenu respire sur fond clair — jamais de rouge omniprésent.
