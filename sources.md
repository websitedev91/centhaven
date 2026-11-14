# sources.md — Official sources for every rate

Every file in `/rates/` must be listed here. Claude Code updates this file whenever a rate changes, and Puru approves.

| Rates file | What it covers | Official source URL | Effective from | Verified on | Check schedule |
|---|---|---|---|---|---|
| _(none yet)_ | | | | | |

## Update calendar
| What | When to check |
|---|---|
| Payment / platform fees (PayPal, Wise, Payoneer, Stripe, Upwork, Fiverr) | Every 3 months |
| India income tax / GST | Feb–Mar (after the Union Budget) |
| US tax limits (SE tax, 401k, SEP IRA) | November |
| UK tax bands / NI | March–April |
| Canada / Australia | Before their new tax year |
| Pure-maths tools (EMI, SIP, compound interest, hourly rate) | No rates: no update needed |

## How to update
1. Ask Claude Code: "Check every URL in sources.md and show what changed vs our /rates files. Quote the exact line for each change."
2. Open each URL yourself and confirm the numbers.
3. Approve. Claude Code updates the rates file, `verifiedOn`, tests and `lastUpdated` in the registry.
4. Run `npm run check`, then deploy.
