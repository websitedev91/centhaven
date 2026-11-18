# sources.md — Official sources for every rate

Every file in `/rates/` must be listed here. Claude Code updates this file whenever a rate changes, and Puru approves.

| Rates file | What it covers | Official source URL | Effective from | Verified on | Check schedule |
|---|---|---|---|---|---|
| _(none yet)_ | | | | | |

## Update calendar
| What | When to check |
|---|---|
| Pure-maths tools (every number comes from the user) | No rates: no update needed |

Scope rule (Puru, 2026-11-18): CentHaven builds only pure-maths tools where every number comes from the user. No tool may depend on company fees, tax rates, government limits or legal rules, so this file is expected to stay empty. The /rates pipeline (schema, loader, build check) is kept but unused.

## How to update
1. Ask Claude Code: "Check every URL in sources.md and show what changed vs our /rates files. Quote the exact line for each change."
2. Open each URL yourself and confirm the numbers.
3. Approve. Claude Code updates the rates file, `verifiedOn`, tests and `lastUpdated` in the registry.
4. Run `npm run check`, then deploy.
