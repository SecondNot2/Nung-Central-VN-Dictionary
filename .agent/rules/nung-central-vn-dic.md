---
trigger: always_on
---

# Project Snapshot for AI Coding Assistants

This file contains essential guidance for AI coding agents to be productive in the **Nung Central VN Dictionary** project, optimized for Antigravity and modern web development best practices.

---

## 1. Project Overview

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens (`earth-*`, `bamboo-*` palette)
- **State Management**: React hooks + localStorage for persistence
- **API Integration**: MegaLLM API for AI-powered translation
- **Build Tool**: Vite (fast HMR, optimized builds)

### Architecture

```
src/
├── pages/           # Main UI pages (Dictionary, Contribute, Admin, About)
├── components/      # Reusable React components
├── services/        # Business logic & external integrations
│   ├── megaLlmService.ts    # AI translation API wrapper
│   ├── nungVocab.ts         # Offline dictionary & lookup
│   └── ...
├── contexts/        # React contexts for global state
├── data/            # Static data files
├── types.ts         # TypeScript type definitions
└── App.tsx          # Main app component with routing
```

### Entry Points

- `index.tsx` → `App.tsx` → Page components
- Main pages: `Dictionary.tsx` (translator), `Contribute.tsx` (user contributions)

---

## 2. Design Philosophy (Antigravity Standards)

### Visual Excellence - CRITICAL

**Every UI change MUST prioritize premium aesthetics:**

1. **Rich Color Palettes**: Use curated HSL colors, avoid generic RGB values

   - Current palette: `earth-*` (warm tones), `bamboo-*` (greens)
   - Dark mode support with proper contrast ratios

2. **Modern Typography**:

   - Use Google Fonts (Inter, Roboto, Outfit) instead of system defaults
   - Proper font hierarchy (h1-h6, body, captions)

3. **Micro-Animations**:

   - Hover effects on all interactive elements
   - Smooth transitions (200-300ms for UI feedback)
   - Loading states with elegant spinners/skeletons

4. **Glassmorphism & Depth**:

   - Use backdrop-blur, subtle shadows
   - Layered UI with proper z-index management

5. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### SEO Best Practices

Implement on every page:

- **Title tags**: Descriptive, unique per page
- **Meta descriptions**: 150-160 characters, compelling
- **Semantic HTML**: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`
- **Heading hierarchy**: Single `<h1>` per page, proper nesting
- **Unique IDs**: All interactive elements need descriptive IDs
- **Performance**: Lazy load images, code splitting, optimize bundles

---

## 3. Data Persistence & State Management

### LocalStorage Keys (STABLE - Do NOT change without migration)

```typescript
// Translation history
'translation_history': Array<{id, sourceText, translatedText, timestamp, direction}>

// User contributions
'user_contributions': Array<{id, word, translation, example, timestamp}>

// User preferences
'user_preferences': {theme, language, fontSize, ...}
```

### State Patterns

- **Local UI state**: `useState` within components
- **Persistent state**: localStorage + `useEffect` sync
- **Global state**: React Context (see `contexts/`)
- **Form state**: Controlled components with validation

---

## 4. Component Development Rules

### Componentization Standards

Extract to `components/` when:

- Used in 2+ pages
- Exceeds ~60 lines
- Has reusable logic

### Component Structure

```typescript
// Good example
interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string; // For style overrides
}

export const CustomInput: React.FC<Props> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`base-styles ${className}`}
    />
  );
};
```

### Naming Conventions

- **Components**: PascalCase (`TranslationCard`, `ToastContainer`)
- **Hooks**: `use*` prefix (`useToast`, `useTranslation`)
- **Utils**: camelCase (`smartLookup`, `reverseNungLookup`)
- **Constants**: UPPER_SNAKE_CASE (`NUNG_DICTIONARY`, `API_BASE_URL`)

### Existing Reusable Components

- `ToastContainer` + `useToast` hook - notifications
- `ConfirmDialog` - confirmation modals
- `CustomSelect` - styled select dropdowns
- `TranslationCard` - display translation results
- `HistoryItem` - translation history entries

---

## 5. UX Patterns (Follow Strictly)

### Toast Notifications

```typescript
// Use the useToast hook
const { addToast } = useToast();

addToast({
  id: Date.now().toString(),
  message: "Translation saved successfully!",
  type: "success", // success | error | info | warning
});
// Auto-dismisses after ~4s
```

### Confirmation Dialogs

```typescript
// NEVER use window.confirm()
// Use ConfirmDialog component instead
<ConfirmDialog
  isOpen={isConfirmOpen}
  title="Delete Translation?"
  message="This action cannot be undone. Are you sure?"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
  onCancel={() => setIsConfirmOpen(false)}
/>
```

### Pagination

- Default: 5 items per page
- Auto-scroll to section on page change
- Show page numbers + prev/next buttons

### Loading States

- Use skeleton screens for content loading
- Spinner for actions (submit, translate)
- Disable buttons during async operations

---

## 6. Service Integration

### MegaLLM API (`services/megaLlmService.ts`)

```typescript
// Main translation function
translateText(text: string, direction: 'vi-nung' | 'nung-vi'): Promise<string>

// Spell check
checkSpelling(text: string): Promise<string>

// Text-to-speech (browser-based)
speakText(text: string, lang: string): void
```

**Environment Variables** (`.env.local`):

```
VITE_MEGA_LLM_API_KEY=your_key_here
# OR
VITE_GEMINI_API_KEY=your_key_here
```

**NEVER hardcode API keys in source code!**

### Offline Dictionary (`services/nungVocab.ts`)

```typescript
// Main dictionary object
NUNG_DICTIONARY: Record<string, NungEntry>

