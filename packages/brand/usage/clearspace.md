# Clear Space & Sizing

The KiteID wordmark and icon need breathing room to function. This document defines the minimum clear space and sizing rules.

---

## Wordmark Clear Space

The clear space around the wordmark is defined by the **height of the "K"** in "Kite". Call this measurement `X`.

```
        ┌──── X ────┐
        │           │
   X │  ╔═══════════╗  │ X
        │  KiteID   │
        ╚═══════════╝
        │           │
        └──── X ────┘
```

### Rules

- **Minimum clear space**: 1×X on all four sides
- **Preferred clear space**: 1.5×X on all four sides
- **In headers/navigation**: 1×X minimum
- **In hero sections**: 2×X for breathing room

No other element — text, image, button, border — may enter this clear space.

---

## Icon Clear Space

The icon (favicon orb) clear space is defined by **20% of the icon's height**. Call this `Y`.

```
   ┌─── Y ───┐
   │         │
Y  │   (●)   │  Y
   │         │
   └─── Y ───┘
```

### Rules

- **Minimum clear space**: 0.2×height on all four sides
- The icon already has built-in padding via the rounded square background — respect this and don't overlap it.

---

## Minimum Sizes

### Wordmark

| Context | Minimum width |
|---|---|
| Desktop web | 120px |
| Mobile web | 96px |
| Print (300dpi) | 32mm |
| Embroidery | 40mm |
| Favicon usage | ❌ Use icon instead |

Below 96px wide, the weight contrast between "Kite" (400) and "ID" (800) becomes muddled. Use the icon at smaller sizes.

### Icon

| Context | Minimum size |
|---|---|
| Browser favicon | 16x16px |
| App icon | 32x32px |
| Social avatar | 400x400px (recommended 1024x1024) |
| Print | 12mm |

---

## Maximum Sizes

There is no maximum size, but consider:

- **Hero sections**: don't exceed 400px wide for the wordmark — it dominates layout
- **Display screens / billboards**: any size, but maintain proportions
- **Premium gradient variant**: best between 200–600px wide where the gradient is visible

---

## Aspect Ratios (locked)

| Asset | Aspect ratio | Notes |
|---|---|---|
| Wordmark | 4:1 (320×80) | Always horizontal |
| Favicon | 1:1 (256×256) | Always square |
| Icon mark | 1:1 (256×256) | Always square |
| OG image | 1.91:1 (1200×630) | Standard social card |
| Twitter card | 2:1 (1200×600) | Twitter summary card |

Never crop, stretch, or distort to fit other ratios. Add background space instead.

---

## Practical Examples

### Website Header
```
┌─────────────────────────────────────────────┐
│  [1×X clear]  KiteID  [1×X clear]  · · ·    │
└─────────────────────────────────────────────┘
```

### Hero Section
```
┌─────────────────────────────────────────────┐
│                                             │
│              [2×X clear]                    │
│                                             │
│              KiteID                         │
│                                             │
│              [2×X clear]                    │
│                                             │
│   Identity for the agentic economy.         │
│                                             │
└─────────────────────────────────────────────┘
```

### Footer
```
┌─────────────────────────────────────────────┐
│  KiteID                       © 2026         │
│  [1×X clear]                                 │
└─────────────────────────────────────────────┘
```

### Co-branding
```
[ Kite logo ]  │  KiteID
↑              ↑
1×X clear      1×X clear
on the outside on the outside
```

---

**Last updated:** 2026-04-08
