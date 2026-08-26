# Architecture diagrams — how to add one

Every project can carry an **interactive Architecture tab** in its case-study
modal. The diagram is fully data-driven: you write one JSON file, the tab
appears. No component or logic changes.

## The rule

**Filename must equal the project's slug.**

```text
src/data/projects.ts          →  slug: 'resume-ranker'
src/data/architecture/resume-ranker.json   ← drop this file, done
```

The loader (`index.ts`) globs every `*.json` in this folder at build time and
keys the spec by filename. Files starting with `_` are ignored (that's how
`_template.json` stays a reference).

## Schema

```jsonc
{
  "title": "Design-doc heading shown above the diagram",
  "intro": "One or two sentences of engineering context.",

  "nodes": [{
    "id": "backend",            // unique slug; edges reference it
    "label": "FastAPI",         // main display name
    "subtitle": "Python · async", // small layer line (optional)
    "role": "What it does in the system.",
    "why": "Why this choice was made.",
    "alternatives": ["Express.js", "Django", "Flask"],
    "tradeoffs": "The honest trade-off."
  }],

  "edges": [
    { "from": "user", "to": "backend", "label": "HTTPS" } // label optional
  ]
}
```

## Layout

The diagram is a layered graph, so keep edges pointing "downstream"
(dependency → dependant, or request → handler → store). The renderer computes
vertical ranks from the edges automatically — anything from a linear
`User → Frontend → Database` chain to a fan-out like this site's
`twin → [knowledge, llm]` works.

**Keep it acyclic.** A cycle (e.g. a reply edge back up the stack) would
collapse the layered layout into a single row.

## Voice

Write like a design doc, not marketing: specific, calm, and honest about
trade-offs. Every node should answer "why does this exist, and what did I give
up to have it?" — that's the point of the explorer.
