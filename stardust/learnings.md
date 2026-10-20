# Learnings — KBC Particulieren replica run (2026-10-19)

- deploy-batch.mjs exits 2 (fatal ENOENT) when the --log directory does not exist; create the dir first.
- Source root 308 → /particulieren/nl.html: the redirects sheet carries `/` and `/index.html` → the landing page; `/` then ends 200 on both origins.
- A per-template page grid with no foundation home (runtime-contract notInFoundation) stays block-scoped at C-final; a foundation request that only documents this needs no re-gate.
- With a fixed page scope, localize-links still matters: 7 hrefs between in-scope pages were absolute to the source until E2.
