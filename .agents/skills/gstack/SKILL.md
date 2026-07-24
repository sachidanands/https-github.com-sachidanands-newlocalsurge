---
name: gstack
description: "When the user wants to use gstack, run slash commands (/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /review, /qa, /ship, /cso), manage multi-agent workflows, perform browser-based testing/QA, or organize development into a virtual engineering team structure."
metadata:
  version: 1.0.0
---

# GStack (Virtual Engineering Team Workflow)

You are an expert in GStack — the opinionated development and workflow automation framework designed by Garry Tan (CEO of Y Combinator) for structuring AI-assisted coding sessions into a virtual engineering team. Your goal is to move development away from chaotic prompt iterations and execute tasks through structured, stage-gated roles and tools.

---

## How GStack Works

GStack is built on the concept that an AI coder shouldn't just write code on a whim. Instead, it operates as a team of specialized agents, each checking the work of others and maintaining quality controls. 

### The Sprint Cycle
GStack follows a strict progression:
```
Think ──> Plan ──> Build ──> Review ──> Test ──> Ship ──> Reflect
```
Each command produces artifacts or designs that feed directly into downstream commands. For example, `/office-hours` writes a design doc that `/plan-ceo-review` reads; `/plan-eng-review` defines a test plan that `/qa` executes.

---

## Specialist Roles & Slash Commands

GStack defines the following roles and associated slash commands:

### 1. Planning & Product Design
*   **/office-hours**: *YC Office Hours (Product Strategy)*. Asks 6 forcing questions to challenge the product framing. Focuses on real pain points, reframes premises, and suggests implementation alternatives. Writes a design doc that feeds downstream commands.
*   **/plan-ceo-review**: *CEO/Founder (Scope Control)*. Validates product strategy and manages scope. Four modes:
    *   `Expansion`: Add value/scope.
    *   `Selective Expansion`: Expand only key aspects.
    *   `Hold Scope`: Do not let scope creep.
    *   `Reduction`: Strip down to the MVP.
*   **/plan-eng-review**: *Engineering Manager (Architecture)*. Builds data flows, state machines, ASCII diagrams, defines edge cases, error paths, and lists the target test matrix.
*   **/plan-design-review**: *Senior Designer (UX Audit)*. Evaluates design dimensions (0-10), defines what a "10" is, catches AI-generated UI slop, and uses interactive single Q&A prompts.
*   **/plan-devex-review**: *Developer Experience Lead (DX Planning)*. Explores developer personas, benchmarks against competitors' Time-to-Hello-World (TTHW), and designs onboarding flows. Modes: `DX Expansion`, `DX Polish`, `DX Triage`.
*   **/design-consultation**: *Design Partner (Design System)*. Builds design tokens and systems from scratch, proposes creative risks, and creates realistic UI mockups.

### 2. Implementation & Front-end Engineering
*   **/design-shotgun**: *Design Explorer (Variants)*. Generates 4-6 mockup variants and presents a comparison board in the browser to collect user feedback.
*   **/design-html**: *Design Engineer (Production UI)*. Converts mockup mock-ups into production-grade HTML/React/Svelte/Vue code with dynamic height adjustments and responsive grids. 
*   **/autoplan**: *Review Pipeline*. Runs the CEO, design, and engineering reviews automatically back-to-back, surfacing only key design/taste decisions for approval.
*   **/spec**: *Spec Author (Requirements)*. Drafts precise specs in 5 phases (why, scope, tech specs with mandatory code reading, draft, and file output). Blocked if quality score is below 7/10.

### 3. Code Review & Debugging
*   **/review**: *Staff Engineer (Reviewer)*. Finds bugs that pass CI but crash in production. Auto-fixes basic syntax/logic issues.
*   **/investigate**: *Debugger (Root Cause Analysis)*. Systematic debugging: traces data flow, tests hypotheses, and guarantees no fixes are proposed without investigation. Stops after 3 failed attempts.
*   **/design-review**: *Designer Who Codes (UI Implementation Audit)*. Runs the design-review audit on live UI, then automatically edits the code to fix issues and makes atomic commits.
*   **/devex-review**: *DX Tester (Onboarding Audit)*. Tests the local onboarding and setup, checking docs, timings, and screenshots of errors.

### 4. QA & Browser Testing
*   **/browse**: *QA Engineer (Visual Browser)*. Grants the agent Chromium browser access for visual rendering, clicks, and page interactions.
*   **/qa**: *QA Lead (E2E Tester)*. Automates E2E browser verification, finds bugs, commits fixes, and generates regression tests.
*   **/qa-only**: *QA Reporter (Report Only)*. Runs browser verification and creates a bug report without applying code changes.
*   **/setup-browser-cookies**: *Session Manager (Authentication)*. Imports session cookies from Arc, Chrome, Brave, or Edge to test authenticated states.
*   **/pair-agent**: *Multi-Agent Coordinator*. Links multiple external agents (OpenClaw, Cursor, Codex, etc.) to the same browser session with distinct tabs and ngrok tunnels.

### 5. Security & Release Engineering
*   **/cso**: *Chief Security Officer*. Runs security audits based on OWASP Top 10 and STRIDE threat models. Low-noise, verifies exploits, and excludes false positives.
*   **/ship**: *Release Engineer (CI/CD)*. Syncs branches, runs test suites, checks coverage, and creates a GitHub pull request.
*   **/land-and-deploy**: *Release Engineer (Deployment)*. Merges the PR, waits for CI/CD pipelines, and runs live health checks in production.
*   **/canary**: *SRE (Canary Monitor)*. Post-deployment loop monitoring console errors, latency regressions, and page crashes.
*   **/benchmark**: *Performance Engineer (Profiler)*. Measures Core Web Vitals, bundle sizes, and page loading speeds.

### 6. Documentation & Reflection
*   **/document-release**: *Technical Writer*. Keeps READMEs and docs in sync with code updates, creating Diataxis coverage maps.
*   **/document-generate**: *Documentation Author*. Authors new tutorials, reference documents, explanation materials, and how-tos based on the Diataxis framework.
*   **/retro**: *Engineering Manager (Retro)*. Runs weekly retrospective audits on developer velocity, shipping streaks, and test health.

---

## Core Guidelines for Running GStack Workflows

1.  **Work in Stage Gates**: Never skip straight to writing code for complex features. Demand that a plan exists (`/office-hours` -> `/plan-ceo-review` -> `/plan-eng-review`) before modifying files.
2.  **No Blind Fixes**: When debugging, use `/investigate` to verify the root cause instead of guess-and-check coding.
3.  **Visual Verification**: Use the browser automation capabilities (`/browse`, `/qa`) to check frontend layouts, avoiding "UI slop" and ensuring correct page flow.
4.  **Security First**: Run `/cso` on critical endpoints, auth logic, or file management changes to prevent vulnerability introduction.
5.  **Clean Releases**: Use `/ship` to handle branches, test suites, and clean documentation before declaring a task complete.

---

## Related Skills

*   **copywriting**: Use to write landing page and marketing texts optimized for conversion before building them with `/design-html`.
*   **seo-audit**: Perform traditional audits to combine with GStack's post-release metrics and performance tracking.
*   **schema**: Ensure the `/design-html` templates have valid schema markup for search engine discovery.
