# AGENTS.md — PWA Calculator Application

## 1. Stack

| Technology | Role |
|---|---|
| TypeScript 5+ | Primary language; strict mode enforced across all source files |
| React 18 | UI layer; `useReducer` wires FSM transitions to component re-renders |
| Vite 5+ | Build tool, dev server, HMR, asset fingerprinting, Rollup production bundling |
| Rollup (via Vite) | Production tree-shaking, code-splitting, chunk optimisation |
| `vite-plugin-pwa` / Workbox | Service worker generation, precache manifest, cache-first application shell |
| `manifest.webmanifest` | PWA installability metadata (name, icons, display, start_url, theme_color) |
| CSS3 Custom Properties | Design tokens, dark/light theme switching via `data-theme` attribute |
| CSS Grid + Flexbox | Keypad layout, responsive containers |
| `clamp()` / `min()` / `max()` | Fluid typography and spacing without media-query breakpoints |
| Browser Cache API | Service-worker-managed application shell cache |
| Browser `localStorage` | Optional calculation history persistence (100-entry FIFO cap) |
| `KeyboardEvent` / `PointerEvent` | Input normalisation into typed `CalcAction` objects |
| IEEE 754 + `toPrecision` / `toFixed` / `toExponential` | Number formatting strategy; prevents floating-point display artefacts |
| XState (optional) | FSM visualisation; can be swapped for hand-authored transition table |
| Vitest | Unit and integration tests for engine, FSM, dispatcher |
| Playwright | E2E browser tests for UI flows, PWA manifest, SW registration |
| Testing Library | Component snapshot and interaction tests |
| axe-core / `jest-axe` | Automated WCAG 2.1 AA accessibility regression in CI |
| ESLint + TypeScript ESLint | Static analysis; zero-warning policy in CI |
| Prettier | Code formatting; enforced via pre-commit hook and CI check |
| pnpm | Package manager; lockfile committed; no npm/yarn allowed |

---

## 2. Project Structure

