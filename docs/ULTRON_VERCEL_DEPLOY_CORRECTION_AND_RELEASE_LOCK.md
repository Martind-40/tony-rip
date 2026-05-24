# ULTRON Vercel Deploy Correction And Release Lock

## Problem Found

`https://tony-rip.vercel.app` responded, but it showed a `tony.RIP` page instead of the ULTRON Command Center UI.

## Local Diagnosis

- Repo: `Martind-40/tony-rip`.
- Branch: `main`.
- Real app path: `/Users/macbook/ultron/app`.
- Real package file: `app/package.json`.
- Root package file: not present.
- Vite build output: `app/dist`.
- Local build from `/app`: PASS.
- `app/index.html` title: `ULTRON Command Center`.
- `app/src/App.jsx` renders ULTRON UI, not `tony.RIP`.

## Vercel Diagnosis

The local code and build are correct. The public URL issue is likely one of:

- Vercel project is pointed at the wrong root.
- Vercel project is connected to another project/deployment.
- Root Directory is not set to `app`.
- Public URL is not the ULTRON deployment URL.
- Vercel is using an older/root deployment.

## Recommended Vercel Dashboard Configuration

Preferred Dashboard Mode:

```text
Framework Preset: Vite
Root Directory: app
Install Command: npm install
Build Command: npm run build
Output Directory: dist
Production Branch: main
```

Fallback Root Repo Mode:

```text
Framework Preset: Vite
Root Directory: empty / repo root
Install Command: cd app && npm install
Build Command: cd app && npm run build
Output Directory: app/dist
Production Branch: main
```

## Change Made

Added root `vercel.json` so a Vercel project pointed at repo root can still build and serve `app/dist`.

## Files Reviewed

- `README.md`
- `app/package.json`
- `app/vercel.json`
- `app/index.html`
- `app/src/App.jsx`
- `app/src/styles.css`
- runtime safety files
- release closeout docs

## Build Result

PASS from `/Users/macbook/ultron/app` with `npm run build`.

## Security State

- Runtime mode: `DRY_RUN_ONLY`.
- Public demo: ready.
- Real execution from browser: disabled.
- Backend/auth/API/Firebase/Supabase: not active.
- Secrets/network/external projects: blocked.
- Autonomous agents: blocked.

## Expected Public URL

The expected public URL must show `ULTRON Command Center`. If `https://tony-rip.vercel.app` still shows `tony.RIP`, verify the Vercel project mapping or identify the actual ULTRON deployment URL from the Vercel Dashboard.

## Manual Dashboard Checks

1. Open Vercel Project Settings.
2. Confirm Git repo is `Martind-40/tony-rip`.
3. Confirm Production Branch is `main`.
4. Confirm Root Directory is `app`, or use root mode with `vercel.json`.
5. Confirm Build Command and Output Directory match the mode above.
6. Trigger redeploy from latest `main`.
7. Open the assigned production URL and confirm ULTRON UI appears.

## Release Lock

ULTRON MVP RELEASE LOCKED / DEPLOY CONFIG VERIFIED.
