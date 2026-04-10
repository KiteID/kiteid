# Logo Usage — Do & Don't

## Wordmark

### ✅ DO

- Use the **default wordmark** (`kiteid-wordmark.svg`) on Cream Light or Parchment backgrounds.
- Use **mono dark** for print, embroidery, or single-color contexts.
- Use **mono light** on Carbon, dark images, or video overlays.
- Maintain the **clear space** rule (see `clearspace.md`).
- Keep "Kite" and "ID" exactly as designed — `Kite` in 400 weight, `ID` in 800 weight, zero spacing between them.
- Render the wordmark in **DM Sans** when reproducing manually. If DM Sans is unavailable, use the SVG file directly.

### ❌ DON'T

- Don't add a tagline directly under the wordmark in the same lockup. Tagline lives separately.
- Don't change the weight contrast (e.g. both bold or both light).
- Don't add a space between "Kite" and "ID" (`Kite ID` ❌ → `KiteID` ✅).
- Don't change the color of "Kite" without also adjusting "ID" to match the variant rules.
- Don't apply effects: drop shadow, outline, glow, bevel, gradient (except the official premium gradient variant).
- Don't rotate, skew, or stretch the wordmark.
- Don't place the wordmark on busy photographic backgrounds.
- Don't recolor "ID" to anything other than: Burnished Gold (default), Carbon (mono), Cream Light (mono light), or Bronze Core (Kite-aligned variant).

---

## Icon / Favicon

### ✅ DO

- Use the **`kiteid-favicon.svg`** for browser favicons, app icons, and social media avatars (1024x1024).
- Use the **`kiteid-icon-mark.svg`** for in-product icons or when you need a transparent background.
- Always preserve the **Carbon background + Burnished Gold orb** combination for the favicon variant.
- Round the favicon corners using the `rx="56"` value already in the SVG (matches iOS/Android icon standards).

### ❌ DON'T

- Don't combine the icon and wordmark side by side in a single lockup. They are separate marks designed for different contexts.
- Don't use the icon as a hero element on the website — that's the wordmark's job.
- Don't recolor the orb. The Burnished Gold gradient is locked.
- Don't add text inside or around the orb.
- Don't put the orb on a non-Carbon background unless using the standalone `icon-mark` variant.

---

## Color Pairing

### ✅ Approved combinations

| Foreground (Logo) | Background |
|---|---|
| Default (Carbon + Gold ID) | Cream Light `#FAF7F0` |
| Default (Carbon + Gold ID) | Parchment `#F5F0E4` |
| Default (Carbon + Gold ID) | Sand Pale `#EDE8DC` |
| Mono Light | Carbon `#141414` |
| Mono Light | Bronze Deep `#7A6849` |
| Mono Dark | Cream Light `#FAF7F0` |
| Mono Dark | Pure White `#FFFFFF` |
| Premium Gradient | Cream Light `#FAF7F0` (hero only) |

### ❌ Forbidden combinations

- Default wordmark on dark backgrounds (use mono light instead)
- Mono dark on dark backgrounds (low contrast, illegible)
- Premium gradient on busy or photographic backgrounds
- Any logo on neon, electric, or high-saturation backgrounds (clashes with palette)

---

## Sizing

### Minimum sizes

| Variant | Web | Print |
|---|---|---|
| Wordmark | 80px wide | 24mm wide |
| Favicon | 16px | 8mm |
| Icon mark | 24px | 12mm |

Below these sizes, the logo loses legibility. If smaller is required, use only the favicon orb (no wordmark).

---

## File Format Selection

| Use case | Format |
|---|---|
| Web (responsive) | SVG |
| Email signatures | PNG @2x |
| Print | SVG → PDF |
| Social media | PNG (1200x630 OG image) |
| Favicon | SVG + ICO fallback |
| Animation | SVG (animated via CSS/JS) |

---

## Special Cases

### Dark mode (V2)

When dark mode launches in V2, the wordmark switches to **mono light** automatically. The favicon stays the same (it's already on a dark background).

### Press kit

For media inquiries, share the entire `kiteid-brand/` folder or link to the public brand repo. Press should use the **default wordmark** unless space is constrained.

### Co-branding (with Kite Foundation)

When co-branding with Kite Foundation, place the Kite logo on the **left**, KiteID wordmark on the **right**, with a vertical Sand Core divider between them. Both marks should be the same height. KiteID is the **junior partner** in any co-branding context.

```
[ Kite logo ]  │  KiteID
```

---

**Last updated:** 2026-04-08
