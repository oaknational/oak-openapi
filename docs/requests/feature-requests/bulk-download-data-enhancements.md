---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 13
---

# Bulk download data enhancements

## Feasibility

- **Realistic**: Yes — `api-supplementation.ts` in the search CLI makes
  live API calls specifically to fill these gaps. Real code, real problem.
- **Achievable**: Yes — every field requested already exists in the API or
  is constructible from patterns:
  - **tiers**, **examSubjects**: Nested in the API's
    `GET /sequences/{sequence}/units` response. Phase 1 denormalises these
    onto units for bulk export.
  - **categories**: Exist in the API `SequenceUnitsResponseSchema`.
    Phase 2a adds them to bulk export. Note: `categorySlug` is optional
    in the API schema; only `categoryTitle` is required.
  - **unitOptions**: Exist in the API. Phase 2b denormalises with grouping.
  - **canonicalUrl**: Not a field in the API, but constructible from
    unit/lesson metadata + the canonical URL map
    (`canonical-url-map.json`, which provides `lessonToProgrammeUnit`
    and `unitToProgramme` lookups for 27,797 paths) + URL patterns from
    the Oak-Web-Application code. Phase 2c defines pattern rules and
    generates these URLs. **Note**: The canonical URL map does not
    include programme landing pages; additional programme URLs exist
    beyond the map. Programme slugs include exam board, tier, and
    learning variant suffixes that cannot be derived from
    subject+keystage alone.
- **Data source**: `SequenceUnitsResponseSchema` in OpenAPI plus fields already
  present in bulk outputs.
- Phase 1 (tier + examSubject): size **5** (schema change, backfill,
  endpoint mods, bulk regen, validation)
- Phase 2a+2b (categories + unitOptionGroup): size **5** (unblocked)
- Phase 2c (canonicalUrl): deferred pending ownership decision for URL pattern
  logic and long-term maintenance
- Phase 3: covered in [bulk-download-data-integrity](../bug-fixes/bulk-download-data-integrity.md)

## Evidence

Live oak-prod MCP calls confirm the key shape gaps:

- `get-sequences-units(sequence: \"maths-secondary\", year: \"10\")` returns
  `tiers[]` groups (tier data exists in API sequence responses).
- `get-sequences-units(sequence: \"science-secondary-aqa\", year: \"10\")`
  returns `examSubjects[]` with nested `tiers[]` (exam-subject context exists).
- `get-sequences-units(sequence: \"english-secondary-aqa\", year: \"10\")`
  returns `unitOptions[]` and `categories[]` on units (both already available in
  sequence-unit responses).
- `get-sequences-assets(sequence: \"maths-primary\", year: \"1\")` returns
  lesson-level `canonicalUrl` values in the MCP response, showing URL
  construction is already possible in the serving layer.

**Backwards compatibility**: All new fields are optional additions.
Existing bulk consumers are unaffected.

**Related**: See also
[programme-variants-and-identifiers.md](programme-variants-and-identifiers.md)
— overlapping tier/examBoard/examSubject fields that should use
consistent naming across API responses and bulk exports.

**Goal**: Enable search index creation entirely from bulk download data,
eliminating all live API calls during ingestion.

**Context**: The search CLI currently uses a hybrid approach — bulk
download files as the primary data source, supplemented by live API calls
for data missing from the downloads. This creates a runtime dependency on
API availability and rate limits during ingestion. These phased
enhancements would remove that dependency and progressively improve
search quality.

---

## Phase 1 — Eliminate API calls during ingestion

These two additions are the only data gaps that currently force live API
calls. Resolving them allows fully offline ingestion from bulk files.

### 1a. Maths KS4 tier structure

**Problem**: Maths KS4 units exist in both Foundation and Higher tiers,
but the bulk download contains no tier information. The 66 KS4 units
produce 373 duplicate lesson entries with no distinguishing field. The
only way to resolve which tier a unit belongs to is the live API's
`GET /sequences/maths-secondary/units` response, which nests units
inside `tiers[].units[]`.

**Suggested approach**: Add an optional `tier` field to units in the bulk
download. This follows the existing convention of flat metadata fields on
units (like `examBoards`, `yearSlug`) rather than introducing nested
grouping.

```jsonc
// In sequence[]:
{
  "unitSlug": "algebraic-manipulation",
  "unitTitle": "Algebraic manipulation",
  "keyStageSlug": "ks4",
  "tier": { "slug": "foundation", "title": "Foundation" },
  // ... existing fields
}
```

A flat `tier` object on the unit is preferred over nesting units inside
tier groups because:

- It matches the existing flat-unit-array structure of `sequence[]`
- It avoids a structural divergence where maths KS4 uses a different
  array shape than every other subject
- It keeps units addressable by array index without tier-aware traversal
- A unit belongs to exactly one tier in a given sequence, so a single
  object (not an array) is correct

Units that have no tier (all non-KS4 subjects, plus KS3 maths) would
simply omit the field.

### 1b. Science KS4 exam subject grouping

**Problem**: Science KS4 units belong to specific exam subjects (Physics,
Chemistry, Biology, Combined Science) but the bulk download's single
`science-secondary.json` file contains all units in a flat list with no
exam subject indicator. The live API's
`GET /sequences/science-secondary-aqa/units` response nests units inside
`examSubjects[].tiers[].units[]`, providing this mapping.