```
pwa-calculator/
├── AGENTS.md                          # This file — agent scaffold specification
├── tasks.md                           # Agent-generated task checklist (created before coding)
├── package.json                       # pnpm workspace root; scripts: dev, build, preview, test, lint, format
├── pnpm-lock.yaml                     # Committed lockfile — never delete
├── tsconfig.json                      # Root TypeScript config; strict: true, target: ES2022, moduleResolution: bundler
├── tsconfig.node.json                 # TypeScript config for Vite config file (Node environment)
├── vite.config.ts                     # Vite config: vite-plugin-pwa, path aliases, build options
├── vitest.config.ts                   # Vitest config: jsdom environment, coverage provider (v8), thresholds
├── playwright.config.ts               # Playwright config: chromium + firefox + webkit, baseURL, webServer
├── .eslintrc.cjs                      # ESLint config: @typescript-eslint, react, jsx-a11y, import plugins
├── .prettierrc                        # Prettier config: single quotes, 2-space indent, trailing commas
├── .prettierignore                    # Exclude dist/, coverage/, .pnpm-store/
├── .gitignore                         # Exclude dist/, node_modules/, coverage/, .pnpm-store/
├── index.html                         # Vite entry HTML; links manifest, sets lang="en", noscript fallback
├── public/
│   ├── manifest.webmanifest           # PWA manifest: name, short_name, icons, display, start_url, theme_color
│   ├── icons/
│   │   ├── icon-192.png               # PWA icon 192×192
│   │   ├── icon-512.png               # PWA icon 512×512
│   │   └── icon-maskable-512.png      # Maskable icon for Android adaptive icons
│   └── robots.txt                     # Disallow all (no backend, no SEO surface needed)
├── src/
│   ├── main.tsx                       # React root: createRoot, StrictMode, mounts <App />
│   ├── App.tsx                        # Top-level shell: theme provider, keyboard listener registration
│   ├── registerSW.ts                  # Service worker registration shim (vite-plugin-pwa virtual module)
│   │
│   ├── engine/
│   │   ├── calculatorEngine.ts        # Pure functions: add, subtract, multiply, divide, percentage, toggleSign
│   │   ├── calculatorEngine.test.ts   # Vitest unit tests; 100% branch coverage required
│   │   └── index.ts                   # Re-export barrel
│   │
│   ├── fsm/
│   │   ├── calcFSM.ts                 # FSM transition table: states × events → (nextState, sideEffects)
│   │   ├── calcFSM.test.ts            # Vitest unit tests for every valid and invalid transition
│   │   ├── calcReducer.ts             # React useReducer-compatible reducer wrapping FSM transitions
│   │   ├── calcReducer.test.ts        # Vitest integration tests: reducer + engine together
│   │   ├── types.ts                   # CalcState, CalcEvent, CalcAction, FSM state enum, operator enum
│   │   └── index.ts                   # Re-export barrel
│   │
│   ├── dispatcher/
│   │   ├── actionDispatcher.ts        # Normalises KeyboardEvent / PointerEvent → CalcAction; routes to dispatch
│   │   ├── actionDispatcher.test.ts   # Vitest unit tests: key mapping, pointer mapping, unknown-key guards
│   │   ├── keyMap.ts                  # Constant map: keyboard key strings → CalcAction types
│   │   └── index.ts                   # Re-export barrel
│   │
│   ├── formatter/
│   │   ├── numberFormatter.ts         # Strategy chain: fixed-point → limited-precision → scientific notation
│   │   ├── numberFormatter.test.ts    # Vitest unit tests: edge cases (Infinity, NaN, very large, very small)
│   │   └── index.ts                   # Re-export barrel
│   │
│   ├── history/
│   │   ├── historyStore.ts            # localStorage adapter: read, append (FIFO 100-cap), clear, QuotaExceededError guard
│   │   ├── historyStore.test.ts       # Vitest unit tests: mocked localStorage, overflow, error handling
│   │   └── index.ts                   # Re-export barrel
│   │
│   ├── hooks/
│   │   ├── useCalcReducer.ts          # Composes calcReducer + useReducer; exposes state and dispatch
│   │   ├── useKeyboard.ts             # Attaches/detaches window keydown listener; calls actionDispatcher
│   │   ├── useTheme.ts                # Manages data-theme attribute; respects prefers-color-scheme
│   │   ├── useClipboard.ts            # Wraps navigator.clipboard.writeText with error fallback
│   │   ├── useHaptic.ts               # Wraps Navigator.vibrate with feature-detection guard
│   │   └── usePWAInstall.ts           # Captures beforeinstallprompt; exposes installable flag and prompt()
│   │
│   ├── components/
│   │   ├── Display/
│   │   │   ├── Display.tsx            # Shows current value/expression; aria-live="polite", aria-atomic="true"
│   │   │   ├── Display.module.css     # Display-specific styles; uses CSS Custom Properties
│   │   │   └── Display.test.tsx       # Testing Library: render, snapshot, aria-live assertion
│   │   ├── Keypad/
│   │   │   ├── Keypad.tsx             # CSS Grid keypad; renders KeyButton for each key definition
│   │   │   ├── Keypad.module.css      # Grid layout; clamp() for responsive button sizing
│   │   │   ├── Keypad.test.tsx        # Testing Library: click events dispatch correct actions
│   │   │   ├── KeyButton.tsx          # Semantic <button>; aria-label; :focus-visible; active-highlight class
│   │   │   ├── KeyButton.module.css   # Button styles; keyboard-active CSS class for highlight feedback
│   │   │   └── KeyButton.test.tsx     # Testing Library: aria-label, focus, keyboard-active class toggle
│   │   ├── ThemeToggle/
│   │   │   ├── ThemeToggle.tsx        # Dark/light toggle button; updates data-theme on <html>
│   │   │   ├── ThemeToggle.module.css # Toggle styles
│   │   │   └── ThemeToggle.test.tsx   # Testing Library: toggle interaction, aria-pressed state
│   │   ├── HistoryPanel/
│   │   │   ├── HistoryPanel.tsx       # Renders history entries from localStorage; clear button
│   │   │   ├── HistoryPanel.module.css
│   │   │   └── HistoryPanel.test.tsx
│   │   └── InstallBanner/
│   │       ├── InstallBanner.tsx      # Shown when usePWAInstall.installable === true
│   │       ├── InstallBanner.module.css
│   │       └── InstallBanner.test.tsx
│   │
│   ├── styles/
│   │   ├── tokens.css                 # CSS Custom Properties: --color-*, --font-*, --spacing-*, --radius-*
│   │   ├── reset.css                  # Minimal CSS reset (box-sizing, margin, padding normalisation)
│   │   ├── global.css                 # Imports tokens + reset; sets base font, body background
│   │   └── themes/
│   │       ├── light.css              # [data-theme="light"] overrides
│   │       └── dark.css               # [data-theme="dark"] overrides; also matched by prefers-color-scheme: dark
│   │
│   └── types/
│       └── global.d.ts                # Ambient declarations: CSS module types, vite-plugin-pwa virtual module
│
├── e2e/
│   ├── calculator.spec.ts             # Playwright: arithmetic flows, keyboard input, result display
│   ├── pwa.spec.ts                    # Playwright: manifest link present, SW registered, offline shell loads
│   ├── accessibility.spec.ts          # Playwright + axe-core: full-page axe scan, keyboard-only navigation
│   └── theme.spec.ts                  # Playwright: theme toggle, prefers-color-scheme emulation
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI pipeline (see §6)
│
├── Dockerfile                         # Multi-stage: build → nginx static serve (see §6)
└── docker-compose.yml                 # Local preview: nginx container on port 8080
```

