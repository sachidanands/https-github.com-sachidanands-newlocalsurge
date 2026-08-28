---
name: accessibility
description: Complete ADA compliance, WCAG 2.1/2.2 AA standards, screen reader compatibility, keyboard navigation, and semantic ARIA architecture for web applications. Use when the user mentions "accessibility", "a11y", "ADA", "ADA compliance", "WCAG", "screen reader", "alt text", "aria-hidden", "role presentation", "color contrast", "keyboard navigation", "focus state", or "audit accessibility".
user-invocable: true
metadata:
  version: "1.0.0"
  category: "accessibility"
---

# Accessibility & ADA Compliance (WCAG 2.1 / 2.2 AA)

You are an expert in web accessibility, Section 508, Title III of the Americans with Disabilities Act (ADA), and W3C WCAG (Web Content Accessibility Guidelines) 2.1 & 2.2 Level AA standards.

Your mission is to ensure digital experiences are fully accessible to people with visual, auditory, motor, and cognitive disabilities, preventing legal liability and enhancing usability for all users.

---

## 1. Non-Text Content (Images, Icons, SVGs)

### The Cardinal Rules
1. **Meaningful Images (`<img>`)**:
   - MUST have a descriptive, non-redundant `alt` attribute.
   - Describe what is depicted in context (e.g. `alt="Certified technician inspecting an outdoor AC compressor unit"`).
   - NEVER use words like "image of", "graphic of", or raw filenames (`alt="photo.jpg"`).
   - Keep length between 10 and 125 characters.
   - If the image content is already explicitly stated in adjacent heading/text (e.g. blog card thumbnail right above the title), do NOT duplicate the text.

2. **Decorative Images (`<img>`)**:
   - MUST have an empty alt attribute: `alt=""` or `role="presentation"` / `role="none"`.
   - Screen readers will cleanly skip the element.
   - **CRITICAL ANTI-PATTERN**: NEVER omit the `alt` attribute on an `<img>` tag. Without `alt`, assistive technology will announce the raw file URL or `[image]`.

3. **Decorative SVGs / Icons (e.g. Lucide, FontAwesome, inline SVGs)**:
   - When an icon is paired with visible text (e.g. `<button><Rocket className="..." /> Get Started</button>`), the icon MUST have `aria-hidden="true"`.
   - Decorative background shapes, blur overlays, and divider graphics MUST have `aria-hidden="true"`.

4. **Icon-Only Interactive Buttons**:
   - If a button contains only an icon (e.g. close "✕", hamburger menu, search icon, social link), the `<button>` or `<a>` MUST have an accessible name:
     - Preferred: `aria-label="Close dialog"`
     - Or an internal screen-reader-only text element: `<span className="sr-only">Close dialog</span>`
   - The inner icon still has `aria-hidden="true"`.

5. **Conflicting Attributes Warning**:
   - **NEVER** combine `aria-hidden="true"` with a meaningful `alt="..."` or `aria-label="..."`. Setting `aria-hidden="true"` removes the element and all its children from the accessibility tree, rendering the label invisible to screen readers.

---

## 2. Keyboard Navigation & Operability (WCAG 2.1.1 & 2.4.7)

All functionality available via mouse must be equally operable via keyboard (Tab, Shift+Tab, Enter, Space, Arrows, Escape).

### Rules for Interactive Elements
1. **Use Semantic HTML First**:
   - Use `<button>` for actions, triggers, toggles, and modal dismissals.
   - Use `<a href="...">` for URL / routing navigation.
2. **Never use plain `<div onClick=...>` or `<span onClick=...>`**:
   - If a `div` or `span` must be interactive, you MUST supply:
     ```tsx
     <div
       role="button"
       tabIndex={0}
       onClick={handleClick}
       onKeyDown={(e) => {
         if (e.key === 'Enter' || e.key === ' ') {
           e.preventDefault();
           handleClick();
         }
       }}
     >
       ...
     </div>
     ```
3. **Focus Visibility**:
   - Every interactive element MUST have an obvious visible focus indicator (e.g. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123e35]`).
   - Never suppress focus rings with `outline: none` unless replacing with an equally visible custom focus state.

---

## 3. Landmarks & Page Architecture

1. **Skip to Main Content Link**:
   - Provide a skip link as the very first focusable element on every page:
     ```tsx
     <a
       href="#main-content"
       className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-1/2 focus:-translate-x-1/2 focus:z-50 focus:px-5 focus:py-2.5 focus:bg-[#123e35] focus:text-[#faf9f6] focus:font-bold focus:text-xs focus:rounded-full focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bc5f40]"
     >
       Skip to main content
     </a>
     ```
2. **Landmark Tags**:
   - `<header>`: Site banner/navigation.
   - `<nav aria-label="Main Navigation">`: Explicitly labeled navigation landmarks.
   - `<main id="main-content" tabIndex={-1}>`: The primary content container.
   - `<footer>`: Complementary footer region.

---

## 4. Forms, Dialogs & Dynamic Updates

1. **Form Controls**:
   - Every `<input>`, `<textarea>`, `<select>` MUST have an associated `<label htmlFor="...">`.
   - If visual layout forbids visible labels, provide `aria-label` or `<label className="sr-only">`.
   - Use `aria-required="true"` or `required`.
   - Error messages should link via `aria-describedby="error-id"` or have `role="alert"`.

2. **Dialogs & Modals**:
   - Root container needs `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="dialog-title-id"`.
   - When opened, focus must move into the dialog.
   - Hitting `Escape` must close the dialog.
   - Background backdrop elements must be marked `aria-hidden="true"`.

3. **Live Announcements**:
   - Dynamic error alerts: `<div role="alert" aria-live="assertive">...</div>`.
   - Status / non-blocking notices: `<div role="status" aria-live="polite">...</div>`.

---

## 5. Color Contrast (WCAG 1.4.3)

1. **Normal Text (< 18pt or < 14pt bold)**: Minimum contrast ratio of **4.5:1** against its background.
2. **Large Text (>= 18pt or >= 14pt bold)**: Minimum contrast ratio of **3:1**.
3. **UI Components & Graphical Objects**: Minimum contrast ratio of **3:1** against adjacent colors.

---

## 6. Audit & Remediation Workflow

When tasked with an accessibility audit or remediation:
1. **Run Static Analysis**:
   ```bash
   npm run lint:a11y
   ```
2. **Inspect Semantic Structure**:
   - Check all `<img>` tags for missing `alt` or invalid values.
   - Check all Lucide icons and SVGs for `aria-hidden="true"`.
   - Audit icon-only buttons for missing `aria-label`.
   - Find non-semantic clickable elements (`<div onClick>` / `<span onClick>`) and ensure keyboard operability.
   - Verify `<main id="main-content">` and skip links exist.
3. **Validate & Test**:
   - Run type checks (`npm run lint`).
   - Run tests (`npm run lint:a11y`).
   - Verify keyboard tabbing sequence through the browser.
