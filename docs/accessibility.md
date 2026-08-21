# Accessibility

## Conformance level

This repository and everything published from it are held to **WCAG 2.2 AA**.

Oak National Academy is a UK public sector body and is subject to the Public
Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility
Regulations 2018, which reference WCAG 2.1 AA through the EN 301 549 harmonised
standard. WCAG 2.2 AA is a superset of 2.1 AA and is the more recent standard,
so it is the level recorded here.

## The formal statement

The published accessibility statement for the API is the authoritative record of
conformance, known issues and exemptions:

**https://www.thenational.academy/legal/accessibility-statement-api-version**

It is linked from the footer of every page the API serves (see
`src/lib/footerSections.ts`). This document does not restate it; if the two ever
disagree, the published statement is correct.

## What this covers

| Surface                                                | Held to WCAG 2.2 AA |
| ------------------------------------------------------ | ------------------- |
| The API site and documentation pages at `open-api.thenational.academy` | Yes |
| The interactive playground (`/playground`)              | Yes                 |
| Markdown documentation in this repository, read on GitHub | Yes, as far as the rendering allows |
| JSON and other machine-readable API responses           | Not applicable — not a user interface |
| Bulk download archives                                  | Not applicable — the assets inside carry Oak's content-level accessibility position |

The playground is built on `swagger-ui-react`, a third-party component. Where
its markup limits what can be fixed from this repository, that is recorded in
the published statement rather than here.

## Writing accessible documentation

When adding or changing documentation in this repository:

- Use real heading levels in order (`#`, then `##`, then `###`). Do not skip a
  level, and do not use bold text as a heading.
- Give every image meaningful alternative text. If an image is purely
  decorative, say so by leaving the alt text empty rather than describing it.
- Write link text that makes sense out of context. "See the endpoint index"
  rather than "click here" or a bare URL.
- Do not rely on colour alone to carry meaning.
- Use real tables with header rows, not ASCII layout, for tabular data.
- Expand an abbreviation the first time it appears, or add it to
  [glossary.md](glossary.md).
- Keep a plain-English summary near the top of anything a non-technical reader
  may need.

## Reporting a barrier

If something in the API documentation, the playground, or this repository is not
accessible to you, tell us through the
[API feedback form](https://bvumd.share.hsforms.com/2nacebr1eQuKMoA-vGpkjCA).
Include the page or file, what you were trying to do, and any assistive
technology you were using.

Accessibility reports are triaged by the **@oaknational/devs** team, with a first
response within 5 working days. See [SUPPORT.md](../SUPPORT.md).

The published statement also describes the enforcement route if you are not
satisfied with how we respond.