// Smart lookup with fuzzy matching
smartLookup(vietnameseWord: string): NungEntry | null

// Reverse lookup (Nung → Vietnamese)
reverseNungLookup(nungWord: string): string[]
```

**Flow**: Always try offline lookup first, fallback to AI translation

---

## 7. Styling Guidelines

### Tailwind Utilities (Preferred)

```tsx
// Good - utility classes
<button className="px-4 py-2 bg-bamboo-600 hover:bg-bamboo-700
                   rounded-lg transition-colors duration-200">
  Translate
</button>

// Avoid - inline styles
<button style={{padding: '8px 16px', backgroundColor: '#10b981'}}>
  Translate
</button>
```

### Custom Design Tokens

```css
/* index.css - extend as needed */
:root {
  --earth-50: #faf8f5;
  --earth-100: #f5f1ea;
  /* ... */
  --bamboo-600: #10b981;
  /* ... */
}
```

### Responsive Breakpoints

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

---

## 8. Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# VITE_MEGA_LLM_API_KEY=your_key

# Start dev server (HMR enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality Checks

```bash
# TypeScript type checking
npx tsc --noEmit

# Lint (if configured)
npm run lint

# Format (if using Prettier)
npm run format
```

### Testing

- Manual testing via dev server
- Test files: `test-inference.ts`, `test-megallm.js`, `test-translation.js`
- Run with: `node test-*.js` or `ts-node test-*.ts`

---

## 9. File Organization

### When to Create New Files

**Components** (`components/`):

- Reusable across 2+ pages
- Self-contained UI logic
- Export via `index.ts`

**Pages** (`pages/`):

- Top-level routes
- Can contain small inline components (<60 lines)

**Services** (`services/`):

- Business logic
- API integrations
- Pure utility functions

**Types** (`types.ts`):

- Shared TypeScript interfaces/types
- Keep organized by domain

---

## 10. Security & Privacy

### API Key Management

- ✅ Use `import.meta.env.VITE_*` for environment variables
- ✅ Document required keys in README
- ❌ NEVER commit `.env.local` to git
- ❌ NEVER hardcode keys in source files

### User Data

- All data stored in localStorage (client-side only)
- No server-side persistence (yet)
- Clear data on user request (privacy compliance)

### Prompt Engineering

- Translation prompts in `megaLlmService.ts` contain language-specific rules
- Changes affect translation quality - test thoroughly
- Preserve dialect-specific instructions (Central Nung dialect)

---

## 11. Common Tasks & Examples

### Adding a New Page

1. Create `pages/NewPage.tsx`
2. Add route in `App.tsx`
3. Add navigation link in header/menu
4. Follow SEO checklist (title, meta, semantic HTML)
5. Use existing design tokens and components

### Adding a New Component

1. Create `components/NewComponent.tsx`
2. Export in `components/index.ts`
3. Add TypeScript interface for props
4. Use Tailwind for styling
5. Add hover/focus states

### Modifying Dictionary Data

1. Update `services/nungVocab.ts` → `NUNG_DICTIONARY`
2. Test `smartLookup()` and `reverseNungLookup()`
3. Verify offline → online fallback flow
4. Update type definitions if structure changes

### Adding LocalStorage Feature

1. Define key name (follow naming convention)
2. Create migration path if changing existing keys
3. Add TypeScript types for stored data
4. Implement save/load with error handling
5. Add clear/reset functionality

---

## 12. Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const AdminPage = lazy(() => import("./pages/Admin"));

<Suspense fallback={<LoadingSpinner />}>
  <AdminPage />
</Suspense>;
```

### Image Optimization

- Use WebP format with fallbacks
- Lazy load below-the-fold images
- Provide width/height to prevent layout shift

### Bundle Size

- Check with `npm run build` → inspect `dist/`
- Use Vite's rollup analyzer if needed
- Tree-shake unused dependencies

---

## 13. Accessibility (a11y)

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Proper tab order (tabIndex when needed)
- Focus indicators (visible outline)

### Screen Readers

- Semantic HTML elements
- ARIA labels where needed (`aria-label`, `aria-describedby`)
- Alt text for images

### Color Contrast

- WCAG AA minimum (4.5:1 for normal text)
- Test with browser DevTools

---

## 14. Git Workflow

### Commit Messages

```
feat: add pronunciation audio feature
fix: correct Nung→Vi reverse lookup
docs: update API integration guide
style: improve mobile responsive layout
refactor: extract TranslationCard component
```

### Branch Strategy

- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - new features
- `fix/*` - bug fixes

---

## 15. Troubleshooting

### Common Issues

**Vite not recognized**:

- Check Node.js version (16+)
- Clear `node_modules` and reinstall
- Use `npx vite` instead of `npm run dev`

**API calls failing**:

- Verify `.env.local` has correct key
- Check network tab for error details
- Ensure API endpoint is correct

**LocalStorage not persisting**:

- Check browser privacy settings
- Verify key names match exactly
- Use browser DevTools → Application → Local Storage

**TypeScript errors**:

- Run `npx tsc --noEmit` to see all errors
- Check `tsconfig.json` settings
- Ensure types are imported correctly

---

## 16. Next Steps & Expansion

### Planned Features

- Admin dashboard for contribution review
- User authentication & profiles
- Backend API for data persistence
- Mobile app (React Native)
- Offline PWA support

### Need Help?

If you need expanded guidance on:

- Creating `pages/AdminContributions.tsx`
- Setting up backend API
- Implementing authentication
- Adding new translation features
- Performance optimization
