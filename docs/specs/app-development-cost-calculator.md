# Tool spec: App Development Cost Calculator

> **Draft — waiting for Puru's review.** Same pricing model as the Website Design Cost Calculator: hours × your rate, with example hours you can edit, and no market prices.

| Field | Value |
|---|---|
| Slug | `app-development-cost-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths, the user's own rate |
| Main keyword | `app development cost calculator` |
| Long-tail keywords | `app cost calculator`, `mobile app cost estimate`, `how much to charge for an app` |
| Affiliate | none |
| Related tools | from the keyword map: `website-design-cost-calculator`, `hourly-rate-calculator`, `freelance-quote-generator` (only live ones are shown) |

## What it calculates
It estimates the price of an app project from the hours it needs and **your** hourly rate. You tick the platforms, set the number of screens and tick features. Each item adds example hours you can edit. Each extra platform adds a share of the app-side work. A buffer covers changes and project management, and there's an optional monthly maintenance fee.

It never states what "apps cost on average". Under the feature list: "Example values — change them to match how you work."

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | |
| Your hourly rate | currency | 75 | 0 – 1,000,000 | Link to the freelance hourly rate calculator (when live) |
| Platforms | checkboxes | iOS ✔ · Android ✔ · Web app ✘ | at least one | Error if none: "Choose at least one platform" |
| Extra work for each added platform | % | 60 | 0 – 100 | Shown only with 2+ platforms. Help: "Share of the app-side hours needed again for each platform after the first. Example value." |
| Number of screens | number | 8 | 1 – 200, whole | |
| Design and build hours per screen | number | 6 | 0.5 – 200 | Example value |
| Setup, discovery and launch | hours | 20 | 0 – 1,000 | Shared. Includes store submission |
| **App-side features** (repeat per platform) | | | | |
| User accounts and login | checkbox + hours | on · 16 | 0 – 1,000 | |
| Payments / in-app purchases | checkbox + hours | off · 24 | 0 – 1,000 | |
| Push notifications | checkbox + hours | off · 8 | 0 – 1,000 | |
| Chat / messaging | checkbox + hours | off · 30 | 0 – 1,000 | |
| Maps, camera or other device features | checkbox + hours | off · 12 | 0 – 1,000 | |
| Works offline | checkbox + hours | off · 20 | 0 – 1,000 | |
| **Shared features** (built once) | | | | |
| Backend, API and database | checkbox + hours | on · 40 | 0 – 1,000 | |
| Admin dashboard | checkbox + hours | off · 40 | 0 – 1,000 | |
| Testing and QA | checkbox + hours | on · 20 | 0 – 1,000 | |
| Buffer for changes and project management | % slider | 15 | 0 – 50 | |
| Maintenance hours per month | number | 6 | 0 – 500 | `optional`, 0 hides the maintenance rows |

URL keys: `rate`, `ios`, `android`, `web`, `extra`, `screens`, `hps`, `setup`, feature flags + hours (`login`/`loginH`, `pay`/`payH`, `push`/`pushH`, `chat`/`chatH`, `device`/`deviceH`, `offline`/`offlineH`, `api`/`apiH`, `admin`/`adminH`, `qa`/`qaH`), `buffer`, `maint`.

### Currency defaults
Only the hourly rate changes with currency (same examples as the website tool). Hours are the same everywhere.

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
| Quote range | "Without the buffer: {base price}" (hidden when buffer = 0) |
| Total hours | Breakdown |
| Hours and price per section | Table: Setup · Screens · each app-side feature · Extra platforms · each shared feature · Buffer, plus a `SplitBar` of hours |
| Maintenance fee | "{fee} per month · {fee × 12} per year" (hidden when 0) |
| Next step | "Turn this into a quote" → quote generator (only when live) |
| **Lead box** | Same as the website tool: "Want this app built?" · "Send us your estimate and we'll reply with a quote." · **Get a quote** mailto `info@centhaven.com`, fixed subject "App quote request", no user numbers; `lead_click` event `{ tool: 'app-development-cost-calculator' }`; hidden in embeds and print. Build: move `LeadBox` to `components/LeadBox.tsx` with `heading`, `subject`, `tool` props and use it in both tools |

## Formula
```
screenHours    = screens × hoursPerScreen
appSideHours   = screenHours + sum(hours of app-side features that are on)
sharedHours    = setup + sum(hours of shared features that are on)
platforms      = number of platforms ticked (≥ 1)
extraPlatHours = appSideHours × extra% × (platforms − 1)
baseHours      = appSideHours + sharedHours + extraPlatHours
bufferHours    = baseHours × buffer%
totalHours     = baseHours + bufferHours
basePrice      = baseHours × rate        (low end)
price          = totalHours × rate       (main result)
maintenance    = maintHours × rate per month; × 12 per year
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD defaults: rate 75 · iOS + Android · extra 60% · 8 screens × 6 h · setup 20 · login 16 · API 40 · QA 20 · buffer 15% · maint 6 | screens 48 · app-side 64 · shared 80 · extra platform 38.4 · base 182.4 h · buffer 27.36 h · **total 209.76 h** · **price 15,732.00** · from 13,680.00 · maintenance 450.00 / month, 5,400.00 / year |
| 2 | INR · rate 1,500 · iOS only · 5 screens × 6 h · setup 20 · login off · payments 24 · API 40 · admin 40 · QA 20 · buffer 20% · maint 4 | app-side 54 · shared 120 · extra 0 · base 174 h · buffer 34.8 h · **total 208.8 h** · **price 3,13,200.00** · from 2,61,000.00 · maintenance 6,000.00 / month, 72,000.00 / year |
| 3 | GBP · rate 60 · iOS + Android + Web · extra 50% · 10 screens × 5 h · setup 20 · login 16 · push 8 · chat 30 · API 40 · QA off · buffer 0% · maint 0 | app-side 104 · shared 60 · extra platforms 104 (104 × 0.5 × 2) · **total 268 h** · **price 16,080.00** · range row hidden · maintenance hidden |
| 4 | No platform ticked | Error "Choose at least one platform" + "—", no crash |
| 5 | 1 screen × 0.5 h · setup 0 · every feature off · buffer 0 · rate 0 | total 0.5 h · price 0.00, no crash |
| 6 | Switch USD → INR without editing | rate 75 → 1,500; hours unchanged. A typed rate (e.g. 90) is kept |

## Edge cases
- Extra % 0 with 2+ platforms → no extra hours (valid). Unticked features keep their hours in the box (greyed) but count 0.
- Screens 0 or decimal → field error. Negative values → field error. Huge values → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (rate, screens, hours per screen, setup, each feature's hours, extra %) → "Enter a number" and "—".
- Clear maintenance (optional) → valid result, maintenance hidden.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Toggle every platform and feature checkbox and every currency → result updates.

## Extras
- Chart: `SplitBar` of hours by section. Scenario compare: no. Share / print / embed: yes (lead box hidden in embed/print).

## Content notes
- Examples: case 1 (US freelancer, two-platform booking app), case 2 (Indian studio, iOS shop app with admin), case 3 (UK agency, three platforms).
- FAQ (7): the 5 keyword-map questions + "How many hours does an app take?" + "Should I use one codebase for iOS and Android?". The "How much does it cost to build an app?" answer explains the factors and points to the user's own hours and rate. **No** "apps cost $X" or "an app takes N months" figures. The two-platform answer explains the extra-platform % is the user's own estimate.
- Tips: price the project, not the hours; agree what is in version 1; charge for store submission and updates; offer maintenance as a monthly plan (link to the retainer fee calculator).
