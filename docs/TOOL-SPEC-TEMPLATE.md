# Tool spec: {Tool name}

Save as `docs/specs/{slug}.md`. One spec per tool. Claude Code builds from this file.

| Field | Value |
|---|---|
| Slug | `{slug}` |
| Category | `{freelance / fees / tax / ...}` |
| Risk | 🟢 green / 🟡 yellow / 🔴 red |
| Main keyword | `{e.g. freelance hourly rate calculator}` |
| Long-tail keywords | `{3–6 variations}` |
| Affiliate | `{partner id from config/affiliates.json, or none}` |
| Related tools | `{slugs}` |

## What it calculates
One or two sentences in plain English.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| | | | | |

### Currency defaults (only if the tool has a currency selector)
| Currency | Field defaults that change with currency |
|---|---|
| USD / CAD / AUD | |
| GBP / EUR | |
| INR | |

Untouched fields switch to these when the currency changes; values the user typed are kept.

## Outputs
| Output | How it's shown |
|---|---|
| | |

## Formula
Plain-English explanation, then the exact formula.

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| `{/rates/x.json or none}` | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | | | {official calculator URL or manual calculation} |
| 2 | | | |
| 3 | | | |

## Extras
- Chart: {yes/no, what it shows}
- Scenario compare: {yes/no}
- Share / Print / Embed: yes

## Content notes
- Examples to use
- FAQ questions (6–10)
- Common mistakes / tips
