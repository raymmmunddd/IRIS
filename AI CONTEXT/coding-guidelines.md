# Fullstack Next.js Coding Guidelines

## 1. Project Structure
- Use Next.js App Router (`app/` directory)
- Separate UI components, server logic, and API routes properly
- Keep folder structure simple and easy to navigate
- Avoid deeply nested folders unless necessary

---

## 2. Frontend Architecture (React / Next.js)
- Use server components when possible
- Use client components only when needed (`use client`)
- Keep components reusable but not over-abstracted
- Avoid unnecessary state usage
- Use hooks properly and avoid complex nesting of hooks

---

## 3. Backend / API Routes
- Use route handlers for backend logic
- Validate all incoming requests
- Use try/catch for error handling
- Return consistent response format:
  - success (boolean)
  - message (string)
  - data (object or array)

---

## 4. Data Fetching
- Prefer server-side fetching when possible
- Avoid duplicate API calls
- Fetch only required fields
- Use caching or revalidation when appropriate

---

## 5. Database & Queries
- Avoid unnecessary database queries
- Prevent over-fetching data
- Handle missing or null data safely
- Use efficient query patterns

---

## 6. State Management
- Keep state minimal and necessary
- Avoid duplicating data in multiple states
- Keep data flow predictable and simple
- Prefer server state over client state when possible

---

## 7. UI / UX Standards
- Keep UI clean, minimal, and consistent
- Provide feedback for user actions (loading, success, error)
- Ensure responsiveness across screen sizes
- Use proper icons instead of emojis

---

## 8. Code Quality Rules
- Avoid repetitive logic across files
- Reuse components and utilities when appropriate
- Do not over-engineer solutions
- Avoid placeholder names (foo, bar, test)
- Keep logic straightforward and easy to debug

---

## 9. Error Handling
- Handle edge cases (null, undefined, empty arrays)
- Prevent application crashes from unexpected inputs
- Always assume external data can fail or be missing

---

## 10. Security Basics
- Sanitize and validate all inputs
- Protect sensitive routes and data
- Never expose secrets in frontend code