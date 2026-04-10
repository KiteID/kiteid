# KiteID Brand Guidelines

> Identity for the agentic economy.

This document defines the visual and verbal identity of KiteID. Every surface — from the website and dashboard to social posts and developer docs — should follow these principles.

---

## 1. Brand Essence

**KiteID** is the identity and naming layer of the Kite blockchain. It gives humans and AI agents human-readable names, payment routes, and verifiable identity in the agentic economy.

### Positioning
> KiteID is to Kite what ENS is to Ethereum — but built natively for the agentic economy where AI agents transact, identify, and govern themselves.

### Mission
Make every actor in the agentic economy — human or agent — discoverable, addressable, and trustworthy through one universal identity layer.

### Tagline
**Identity for the agentic economy.**

### Voice & Tone
- **Confident** but not arrogant
- **Technical** but accessible
- **Premium** but not exclusive
- **Crypto-native** but enterprise-friendly
- **Antique-modern** — wisdom-coded language without being stuffy

We don't say "revolutionary," "game-changing," or "next-gen." We don't use rocket emojis or generic crypto hype. We let the parchment do the talking.

---

## 2. Visual Heritage

KiteID's visual language inherits directly from Kite blockchain's brand DNA:

- **Bronze Core `#9B8564`** and **Sand `#DBD5C7`** are taken straight from Kite's logo gradient.
- The **warm parchment aesthetic** signals continuity with Kite ecosystem.
- Our differentiator is the **Burnished Gold `#C9986A`** accent — a signature distinct enough to be ours but harmonious with Kite's palette.

This is intentional. KiteID is not a separate brand competing with Kite — it is the natural identity layer of the same family. When placed side by side, KiteID and Kite should feel like siblings.

---

## 3. Color System

### Primary Palette

| Token | Hex | Usage |
|---|---|---|
| Cream Light | `#FAF7F0` | Page background |
| Parchment | `#F5F0E4` | Card / section background |
| Sand Pale | `#EDE8DC` | Elevated cards, hover surfaces |
| Sand Soft | `#E4DDC9` | Subtle dividers, muted bg |
| Sand Core | `#DBD5C7` | Borders (Kite heritage) |
| Sand Mid | `#C9C0A6` | Strong borders |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| Carbon | `#141414` | Primary headings & body |
| Charcoal | `#2A2A2A` | Secondary text |
| Graphite | `#4A4A4A` | Tertiary text |
| Stone | `#6B665C` | Captions, metadata |
| Bronze Mute | `#9B8564` | Accent text, links (Kite heritage) |
| Disabled | `#B8B0A0` | Disabled state |

### Brand Accents

| Token | Hex | Usage |
|---|---|---|
| **Burnished Gold** | `#C9986A` | Signature accent, primary CTA |
| Antique Brass | `#A87C52` | Hover/pressed gold |
| Gold Glow | `#E8B987` | Highlights, premium subtle bg |
| Bronze Core | `#9B8564` | Kite heritage, secondary brand |
| Bronze Deep | `#7A6849` | Depth, dark accents |
| Cream Accent | `#F5E8D4` | Notice background, warm hover |

### Semantic Colors

| Purpose | Foreground | Background |
|---|---|---|
| Available / Success | `#5A7A50` | `#E8EFE2` |
| Taken / Error | `#A8453C` | `#F5E2DF` |
| Warning | `#B8722E` | `#F5E8D4` |
| Info | `#4A6F8A` | `#E0E8EF` |
| Premium | gradient `#C9986A → #9B8564` | `#FAF7F0` |

### Gradients

```css
/* Kite Heritage — taken from Kite logo */
background: linear-gradient(135deg, #9B8564 0%, #DBD5C7 100%);

/* KiteID Premium Gold — our signature */
background: linear-gradient(135deg, #A87C52 0%, #C9986A 50%, #E8B987 100%);

/* Aged Bronze — premium domain card */
background: linear-gradient(180deg, #C9986A 0%, #9B8564 50%, #7A6849 100%);

/* Parchment Subtle — page background warmth */
background: linear-gradient(180deg, #FAF7F0 0%, #F5F0E4 100%);
```

### Shadows

All shadows are **bronze-tinted**, never pure black. This keeps surfaces feeling warm and integrated.

```css
--shadow-sm:   0 1px 2px rgba(155, 133, 100, 0.08);
--shadow-md:   0 4px 12px rgba(155, 133, 100, 0.12);
--shadow-lg:   0 12px 32px rgba(155, 133, 100, 0.16);
--shadow-xl:   0 24px 64px rgba(155, 133, 100, 0.20);
--shadow-glow: 0 0 40px rgba(201, 152, 106, 0.30);
```

---

## 4. Typography

### Font Stack

| Role | Family | Weights | Source |
|---|---|---|---|
| Display & Headings | **DM Sans** | 400, 500, 600, 700, 800 | Google Fonts |
| Body | **DM Sans** | 400, 500 | Google Fonts |
| Mono (addresses, code) | **JetBrains Mono** | 400, 500 | Google Fonts |

DM Sans is the official Kite ecosystem font. We honor that.

### Type Scale

See `typography/type-scale.md` for the complete scale. Key sizes:

