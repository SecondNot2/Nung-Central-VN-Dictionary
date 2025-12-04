<!-- GitHub Copilot / AI agent instructions for this repository -->

# Project snapshot for AI coding assistants

This file contains the minimal, high-value guidance an AI coding agent needs to be productive in this repository.

1. Big picture

- Frontend: React + TypeScript app built with Vite. Entry points: `index.tsx` / `App.tsx`.
- UI pages live in the `pages/` folder. Key pages: `pages/Dictionary.tsx` (main translator UI) and `pages/Contribute.tsx` (user contributions form).
- Services: `services/` contains business logic and external integration:
  - `megaLlmService.ts` — wrapper for MegaLLM API (translation, spell-check, simple TTS via browser). Uses `import.meta.env.VITE_MEGA_LLM_API_KEY` or `VITE_GEMINI_API_KEY` in README.
  - `nungVocab.ts` — offline NUNG dictionary (`NUNG_DICTIONARY`) and lookup utilities (smartLookup, reverse lookup).
- Data flows: UI -> services/megaLlmService -> external API (megallm.io). For many cases the app uses local lookup in `nungVocab.ts` before calling the model.

2. Local state & persistence patterns

- History and contributions are saved in `localStorage`. Important keys:
  - `translation_history` (used in `pages/Dictionary.tsx`)
  - `user_contributions` (used in `pages/Contribute.tsx`)
- When adding/modifying features that deal with historical or contributed data, update both the UI and the same localStorage key.

3. Common patterns to follow (examples in code)

- Toasts: use the `useToast` pattern found in `pages/Dictionary.tsx` and `pages/Contribute.tsx`. Each toast is {id,message,type} and is auto-removed after ~4s.
- Confirm dialogs: `ConfirmDialog` component (inline in `Dictionary.tsx`) is used instead of `window.confirm` and follows a `isOpen`/`onConfirm`/`onCancel` pattern.
- Custom selects: `CustomSelect` in `Dictionary.tsx` shows how options are provided (value, icon, description) and how option selection is handled.
- Pagination: history pagination uses `itemsPerPage = 5` and scrolls history section into view on page change — preserve this UX when modifying the history component.

- Confirm & toast for important actions: Use the shared `ConfirmDialog` for any destructive or high-impact user action (delete, approve/reject, publish, bulk edits, or other irreversible changes) instead of `window.confirm`. Follow the `isOpen`/`onConfirm`/`onCancel` pattern and include clear consequence text and an explicit primary action label.

  - Use the `useToast` / `ToastContainer` pattern to surface immediate feedback for CRUD operations: success, failure, and contextual info (e.g., item id or short excerpt). Keep messages short and auto-dismiss after ~4s.
  - Provide an undo path when feasible (e.g., soft-delete + undo button in toast). If undo is not possible, make the confirmation dialog explicit about irreversibility.
  - Standardize toast types and messages across pages (success, error, info, warning). Include actionable text where appropriate and keep toasts non-blocking.
  - When a CRUD operation affects persisted keys (like `translation_history` or `user_contributions`), ensure the confirm dialog and toast clearly mention the affected data and that localStorage keys are preserved or migrated as needed.

    3.5 Componentization — Rules (apply always)

- Extract reusable UI pieces into `components/` when they are used in more than one page or exceed ~60 lines.
- Prefer small, focused components: `ToastContainer`, `ConfirmDialog`, `CustomSelect`, `TranslationCard`, `HistoryItem` are good examples (see `pages/Dictionary.tsx`).
- Props: keep props minimal and serializable (values, callbacks). Avoid passing heavy closures or complex context unless necessary.
- State: keep local UI state inside the component; lift persistent or cross-page state to parent/page and pass via props.
- Styling: use Tailwind utility classes in the component; expose small className prop for minor overrides.
- File placement: put shared components in `components/` with `index.ts` re-exports. Small page-only helpers can remain inline in the page file.
- Naming: PascalCase for components, `use*` for hooks, `get*` for pure selectors.
- When refactoring, preserve localStorage keys and UX (toasts, confirm flows, pagination) to avoid behavioral regressions.

4. Service integration & secrets

- `megaLlmService.ts` calls `https://ai.megallm.io/v1/chat/completions` and expects `VITE_MEGA_LLM_API_KEY` in env. Do not hardcode keys in code.
- The code uses `callMegaLLM()` to wrap fetch, then parses JSON from `choices[0].message.content`.
- When changing prompts or response parsing, check `translateText()` for different flows (vi→nung, nung→vi, central dialect rules).

5. Files to inspect for behavior & examples

- `pages/Dictionary.tsx` — UX for translation, toast, confirm, history storage and pagination.
- `pages/Contribute.tsx` — contribution form, localStorage saving, toast notifications, showing contribution history.
- `services/megaLlmService.ts` — external API calls, prompt templates, response parsing.
- `services/nungVocab.ts` — authoritative vocabulary `NUNG_DICTIONARY` and `reverseNungLookup()` for Nùng→Vi reverse lookup.

6. How to run locally (developer workflow)

- Install and run Vite dev server:
  - `npm install`
  - set environment variables in `.env.local` (see README): e.g. `VITE_GEMINI_API_KEY` or `VITE_MEGA_LLM_API_KEY`.
  - `npm run dev`
- Build and preview: `npm run build` then `npm run preview`.

7. Project-specific conventions

- CSS is Tailwind-based with custom palette classes (e.g., `earth-*`, `bamboo-*`). Avoid adding global CSS unless necessary; use utility classes.
- Prefer the inline React components approach used in `Dictionary.tsx` (small components defined in same file) — follow the same pattern for small UI helpers.
- Keep `localStorage` keys stable (see section 2). If renaming keys, provide a migration/upgrade path.

8. Testing & scripts

- There are test helper files in the repo (`test-inference.ts`, `test-megallm.js`, `test-translation.js`). There are no test scripts in `package.json`; run them manually with `node`/`ts-node` as needed.

9. Security & privacy notes for AI agents

- Do not leak API keys into code or public commits. Use `import.meta.env` and document required keys in README.
- Be conservative when updating prompts: `translateText()` contains many language-specific rules — changing them affects translation quality.

10. If you modify translations or dictionary data

- Update `services/nungVocab.ts` (the `NUNG_DICTIONARY`) and, if applicable, update `reverseNungLookup()` assumptions. Prefer small, incremental changes.

If anything here is unclear or you want an expanded section (for example, a ready-made `pages/AdminContributions.tsx` or API scaffolding), tell me which section to expand and I will update this file.
