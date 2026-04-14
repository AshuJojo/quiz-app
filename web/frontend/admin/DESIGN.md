# Design System: The Editorial Dashboard

## 1. Overview & Creative North Star

**Creative North Star: "The Tactile Atelier"**

This design system rejects the "mechanical" nature of traditional admin panels. Instead, it draws inspiration from high-end editorial layouts and physical stationery. We are moving away from the rigid, "boxed-in" feeling of legacy SaaS and toward a "Tactile Atelier"—an workspace that feels open, airy, and curated.

The goal is to provide a "Cognitive Hug" for the user: a professional environment that reduces data fatigue through generous whitespace, intentional asymmetry, and a soft, pastel-driven tonal depth. We break the template look by treating every dashboard as a digital canvas where depth is felt, not seen through harsh outlines.

---

## 2. Colors & Surface Logic

### The "No-Line" Rule

Standard 1px borders are strictly prohibited for sectioning or containment. Structural integrity is achieved through **Tonal Shifting**. A section is defined by moving from the base `background` (#f8f9fa) to a `surface_container_low` (#f1f4f5). Boundaries must feel like a natural shift in light, not a pencil mark.

### Surface Hierarchy & Nesting

Treat the UI as a series of nested physical layers.

- **Base Level:** `background` or `surface`.
- **Primary Workspaces:** `surface_container_lowest` (#ffffff) for high-focus areas like data tables or document editors.
- **Support Elements:** Use `surface_container` (#ebeef0) for sidebars or secondary navigation to create a "recessed" feel.

### The "Glass & Gradient" Rule

To add soul to the "Modern" aesthetic:

- **Floating Elements:** Use `surface_container_lowest` with an 80% opacity and a `24px` backdrop-blur to create a "frosted glass" effect for navigation bars or floating action menus.
- **Signature Gradients:** For primary CTAs or high-level metric cards, use a subtle linear gradient (135°) from `primary` (#2b6a57) to `primary_container` (#b0f0d8). This creates a "glow" that feels premium and intentional.

---

## 3. Typography: Editorial Authority

We use a dual-typeface system to balance professional authority with a friendly, modern approachable feel.

- **Display & Headlines (Manrope):** Chosen for its geometric clarity and modern "tech-editorial" vibe. Use `display-lg` through `headline-sm` to create clear entry points for the eye. The generous tracking in Manrope headlines provides a sense of luxury.
- **Body & UI (Inter):** The workhorse. Used for `title-lg` down to `label-sm`. Inter’s tall x-height ensures legibility in dense data environments.

**Hierarchy Note:** Always lead with a large `headline-md` for page titles. Ensure a minimum of `2rem` (32px) of whitespace between a headline and the start of body content to maintain the "Editorial" feel.

---

## 4. Elevation & Depth: Tonal Layering

### The Layering Principle

Forget traditional drop shadows for every card. Use **Tonal Stacking**:

1. Place a `surface_container_lowest` card on a `surface_container_low` background.
2. The contrast between the pure white (#ffffff) and the soft grey (#f1f4f5) creates a "natural lift" that is easier on the eyes during long work sessions.

### Ambient Shadows

When a component must "float" (e.g., a dropdown or a modal), use an **Ambient Shadow**:

- **Color:** Use a tinted version of `on_surface` (e.g., #2d3335 at 6% opacity).
- **Blur:** `32px` to `64px` for a soft, diffused spread.
- **Offset:** Y: `8px`, X: `0`.

### The "Ghost Border" Fallback

If a border is required for accessibility (e.g., high-contrast mode), use a **Ghost Border**: `outline_variant` (#adb3b5) at **15% opacity**. It should be felt as a suggestion, never a constraint.

---

## 5. Components

### Buttons

- **Primary:** Gradient fill (`primary` to `primary_dim`) with `on_primary` text. Use `rounded-md` (0.75rem) for a friendly, approachable edge.
- **Secondary:** `secondary_container` fill with `on_secondary_container` text. No border.
- **Tertiary:** Pure text using `primary` color, with a `surface_container_highest` background shift on hover.

### Input Fields

- **Container:** Use `surface_container_lowest`.
- **Active State:** A `2px` "Ghost Border" of `primary` at 40% opacity.
- **Helper Text:** Always use `label-md` in `on_surface_variant` for a sophisticated, subdued look.

### Cards & Lists

- **No Dividers:** Lists must be separated by whitespace (e.g., `12px` or `16px` gap).
- **Interactive Lists:** Instead of a line, use a `surface_container_high` background fill on hover with a `rounded-sm` corner radius.
- **Metric Cards:** Use `tertiary_container` (Peach) or `inverse_primary` (Mint) as a very subtle background tint (10% opacity) to categorize data types visually without using labels.

### Additional Signature Component: "The Status Halo"

Instead of a solid green/red dot for status, use a small chip with a `secondary_fixed_dim` (Lavender) background and a `6px` blur, creating a soft "halo" effect around the status text.

---

## 6. Do’s and Don’ts

### Do:

- **Embrace Asymmetry:** Place a heavy metric card on the left and a lighter "Activity Feed" on the right. This breaks the "Grid Fatigue."
- **Use "Surface Tint":** Apply `surface_tint` at 2% opacity over large white areas to unify the color palette.
- **Prioritize Breathing Room:** If a layout feels "busy," double the padding before you consider removing content.

### Don’t:

- **Don’t use 100% Black:** Always use `on_background` (#2d3335) for text to maintain the soft, pastel harmony.
- **Don’t use Hard Corners:** Avoid `rounded-none`. Everything in this system should feel touchable and soft (minimum `rounded-sm`).
- **Don’t use High-Contrast Dividers:** Never use a dark line to separate content. Use a `1px` shift in `surface` color if whitespace isn't enough.
