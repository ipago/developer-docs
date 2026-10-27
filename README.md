# iPago developer docs

Public documentation for iPago: creator guides and developer docs (API, checkout, webhooks, storefront, Game API). The site is a Next.js app using [Fumadocs](https://fumadocs.dev).

The published site is [https://docs.ipago.io](https://docs.ipago.io). The container image is `ghcr.io/ipago/developer-docs`.

## Requirements

- Node.js 22
- pnpm 10.33.0 (`packageManager` in `package.json`; Corepack will select it)

No environment variables are required to install, lint, typecheck, test, or build. See `.env.example` for optional names.

## Run

```bash
pnpm install
pnpm dev
```

`pnpm dev` serves the site at [http://localhost:3001](http://localhost:3001).

## Build

```bash
pnpm build
pnpm start
```

`pnpm start` serves the production build on port 3001. The container listens on port 3000.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

This repository did not include a test suite. `pnpm test` runs Node's test runner and passes with zero tests.

## API reference

`content/dev/reference` and `lib/reference/openapi.public.json` are generated from the API OpenAPI document. That document lives with the API (the platform repo, `ipago/platform`) and includes non-public routes, so it is not committed here.

`pnpm reference:gen` (also run by `dev` and `build`) keeps the committed pages when the spec is absent. To regenerate, copy the API's OpenAPI document to `openapi.source.json` (gitignored) or set `OPENAPI_SPEC` to its path, then run `pnpm reference:gen`.

## Container

```bash
docker build -t ghcr.io/ipago/developer-docs .
```

Build context is this repository. GitHub Actions (`.github/workflows/images.yml`) builds the image and, on pushes to `main` only, pushes `ghcr.io/ipago/developer-docs` tagged with the full commit SHA, the short SHA, and `latest`.
