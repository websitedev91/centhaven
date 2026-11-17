# Tool spec: Website Design Cost Calculator

> **Approved by Puru, 2026-11-18.** Pricing model approved in plan: hours × your rate, with example hours you can edit, and no market prices.

| Field | Value |
|---|---|
| Slug | `website-design-cost-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths, the user's own rate |
| Main keyword | `website design cost calculator` (100–1K/month) |
| Long-tail keywords | `how much to charge for a website`, `web design pricing calculator`, `website cost estimate` |
| Affiliate | none |
| Related tools | from the keyword map: `freelance-quote-generator`, `hourly-rate-calculator`, `freelance-invoice-generator` (only live ones are shown) |

## What it calculates
It estimates the price of a website project from the hours it needs and **your** hourly rate. You choose the number of pages, a design level and the features. Each item adds example hours that you can edit. The tool adds a buffer for project management and changes, and gives an optional monthly maintenance fee.

It states no "market price" for websites. Under the feature list it says: "Example values — change them to match how you work."

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | |
| Your hourly rate | currency | 75 | 0 – 1,000,000 | Link: "Not sure? Work it out with the freelance hourly rate calculator." |
| Number of pages | number | 5 | 1 – 100 | Whole number |
| Design and build hours per page | number | 4 | 0.5 – 100 | Example value |
| Design level | segmented | Custom | Template ×0.5 · Custom ×1 · Premium ×1.5 | Multiplies the page hours |
| Setup, discovery and launch | hours | 6 | 0 – 500 | Example value |
| Contact form | checkbox + hours | on · 2 | 0 – 500 | |
| Blog | checkbox + hours | off · 6 | 0 – 500 | |
| Online shop (e-commerce) | checkbox + hours | off · 25 | 0 – 500 | |
| Booking / appointments | checkbox + hours | off · 8 | 0 – 500 | |
| Multiple languages | checkbox + hours | off · 10 | 0 – 500 | |
| SEO setup | checkbox + hours | on · 5 | 0 – 500 | |
| Copywriting | checkbox + hours **per page** | off · 2 | 0 – 100 | |
| Buffer for changes and project management | % slider | 15 | 0 – 50 | |
| Maintenance hours per month | number | 2 | 0 – 200 | 0 hides the maintenance rows |

URL keys: `rate`, `pages`, `hpp`, `level` (`template` / `custom` / `premium`), `setup`, then for each feature an on/off flag and an hours value (`contact`/`contactH`, `blog`/`blogH`, `shop`/`shopH`, `booking`/`bookingH`, `lang`/`langH`, `seo`/`seoH`, `copy`/`copyH`), `buffer`, `maint`.

### Currency defaults
Only the hourly rate changes with currency. Hours are the same in every currency. Example inputs only.

| Currency | Hourly rate |
|---|---|
| USD | 75 |
| CAD | 85 |
| AUD | 90 |
| GBP / EUR | 60 |
| INR | 1,500 |

## Outputs
| Output | How it's shown |
|---|---|
| **Project price** (with buffer) | Main result |
| Quote range | "Without the buffer: {price without buffer}" (low end of the range; hidden when the buffer is 0) |
| Total hours | Breakdown |
| Hours and price per section | Breakdown table: Setup · Design and build · Copywriting · each enabled feature · Buffer. Plus a `SplitBar` of hours by section |
| Maintenance fee | "{fee} per month · {fee × 12} per year" (hidden when 0) |
| Next step | Link: "Turn this into a quote" → freelance quote generator (shown only once that tool is live; no pre-fill in v1) |

## Formula
```
levelMultiplier = template 0.5 · custom 1 · premium 1.5
designHours     = pages × hoursPerPage × levelMultiplier
copyHours       = copy on ? pages × copyHoursPerPage : 0
featureHours    = sum of hours for each feature that is on (contact, blog, shop, booking, languages, SEO)
baseHours       = setup + designHours + copyHours + featureHours
bufferHours     = baseHours × buffer%
totalHours      = baseHours + bufferHours
basePrice       = baseHours × rate          (low end of the range)
price           = totalHours × rate         (main result)
maintenance     = maintHours × rate per month; × 12 per year
```

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | USD defaults: rate 75 · 5 pages × 4 h · custom · setup 6 · contact 2 · SEO 5 · buffer 15% · maint 2 | design 20 · features 7 · base 33 h · buffer 4.95 h · **total 37.95 h** · **price 2,846.25** · range from 2,475.00 · maintenance 150.00 / month, 1,800.00 / year | Manual |
| 2 | INR · rate 1,500 · 10 pages × 4 h · premium · setup 6 · copy on 2/page · contact 2 · blog 6 · SEO 5 · languages 10 · buffer 20% · maint 4 | design 60 · copy 20 · features 23 · base 109 h · buffer 21.8 h · **total 130.8 h** · **price 1,96,200.00** · from 1,63,500.00 · maintenance 6,000.00 / month, 72,000.00 / year | Manual |
| 3 | GBP · rate 60 · 3 pages × 4 h · template · setup 6 · contact 2 · shop 25 · SEO off · buffer 0% · maint 0 | design 6 · features 27 · **total 39 h** · **price 2,340.00** · range from = to · maintenance hidden | Manual |
| 4 | 1 page · template · setup 0 · every feature off · buffer 0 · rate 0 | total 2 h · price 0.00, no crash | Manual |
| 5 | Switch USD → INR without editing | Rate 75 → 1,500; hours unchanged. A typed rate (e.g. 90) is kept | Manual |

## Extras
- Chart: `SplitBar` of hours by section (no Recharts needed).
- Scenario compare: no.
- Share / Print / Embed: yes.

## Content notes
- Examples: case 1 (US freelancer, 5-page small-business site), case 2 (Indian agency, 10-page premium site in two languages), case 3 (UK template shop).
- FAQ (7): the 5 keyword-map questions + "How many hours does a website take?" + "Should I charge per page or per project?". Answers explain the factors and point to the user's own rate. **No** "a website costs $X" figures.
- Tips: price the project, not the hours. Put the number of revision rounds in writing. Charge for content delays. Offer maintenance as a monthly plan (link to the retainer fee calculator).
- Internal links: from the keyword map.
