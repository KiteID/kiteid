# KiteID Typography System

## Font Stack

| Role | Family | Source |
|---|---|---|
| Display & Body | **DM Sans** | [Google Fonts](https://fonts.google.com/specimen/DM+Sans) |
| Mono | **JetBrains Mono** | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) |

DM Sans is the official Kite ecosystem font. JetBrains Mono is used for addresses, hashes, code snippets, and developer surfaces.

### Loading

```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
>
```

### Self-hosted (preferred for production)

Download via [google-webfonts-helper](https://gwfh.mranftl.com/fonts) and serve from `/fonts/`. Use `font-display: swap` to avoid FOIT.

---

## Type Scale

| Style | Size | Weight | Line | Tracking | Use Case |
|---|---|---|---|---|---|
| **Display** | 72px | 800 | 1.0 | -0.04em | Hero headlines |
| **H1** | 48px | 700 | 1.1 | -0.03em | Page titles |
| **H2** | 36px | 700 | 1.2 | -0.02em | Section titles |
| **H3** | 24px | 600 | 1.3 | -0.01em | Subsections, card titles |
| **H4** | 20px | 600 | 1.4 | 0 | Small headings |
| **Body Large** | 18px | 400 | 1.6 | 0 | Lead paragraphs |
| **Body** | 16px | 400 | 1.6 | 0 | Default body |
| **Small** | 14px | 400 | 1.5 | 0 | Secondary text |
| **Caption** | 12px | 500 | 1.4 | +0.02em | Labels, metadata |
| **Mono** | 14px | 500 | 1.5 | 0 | Addresses, code |

### Mobile Adjustments

On screens ≤ 768px, scale down by ~20%:

| Style | Mobile Size |
|---|---|
| Display | 48px |
| H1 | 36px |
| H2 | 28px |
| H3 | 20px |
| Body | 16px (unchanged) |

---

## Tracking Rules

KiteID uses **negative tracking** on large display text and **positive tracking** on small uppercase labels. This is critical to the brand feel.

| Size Range | Tracking | Why |
|---|---|---|
| 48px+ | -0.03em to -0.04em | Tight, premium, "carved" feel |
| 24px–36px | -0.01em to -0.02em | Subtle tightening |
| 16px–20px | 0 (normal) | Maximum readability |
| 12px–14px (uppercase) | +0.02em to +0.04em | Open, label-like |
| Mono | 0 (normal) | Mono fonts have built-in spacing |

---

## Weight Hierarchy

DM Sans variable weights from 400–800 give us six steps. We use:

| Weight | Name | Use |
|---|---|---|
| 400 | Regular | Body, "Kite" in wordmark |
| 500 | Medium | Captions, labels |
| 600 | Semibold | H3, H4, button text |
| 700 | Bold | H1, H2 |
| 800 | Extrabold | Display, "ID" in wordmark |

We **never** use italics. Italic in DM Sans is technically available but breaks our antique-modern voice. Emphasis is done through weight, color (Bronze Mute), or background highlight.

---

## Special Treatments

### Domain Names

Domain names like `alice.kite` are always rendered in **mono font** (JetBrains Mono) to evoke the "address-like" nature of identity.

```
alice.kite       ← JetBrains Mono 500, Carbon
```

### Numbers / Stats

Big numbers use Display or H1 scale, but with **tabular figures** for alignment:

```css
font-feature-settings: "tnum" 1;
```

### Code

Inline code: JetBrains Mono 14px, Bronze Mute color, Sand Pale background, 4px radius padding.

Code blocks: JetBrains Mono 14px, Carbon text, Parchment bg, 12px radius, 16px padding.

---

## Tailwind Class Examples

Using the KiteID Tailwind preset:

```html
<!-- Hero headline -->
<h1 class="text-display text-text font-sans">
  Identity for the<br/>agentic economy.
</h1>

<!-- Subhead -->
<p class="text-body-lg text-text-muted">
  Claim your name on Kite blockchain.
</p>

<!-- Domain name -->
<span class="font-mono text-h3 text-text">
  alice.kite
</span>

<!-- Caption / metadata -->
<span class="text-caption text-text-muted uppercase tracking-wide">
  Owned by alice.kite · 2 days ago
</span>

<!-- Mono code -->
<code class="font-mono text-sm text-brand-secondary bg-bg-elevated px-2 py-1 rounded">
  0x9B8...564
</code>
```

---

## Accessibility

- **Minimum body size**: 16px (never smaller for primary content)
- **Minimum contrast**: WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus rings**: Always visible — Burnished Gold 2px outline
- **Line length**: 60–75 characters for body text (max-width on prose)

---

**Last updated:** 2026-04-08
