# Audit issue format (contract)

The Auditor agent MUST produce a GitHub issue in exactly this shape. The
`approve-handler` workflow parses the hidden manifest — drift breaks the loop.

## Title
`Audit: <repo> — <YYYY-MM-DD>`

## Labels
`audit-report` (always). COMPLEX items additionally get `needs-design` when
their own follow-up issue is opened (out of scope for E.0-A; Auditor only lists them).

## Body

1. One-paragraph summary: what was scanned (git log window, CI, deps, tests).
2. A numbered list of 5–10 items. Each item:
   - **N. [CATEGORY] Title** (CATEGORY ∈ TRIVIAL | STANDARD | COMPLEX)
   - **What:** one or two factual sentences.
   - **Why:** the concrete signal that surfaced it.
   - **Acceptance:** what "done" means (testable).
   - **Size:** XS | S | M.
3. A closing hidden manifest, last thing in the body:

```
<!-- AUDIT-MANIFEST
{"repo":"<repo>","generated":"<YYYY-MM-DD>","items":[
  {"n":1,"category":"TRIVIAL","title":"..."}
]}
AUDIT-MANIFEST -->
```

## Hard rules
- Every item has exactly one category. No "TRIVIAL/STANDARD" hedging.
- COMPLEX = architectural / 5+ files / multi-module / needs trade-off discussion.
  COMPLEX is listed for visibility only and is NEVER auto-implemented.
- Max 10 items. More findings → say so in the summary; do not exceed 10.
- The manifest `items` array must list every numbered item with the same `n`.
