# Design System: The Learner Studio

## 1. Overview & Creative North Star

**Creative North Star: "Calm Exam Momentum"**

The user app should feel focused, reassuring, and study-ready. It shares the admin app's tactile surface language, but the learner experience is more guided and less operational: fewer dense tables, more progress cues, clear reading rhythm, and calm affordances for practice, review, and exam flow.

The product should help learners feel oriented before they act. Every screen should answer: where am I, what is next, and how much effort is this going to take?

---

## 2. Colors & Surface Logic

### Tonal Layering

Use soft tonal shifts instead of hard dividing lines.

- **Base:** `background` (#f8f9fa) for full-page surfaces.
- **Primary Content:** `surface_container_lowest` (#ffffff) for focused reading, question, and result areas.
- **Secondary Context:** `surface_container_low` (#f1f4f5) for side panels, summaries, and grouped supporting content.
- **Recessed Navigation:** `surface_container` (#ebeef0) when navigation needs to sit behind the active study area.

### Accent Use

`primary` is reserved for active progress, selected answers, and primary actions. Avoid coating entire screens in green; learner confidence comes from clarity, not saturation.

### Borders

Avoid visible section dividers. If separation is needed for accessibility or dense controls, use `outline_variant` at low opacity and pair it with whitespace.

---

## 3. Typography

Use the same type pairing as admin for product consistency:

- **Manrope:** Page titles, section headings, score/result moments.
- **Inter:** Body text, question copy, labels, controls, and metadata.

Question text should be comfortable to read for long sessions: prefer `leading-7`, avoid cramped cards, and do not make answer choices feel like tiny form rows.

---

## 4. Layout Principles

### Study First

The main learning or quiz area should be the visual anchor. Navigation, metadata, timers, and progress tools should support the task without competing with the question or explanation.

### Stable Controls

Quiz controls must keep stable dimensions across states. Selection, review, loading, and result states should not shift the page layout.

### Mobile Priority

Learners may practice on phones. Keep actions reachable, avoid two-column dependencies for essential workflows, and ensure answer choices remain easy to scan on narrow screens.

---

## 5. Component Direction

### Buttons

- **Primary:** `primary` or a restrained `primary` to `primary_container` gradient for the next essential action.
- **Secondary:** tonal surface fill, no heavy border.
- **Tertiary:** text or icon action with subtle surface shift on hover/focus.

### Answer Choices

Answer choices should be large enough to tap comfortably, with generous vertical rhythm. Use tonal selected states and reserve strong correctness colors for review/result modes.

### Progress

Use compact progress bars, step indicators, and small status chips. Progress UI should help orientation without becoming decorative clutter.

### Cards

Cards are for individual repeated items, quiz summaries, or focused reading panels. Do not place cards inside cards.

---

## 6. Do's and Don'ts

### Do

- Keep question and explanation text highly readable.
- Use whitespace to lower stress during timed workflows.
- Make selected, skipped, and reviewed states visually distinct.
- Prefer quiet, predictable navigation over marketing-style composition.

### Don't

- Do not use admin-style dense tables as the default learner pattern.
- Do not bury the current task beneath dashboard decoration.
- Do not use 100% black text; use `on_background` for the softer product tone.
- Do not add feature behavior until the route and component ownership is clear.