| Style | Size | Weight | Line | Tracking |
|---|---|---|---|---|
| Display | 72px | 800 | 1.0 | -0.04em |
| H1 | 48px | 700 | 1.1 | -0.03em |
| H2 | 36px | 700 | 1.2 | -0.02em |
| H3 | 24px | 600 | 1.3 | -0.01em |
| Body Large | 18px | 400 | 1.6 | 0 |
| Body | 16px | 400 | 1.6 | 0 |
| Caption | 12px | 500 | 1.4 | 0.02em |

### Tracking Rule

Display and large headings always use **negative tracking** (`-0.02em` to `-0.04em`). Captions and small uppercase labels use **positive tracking** (`+0.02em` to `+0.04em`). Body stays at zero.

---

## 5. Logo

### Wordmark

The KiteID wordmark consists of two parts joined with zero spacing:

```
Kite ID
weight 400 + weight 800
```

- "Kite" — DM Sans 400 (regular)
- "ID" — DM Sans 800 (extrabold)
- Letter spacing: -0.02em
- The weight contrast IS the brand signature

### Default Color Variant (light backgrounds)

- "Kite" → Carbon `#141414`
- "ID" → **Burnished Gold `#C9986A`** (signature accent)

### Mono Variants

- **Mono dark** — both parts in Carbon `#141414` for high-contrast or print
- **Mono light** — both parts in Cream Light `#FAF7F0` for dark contexts
- **Premium** — both parts in bronze gradient (rare hero contexts only)

### Icon / Favicon

A glowing **Burnished Gold orb** centered on a **Carbon `#141414`** circular background. The orb represents an "identity node" — a single point of presence in the agentic web.

The icon is intentionally distinct from the wordmark so it works at favicon scale (16x16, 32x32) and as social media avatars (1024x1024) without losing meaning.

### Usage

See `usage/do-and-dont.md` and `usage/clearspace.md` for the complete rules.

---

## 6. Iconography

Use **Lucide** as the primary icon set. It is open source, comprehensive, and stylistically clean. Stroke width: `1.5` for all icons unless specifically called out.

For decorative or marketing illustrations, prefer **custom hand-drawn line art** over stock illustrations or generic AI-generated imagery. The aesthetic should feel hand-crafted, like ink on parchment.

**Never use:**
- Emojis in product UI
- 3D renders / generic crypto art
- Stock photo people
- Generic AI gradient mesh backgrounds

---

## 7. Photography & Imagery

Photography is rare on KiteID surfaces, but when used:
- Warm, golden hour lighting only
- Earth tones, stone, paper, wood, leather
- Avoid blue/cool tones
- Light grain / film texture welcome
- No corporate stock imagery

For abstract / hero imagery, prefer:
- Subtle parchment textures
- Bronze gradient meshes (very subtle)
- Hand-drawn line illustrations
- Topographic / contour line patterns in Sand tones

---

## 8. Motion

KiteID motion language is **calm, deliberate, and warm**. We don't bounce, glow neon, or spin.

### Easing
- Default: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- Spring: spring(stiffness: 260, damping: 30) — only when needed

### Duration
- Micro (hover): 150ms
- Standard (transitions): 250ms
- Macro (page changes): 400ms

### Patterns
- **Hover**: opacity shift `100% → 80%`, never scale
- **Press**: opacity `100% → 70%` + 1px translate-y
- **Reveal**: 8px translate-y + opacity fade-in
- **Loading**: gentle pulse on Sand Pale, never spinners with neon

---

## 9. Voice Examples

✅ **Good**
- "Claim your name on Kite."
- "alice.kite is available."
- "Your identity, anywhere on the agentic web."
- "Names that pay. Pay names."
- "Inscribed on Kite. Owned by you."

❌ **Avoid**
- "🚀 The next-gen identity layer is HERE!"
- "Revolutionary Web3 naming protocol"
- "Buy your domain NOW before it's gone!!"
- "Powered by AI 🤖 blockchain magic ✨"
- Anything with rocket, fire, or 100 emoji

---

## 10. Brand Don'ts

- **Don't** use the Kite logo as if it were ours. We are an ecosystem project, not Kite Foundation.
- **Don't** rebrand to neon, cyber, or sterile minimalism.
- **Don't** introduce blue, purple, or cool gray accents.
- **Don't** use pure white `#FFFFFF` as page background — always Cream Light.
- **Don't** use pure black `#000000` for body text — always Carbon.
- **Don't** stretch, rotate, recolor, or add effects to the wordmark.
- **Don't** combine the wordmark with the icon orb side-by-side (they are separate marks).

---

## 11. Trademark & Attribution

"KiteID" is a project name. The KiteID brand assets in this repository may be used by:
- Press and media for editorial coverage
- Ecosystem partners with attribution
- Developers building on KiteID
- Community members with non-commercial intent

For commercial co-branding or partnership inquiries, contact `brand@kiteid.xyz`.

---

## 12. File Versioning

This brand kit is versioned. The current version is documented in `/colors/palette.json` under `$meta.version`. Breaking changes (palette shifts, logo redraws) require a major version bump and changelog entry.

---

**Last updated:** 2026-04-08
**Version:** 1.0.0
**Maintained by:** KiteID core team
