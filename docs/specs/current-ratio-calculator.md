# Tool spec: Current Ratio Calculator

> **Approved by Puru (2026-11-21).** Pure maths: every number comes from the user's own balance sheet. The page never says what ratio is "good", "healthy", "safe" or "risky", and never quotes an industry benchmark.

| Field | Value |
|---|---|
| Slug | `current-ratio-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `current ratio calculator` |
| Long-tail keywords | `quick ratio calculator`, `acid test ratio calculator`, `how to calculate current ratio`, `working capital calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `break-even-calculator`, `runway-calculator`, `margin-vs-markup-calculator` |

## What it calculates
One form, three results (no modes):
- **Current ratio** = current assets ÷ current liabilities.
- **Quick ratio** = (current assets − inventory − prepaid expenses) ÷ current liabilities.
- **Working capital** = current assets − current liabilities. This is the same two numbers subtracted instead of divided, so it adds nothing new and needs no outside figure.

Under the ratios is one factual line per ratio: "{ratio} of current assets for every 1 of current liabilities" (quick ratio: "of quick assets"). There are no colour bands and no words like "good" or "weak". Below 1, the working-capital row says "Current liabilities are {amount} more than current assets." That describes the maths, not a judgment.

Some books use another quick-ratio formula: (cash + short-term investments + receivables) ÷ current liabilities. The content section mentions it in one sentence. The tool uses the subtraction formula Puru specified; the one sentence about the other formula stays (Puru, 2026-11-21), and the FAQ explains that both give the same answer when current assets hold nothing else.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Affects only how amounts are formatted. The ratios don't change |
| Current assets | currency | 250,000 | 0 – 1,000,000,000,000 | Required. Help: "Cash, receivables, inventory and other assets you expect to turn into cash within a year. Example value only." |
| Current liabilities | currency | 125,000 | 0.01 – 1,000,000,000,000 | Required. 0 → "Enter current liabilities above 0" (no ÷ 0) |
| Inventory (optional) | currency | 60,000 | 0 – 1,000,000,000,000 | `optional`, empty = 0 |
| Prepaid expenses (optional) | currency | 10,000 | 0 – 1,000,000,000,000 | `optional`, empty = 0. Help: "Costs paid in advance, like rent or insurance." |

If inventory + prepaid is more than current assets, the inventory field shows "Inventory and prepaid expenses can't be more than current assets". It is a field error, so the quick ratio never goes negative.

URL keys: `currency`, `assets`, `liab`, `inv`, `prepaid`.

### Currency presets (example values; the ratios come out the same, only the size changes)
| Currency | Current assets | Current liabilities | Inventory | Prepaid |
|---|---|---|---|---|
| USD / CAD / AUD | 250,000 | 125,000 | 60,000 | 10,000 |
| GBP / EUR | 200,000 | 100,000 | 50,000 | 8,000 |
| INR | 50,00,000 | 25,00,000 | 12,00,000 | 2,00,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Current ratio** | Main result, always 2 decimals ("2.00"), then the factual "for every 1" line |
| **Quick ratio** | Second big figure, 2 decimals |
| Quick assets | current assets − inventory − prepaid |
| Working capital | current assets − current liabilities (shown with a minus sign when negative) |

## Formula
```
current ratio   = current assets ÷ current liabilities
quick assets    = current assets − inventory − prepaid expenses
quick ratio     = quick assets ÷ current liabilities
working capital = current assets − current liabilities
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD defaults: 250,000 / 125,000 · inventory 60,000 · prepaid 10,000 | current **2.00** · quick assets 180,000.00 · quick **1.44** · working capital **125,000.00** |
| 2 | 90,000 / 120,000 · inventory 30,000 · prepaid 0 | current **0.75** · quick **0.50** · working capital **−30,000.00** · "Current liabilities are 30,000.00 more than current assets" |
| 3 | 100,000 / 30,000 · inventory 25,000 · prepaid 5,000 | current **3.33** · quick **2.33** · working capital 70,000.00 |
| 4 | 150,000 / 100,000 · inventory and prepaid empty | current **1.50** · quick **1.50** (same) |
| 5 | INR defaults: ₹50,00,000 / ₹25,00,000 · ₹12,00,000 · ₹2,00,000 | current **2.00** · quick **1.44** · working capital **₹25,00,000.00** |
| 6 | GBP defaults: £200,000 / £100,000 · £50,000 · £8,000 | current **2.00** · quick **1.42** · working capital £100,000.00 |
| 7 | Switch USD → INR without editing | all four amounts take the INR presets. A typed amount is kept |

## Edge cases
- Current liabilities 0 or empty → field error. Current assets 0 → ratios 0.00 (valid), working capital negative.
- Inventory + prepaid > current assets → field error on inventory. Equal → quick ratio 0.00 (valid).
- Negative values → field error. Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear current assets / current liabilities → "Enter a number" and "—". Clear inventory / prepaid (optional) → valid, so the quick ratio uses 0.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch every currency → amounts follow the presets while untouched, and the result updates.

## Extras
- Chart: no. Scenario compare: yes, Plan B = another period or another company's numbers (all four inputs). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 5.
- FAQ: the 6 keyword-map questions + "Which numbers go into current assets?" + "Why take inventory out for the quick ratio?". "What is a good current ratio?" (Puru, 2026-11-21) is answered like Compa Ratio: no single good number, it depends on the business, the calculator shows and does not judge. "What does a current ratio below 1 mean?" is answered with maths only: liabilities due within a year are bigger than the assets expected to turn into cash in that time. No "this is bad".
- Never state a "good" or "typical" ratio, a lender's rule of thumb or an industry average. Tip: compare your own ratio over several periods (Plan B).
