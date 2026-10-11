# Fullstack Next.js Engineering Guidelines

## Core Principles
- Deliver correct, evidence-backed, maintainable results with minimal scope. Avoid unnecessary investigation, validation, or output.
- Choose the simplest complete solution consistent with existing patterns — not merely the smallest diff.
- Avoid unrelated refactoring, renaming, formatting, dependency, or abstraction changes.
- Preserve existing user changes. Never discard work, reset, rewrite history, or force-push unless explicitly requested.
- Avoid placeholder names (foo, bar, test); keep logic straightforward and easy to debug.

---

## Execution
- Work autonomously within granted permissions. Resolve uncertainty using the repo, tests, logs, git history, or primary docs. Ask only when info is essential and missing, approval is required, or a decision can't be safely inferred.
- Scale investigation to complexity/risk:
  - **Bugs** — establish expected vs. actual behavior, trace root cause through the relevant execution/data flow before fixing.
  - **Features** — define success criteria and relevant architectural boundaries first.
- Don't weaken types, tests, validation, or error handling just to make something work.

---

## Context & Tools
- Search likely paths/symbols first; expand only as evidence requires. Read enough surrounding code (callers, state, async behavior, side effects) before editing.
- Avoid repo-wide dumps and irrelevant/vendor/generated files.
- Reuse prior findings unless stale, incomplete, or contradicted. Batch independent lookups.
- Verify uncertain or version-sensitive external behavior against primary sources. State unresolved uncertainty rather than guessing.
- If an approach yields no new evidence, change the hypothesis/method instead of repeating it. If blocked, report the evidence gap and the smallest next step.

---

## Validation
- Run the most relevant checks after changes; reproduce the original failure first when feasible.
- Add/update tests that meaningfully verify changed behavior or prevent regressions.
- Review the final diff for correctness, unintended edits, and scope creep.
- Never claim a fix without verifying it; distinguish change-related failures from pre-existing/unverified ones.
- Stop once the outcome is validated and in-scope concerns are resolved. Report anything blocked.

---

## Communication
- Work silently: no preambles, progress updates, or tool narration unless user input/approval is needed to proceed safely.
- **Implementation tasks:** end with a brief report — changes made, checks run + results, key limitations. Include paths/root cause/sources only when useful.
- **Other tasks:** provide just the requested deliverable.
- Never omit material failures or risks for brevity.

---

## Project Structure
- Next.js App Router (`app/`); separate UI, server logic, and API routes clearly
- Keep folders shallow and easy to navigate

## Frontend (React/Next.js)
- Prefer server components; use `"use client"` only when needed
- Reusable components without over-abstraction
- Minimal state; avoid complex hook nesting

## Backend / API
- Use route handlers; validate all incoming requests; try/catch for errors
- Consistent response shape: `{ success: boolean, message: string, data: object | array }`

## Data & Database
- Prefer server-side fetching; avoid duplicate calls; fetch only required fields; cache/revalidate as appropriate
- Avoid over-fetching and unnecessary queries; handle null/missing data safely

## State Management
- Minimal, non-duplicated state; predictable, simple data flow
- Prefer server state over client state

## UI/UX
- Clean, minimal, consistent, and responsive
- Give feedback for loading/success/error states
- Use proper icons, not emojis

## Security
- Sanitize and validate all inputs
- Protect sensitive routes/data
- Never expose secrets in frontend code