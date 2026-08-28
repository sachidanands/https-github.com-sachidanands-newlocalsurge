# WCAG 2.1 & 2.2 AA Compliance Checklist for React Applications

This reference provides a practical verification checklist for developers and AI agents auditing web components.

---

## Principle 1: Perceivable

### 1.1 Text Alternatives
- [ ] Every `<img />` element has an `alt` attribute.
  - Informative images: `alt="Accurate and concise description"`
  - Purely decorative images: `alt=""` and `role="presentation"`
- [ ] No image uses raw filenames or generic words (`alt="image.png"`, `alt="icon"`).
- [ ] Meaningful images never have `aria-hidden="true"`.
- [ ] Decorative icons (Lucide, inline SVG, FontAwesome) have `aria-hidden="true"`.

### 1.3 Adaptable Structure & Semantics
- [ ] Semantic landmarks are present: `<header>`, `<nav>`, `<main>`, `<footer>`.
- [ ] Heading hierarchy (`<h1>` through `<h6>`) is logical and does not skip levels (e.g. `<h1>` followed by `<h3>`).
- [ ] Form inputs have `<label htmlFor="...">` matching `id="..."`.
- [ ] Custom controls use appropriate ARIA roles (`role="dialog"`, `role="button"`, `role="tab"`, etc.).

### 1.4 Distinguishable
- [ ] Color is not used as the sole visual means of conveying information (e.g. required form fields, errors).
- [ ] Normal text has at least 4.5:1 contrast against its background.
- [ ] Large text (18pt / 24px or 14pt / 18.5px bold) has at least 3:1 contrast.
- [ ] Interactive UI components and borders have at least 3:1 contrast against adjacent background colors.

---

## Principle 2: Operable

### 2.1 Keyboard Accessible
- [ ] All interactive elements can be focused and activated with keyboard only (`Tab`, `Enter`, `Space`).
- [ ] No keyboard traps: users can tab into and out of any component.
- [ ] Non-semantic interactive elements (`div` or `span` with `onClick`) must have:
  - `role="button"`
  - `tabIndex={0}`
  - Keyboard event handler (`onKeyDown` handling Enter and Space).
- [ ] Modals trap focus while open and release focus upon closing.
- [ ] Modals close when the user presses `Escape`.

### 2.4 Navigable
- [ ] "Skip to main content" link is the first focusable element on the page.
- [ ] Page titles are descriptive and unique.
- [ ] Focus order is logical and matches the visual flow.
- [ ] Focus states are clearly visible (`focus-visible:ring-2` or equivalent).
- [ ] Link and button texts clearly communicate their destination or action (no lone "click here" or icon-only buttons without `aria-label`).

---

## Principle 3: Understandable

### 3.2 Predictable
- [ ] Focusing on a component does not cause unexpected page navigation or form submission.
- [ ] Navigation patterns are consistent across different views.

### 3.3 Input Assistance
- [ ] Form errors are announced via `role="alert"` or `aria-live="polite"`.
- [ ] Required fields are clearly identified both visually and programmatically (`required` or `aria-required="true"`).
- [ ] Error messages provide clear suggestions for correction.

---

## Principle 4: Robust

### 4.1 Compatible
- [ ] Clean HTML markup without duplicate IDs.
- [ ] ARIA attributes are valid and applied to appropriate elements.
- [ ] Modals declare `role="dialog"` and `aria-modal="true"`.
- [ ] Dynamic widgets update assistive technologies via `aria-live` or state attributes (`aria-expanded`, `aria-selected`, `aria-checked`).
