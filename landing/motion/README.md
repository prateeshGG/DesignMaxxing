# Vercel deploy shim (not Flute)

The Vercel project's **Root Directory** points at this folder. `vercel.json` here copies the static landing page from `../prototype/` into `dist/` and serves `landing-v4.html` as `index.html`.

Nothing else lives here. The old Flute studio that used to be in this folder was rejected and deleted. Motion is made only with the code film engine in `../films/`.

To simplify later: set Vercel's Root Directory to the repo root (the root `vercel.json` does the same job), then delete this folder.