**Suggested approach**: Add an optional `examSubject` field to units,
following the same flat-field pattern as the tier addition above.

```jsonc
// In sequence[]:
{
  "unitSlug": "particle-explanations-of-density-and-pressure",
  "unitTitle": "Particle explanations of density and pressure",
  "keyStageSlug": "ks4",
  "tier": { "slug": "foundation", "title": "Foundation" },
  "examSubject": { "slug": "physics", "title": "Physics" },
  // ... existing fields
}
```

This is preferred over separate files per exam subject or nested
grouping for the same reasons as tiers: it keeps the unit array flat and
uniform across all subjects.

**Note**: Science KS4 units also have tiers (Foundation/Higher), so both
`tier` and `examSubject` would appear together on science KS4 units.

### Phase 1 impact

With these two additions, the search CLI can set `client: null` for the
entire ingestion pipeline. The `api-supplementation.ts` module and its
API calls become unnecessary. Currently 4+ API calls per ingestion run
(1 for maths sequences, 1 for maths units, 1 for science sequences,
3 for science units per exam board) are eliminated.

---

## Phase 2 — Enable richer search features

These additions do not currently cause API calls (the code paths exist
but are dormant). They would enable new search capabilities.

### 2a. Categories (unit topics)

**Problem**: The API provides `categories` on units (e.g., Grammar,
Spelling, Vocabulary for English; Biology, Chemistry, Physics for
science). These are absent from the bulk download. The search CLI has
complete category extraction code ready to consume this data, but it is
never activated because there is no data source.

**What it enables**:

- Faceted search — filter by topic within a subject
- Context enrichment — display topic labels alongside search results

**Suggested approach**: Add an optional `categories` array to units,
matching the shape already used in the API response.

```jsonc
// In sequence[]:
{
  "unitSlug": "five-sentence-types",
  "unitTitle": "Five sentence types",
  "categories": [
    { "categoryTitle": "Grammar", "categorySlug": "grammar" }
  ],
  // ... existing fields
}
```

### 2b. Unit options (alternative units)

**Problem**: Some subjects offer alternative units at the same sequence
position (e.g., English Year 5 offers "The Aye-Aye: non-chronological
report" OR "Wild Cats: non-chronological report"). The API's
`GET /sequences/{slug}/units` response includes `unitOptions[]` on these
units, but the bulk download resolves each option into a separate
top-level unit with no link back to the parent or its alternatives.

This causes unresolvable phantom duplicates — English (47 units),
Geography (67 units), and History (25 units) contain duplicate entries
that cannot be distinguished or grouped.

**What it enables**:

- Correct deduplication during ingestion
- Search result grouping — show alternatives together
- Understanding which units are primary vs alternative

**Suggested approach**: Add an optional `unitOptionGroup` field to units
that share alternatives. Units not part of an option group omit the
field.

```jsonc
// In sequence[]:
{
  "unitSlug": "the-aye-aye-or-wild-cats-non-chronological-report-506",
  "unitTitle": "The Aye-Aye: non-chronological report",
  "unitOptionGroup": "the-aye-aye-or-wild-cats-non-chronological-report",
  // ... existing fields
},
{
  "unitSlug": "the-aye-aye-or-wild-cats-non-chronological-report-504",
  "unitTitle": "Wild Cats: non-chronological report",
  "unitOptionGroup": "the-aye-aye-or-wild-cats-non-chronological-report",
  // ... existing fields
}
```

### 2c. Canonical URL

**Problem**: Canonical URLs (the Oak website paths for lessons, units, and sequences)
must be constructed from lesson/unit/sequence metadata and URL patterns from the
website routing logic. They are not currently in bulk downloads, forcing consumers
to either maintain their own URL pattern logic or derive them from the canonical-url-map.

**What it enables**:

- Direct links from search results to the Oak website
- Consistent URL construction across all consumers

**Suggested approach**: Define URL pattern rules from the Oak-Web-Application code
and generate `canonicalUrl` fields during bulk export for lessons, units, and sequences.
Include pattern documentation in bulk schema.

**Status**: Deferred until API-team confirms this belongs in this repo and agrees
ownership boundaries.

---

## Phase 3 — Data quality fixes

Covered in
[bulk-download-data-integrity.md](../bug-fixes/bulk-download-data-integrity.md)
(items 1-3: exam board deduplication, field name casing, and referential
integrity validation).

---

## Appendix: What the bulk downloads already include

For reference, the bulk downloads currently provide:

- **Lessons**: title, slug, unit/subject/key stage metadata, keywords,
  key learning points, misconceptions, pupil outcomes, teacher tips,
  content guidance, supervision level, transcripts (sentences + VTT)
- **Units**: title, slug, threads, exam boards, prior knowledge,
  national curriculum content, description, year, key stage,
  why-this-why-now, unit lessons
- **Sequences**: full ordered unit lists per subject
- **KS4 options**: listed at sequence level (exam boards, pathways)

## Evidence requirement

Where this request references data gaps, include reproducible examples from
current API and bulk payloads before implementation starts.
