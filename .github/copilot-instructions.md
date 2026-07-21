# Copilot Instructions for `dh-export`

- This is a minimal Vite + React app. The main app lives in `src/App.jsx` and the app is mounted from `src/main.jsx`.
- Use `package.json` scripts for local workflows: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- The project is plain JavaScript/JSX only; there is no TypeScript configuration or tests in this repo.
- `vite.config.js` is intentionally simple: only `@vitejs/plugin-react` is enabled.
- `eslint.config.js` uses the ESLint flat config API with `@eslint/js`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.

## Key code patterns

- Styling is in `src/App.css` and `src/index.css`. These files contain nested CSS selectors (e.g. `.hero { ... .base { ... } }`), so preserve the nested structure rather than converting it to plain flattened CSS.
- Image assets are imported directly in JSX from `src/assets/*` and static SVGs are loaded from `public/icons.svg` with `<use href="/icons.svg#...">`.
- The app is a single-page static client app; there is no backend integration or API layer in this repo.
- The app uses React 19 and modern ESM imports. Keep `import`/`export` syntax consistent with existing files.

## What to do and what to avoid

- When changing UI or copy, update `src/App.jsx` and related CSS only.
- Do not add unneeded Vite plugins or new build tooling unless the feature explicitly requires it.
- No test files exist, so do not assume a test runner is configured.
- Do not create or depend on hidden CI config; there is no existing `.github/workflows` directory.

## Helpful file references

- `package.json` — scripts and dependencies
- `vite.config.js` — Vite setup
- `eslint.config.js` — linting rules
- `src/main.jsx` — app bootstrapping
- `src/App.jsx` — main UI component
- `src/App.css` / `src/index.css` — styling conventions
- `public/icons.svg` — shared icon sprite assets