---

## 3. Required Workflow

The agent **must** follow these steps in order. Do not skip or reorder.

### Step 1 — Read and Understand Specifications
- Read `AGENTS.md` in full before writing any code.
- Identify all modules, their responsibilities, and their inter-dependencies from §1 and §2.
- Note every hard constraint listed in §7.

### Step 2 — Create `tasks.md`
- Create `tasks.md` in the project root before touching any source file.
- Structure it as a Markdown checklist with sections mirroring the modules in §2.
- Each task must be atomic (one file or one clearly scoped behaviour).
- Mark tasks `[ ]` initially; update to `[x]` as each is completed.
- Example structure:

```markdown
# tasks.md
## Scaffold
- [ ] Initialise pnpm project, install all dependencies
- [ ] Configure tsconfig.json, vite.config.ts, vitest.config.ts, playwright.config.ts
- [ ] Configure ESLint, Prettier, .gitignore

## Engine
- [ ] Implement calculatorEngine.ts pure functions
- [ ] Write calculatorEngine.test.ts (100% branch coverage)

## FSM
- [ ] Define types.ts (CalcState, CalcEvent, CalcAction enums/types)
- [ ] Implement calcFSM.ts transition table
- [ ] Write calcFSM.test.ts (all valid + invalid transitions)
- [ ] Implement calcReducer.ts
- [ ] Write calcReducer.test.ts

## Dispatcher
...

## Components
...

## E2E
...

## CI / Docker
...
```

### Step 3 — Scaffold and Configure
1. Run `pnpm init` and install all dependencies declared in §1.
2. Create `tsconfig.json` with `strict: true`, `target: "ES2022"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`.
3. Create `tsconfig.node.json` for `vite.config.ts` (Node types, no DOM lib).
4. Create `vite.config.ts`:
   - Configure `vite-plugin-pwa` with `registerType: "autoUpdate"`, `workbox.globPatterns`, `manifest` object.
   - Set `resolve.alias`: `@` → `src/`, `@engine` → `src/engine/`, `@fsm` → `src/fsm/`, etc.
   - Set `build.target: "es2022"`, `build.sourcemap: true`.
5. Create `vitest.config.ts`:
   - `environment: "jsdom"`, `globals: true`, `coverage.provider: "v8"`, `coverage.thresholds.lines: 90`, `coverage.thresholds.branches: 90`.
6. Create `playwright.config.ts`:
   - `webServer.command: "pnpm preview"`, `webServer.port: 4173`.
   - Projects: `chromium`, `firefox`, `webkit`.
7. Configure ESLint with plugins: `@typescript-eslint`, `react`, `jsx-a11y`, `import`.
8. Configure Prettier. Add `.prettierrc` and a `lint-staged` + `husky` pre-commit hook.

### Step 4 — Implement in Dependency Order
Implement modules strictly in this order to avoid circular dependencies:

```
types.ts → calculatorEngine → numberFormatter → calcFSM → calcReducer
→ actionDispatcher → historyStore → hooks → components → App → main
```

For each module:
1. Write the TypeScript implementation.
2. Write its co-located test file immediately after.
3. Run `pnpm test --run <test-file>` and confirm it passes before moving on.
4. Mark the corresponding `tasks.md` item `[x]`.

### Step 5 — Implement Styles
1. Define all design tokens in `src/styles/tokens.css` before writing any component CSS.
2. Write `reset.css` and `global.css`.
3. Write `light.css` and `dark.css` theme overrides.
4. Write CSS Modules for each component; use only Custom Properties from `tokens.css` — no hardcoded colour or spacing values.

### Step 6 — Implement E2E Tests
1. Write all Playwright specs in `e2e/`.
2. Run `pnpm exec playwright install --with-deps` to install browsers.
3. Run `pnpm build && pnpm preview` and verify the app loads before running E2E.
4. Run `pnpm exec playwright test` and fix failures before proceeding.

### Step 7 — Validate Everything
Run all of the following and fix every error/warning before declaring done:

```bash
pnpm lint              # ESLint — zero warnings allowed
pnpm format:check      # Prettier — zero diffs allowed
pnpm test:coverage     # Vitest — must meet 90% lines + branches
pnpm build             # Vite build — zero errors, zero unresolved imports