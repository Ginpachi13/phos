# Phos — logo brief

## 0. Fill-in header
- Client name: Phos. Exact spelling: lowercase "phos" for the wordmark (per client brief PDF, page 2: "Lowercase serif wordmark 'phos'"). Confirmed from the client's own 10-page framework document, `Website Framework and Home Page Copy.pdf`, read 2026-10-21.
- Industry/cluster: personal media brand / author-creator hub (reading, travel, recommendations). Closest cluster: independent newsletter/ideas publisher (Philosophy Break, Academy of Ideas type), not a travel agency and not a publisher imprint.
- Name state: FINAL as a working name for this build ("phos" is the confirmed site name in the brief, used as the live site folder `~/phos-site` and in the wordmark spec). It is a dictionary Greek word (φῶς, "light"), not a coined mark. Note for Gate 7: a dictionary-word name narrows trademark scope versus a coined name; the search step still runs on it as instructed.
- Existing mark: none found. No existing logo file was supplied. This is a new mark.
- Live site/colours already in use: YES, from the client brief PDF (page 2, "Visual direction"):
  - Ground: near-black.
  - Light/accent: gold #FFD98A (default, author says "adjustable").
  - Wordmark ink: cream #F3EBD8.
  - Wordmark typeface: Instrument Serif (lowercase). Body typeface: Inter.
  - Eyebrow line "φῶς · Greek for light" above the headline.
  These colours win the tie per brief rule 0; the mark is built to this palette, not a new one.
- Other brands sharing colours/marks: none known. No shared palette constraint found.

## Design reference (placement requirement, not a copy target)
Per task instructions, the new site copies IVRESS (brand.ivress.co.jp) in layout and motion, not in mark design. The Phos mark must work in the same three slots IVRESS uses:
1. Small centered header emblem, about 24–40 px tall, on near-black.
2. A tiny loader symbol shown above a percent counter.
3. A favicon.
The new mark must NOT copy the IVRESS emblem (name in condensed caps inside a thin outlined lens/eye oval) or its loader mascot (two dot eyes). Candidate ideas to test, per task instructions: light through an opening, a lens/eye shape, a shaft of light, the Greek letter φ (phi).

## 1. Who the customers are, and how this was researched
See `research-customers.md` (written from a live WebSearch/WebFetch pass). Two groups per the client brief:
- Group A — readers and followers: come for books, audio recordings, newsletter, reading picks. This group sees the mark first (homepage hero, email).
- Group B — community members: come to find trusted people/places and to submit their own recommendations (Trusted Services, Food and Drinks, Submit a Recommendation).

## 2. Category conventions
See `research-category.md` for the sourced competitor/reference scan (Philosophy Break, Academy of Ideas, Farnam Street, Daily Stoic, The Marginalian, Austin Kleon, and illumination-brand references Calm/Headspace/Lumen-type apps).

## 3. Distinctive element
Tested direction: a single shaft or point of warm light breaking a near-black field, built so the gold accent is the identifier and survives at 16 px as a small bright core rather than a thin line (thin keylines fail Gate 1/Gate 2 at small sizes per corpus finding L7-F06, L7-F21). Candidate B below also tests a phi (φ)-based reading. The element ties to the name's literal meaning (phos = light), which the client's own brief already states as the "Lumen" look. This is not a hidden metaphor; it is the stated brand concept.

## 4. Forbidden elements (Phos-specific)
- No eye or lens shape rendered as an outlined oval around condensed caps — that is IVRESS's specific emblem construction. A lens/circle motif may be used only if its proportions and treatment clearly differ (see Gate 6 compare).
- No two-dot "mascot face" — that is IVRESS's loader mascot.
- No sun/sunburst cliché (rays radiating symmetrically from a circle) — overused in "wellness/light" branding (Headspace, many yoga/meditation marks use a circle-ray sun). Depart from it.
- No candle flame icon — cliché for "enlightenment" branding.
- No bulb/lightbulb icon — on-the-nose, overused in "idea" branding generally.
- No religious iconography (halo, aureole, cross) despite the Greek-word, "soul" messaging — the brand is secular/personal, not devotional.
- No stock human silhouette, no rating/"#1" claim in the mark (standard ban, [L7-F26]).
- No other company's mark (Google "G" dot, OpenAI-style, Calm/Headspace circle, IVRESS lens).

## 5. Palette roles with counts
| Role | Count | Hex | Where it may go | Where it must not go |
|---|---|---|---|---|
| Ink/ground | 1 | #0B0B0C (near-black, close to brief's "near-black") | Page background, dark chrome | — |
| Accent/identifier | 1 | #FFD98A (gold, client's own stated default) | The light shape itself | Must not also be the only ground colour tested — see Gate 3 |
| Wordmark ink | 1 | #F3EBD8 (cream, client's own stated colour) | Wordmark letterforms only | Not used in the symbol's identifier |
Total: 3 named colours (ink/ground, accent, wordmark cream), matching the brief's own stated palette exactly — client ground wins the tie per brief rule 0. Contrast: gold #FFD98A on #0B0B0C = high ratio (light accent on near-black, this is the client's own primary use case and the one the QA gate's "client ground" test targets). Cream #F3EBD8 on #0B0B0C is also high contrast (near-white text on near-black).

## 6. Sizes and grounds to test
16, 32, 64, 128 px (symbol). White, black, client ground #0B0B0C (the real use case — header/loader/favicon all sit on near-black per the brief). One colour positive, reversed, knockout.

## 7. Lockup plan
- Lockup: symbol only (header emblem, loader symbol, favicon — all symbol-first per the task).
- Wordmark: separate, typeset locally from Instrument Serif (downloaded `fonts/InstrumentSerif-Regular.ttf`, OFL, Google Fonts), lowercase "phos", cream #F3EBD8, stacked and horizontal.
- Favicon: square tile crop of the passing symbol candidate (export.py), not a scaled full lockup.
- One generator (Recraft V4.1 vector via Higgsfield) for the symbol across all 3 candidates so the identifier shape logic stays comparable.

## 8. Candidates
Three candidates, same palette, differing construction (see `specs.md`). Prompts carry no words.

## 9. Open questions
- The client brief PDF leaves "what does Phos offer in one sentence" as an open decision (page 10) — does not block the logo.
- Exact near-black hex: brief says "near-black," not a locked hex. Used #0B0B0C as a working value; the owner may adjust slightly without affecting the logo gate (gate is run against this ground).
- Gold #FFD98A is marked "adjustable" by the brief's own author. Built to the stated default; flag if the owner wants a different gold.
