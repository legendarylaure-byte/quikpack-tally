# Client demo script — live walkthrough

Audience: existing owner/client. Format: live screen share.
Goal: show one complete business cycle, then collect what we need to go live.

You are the **guide**, not the accountant. Show where things are recorded; send accounting and tax questions to the client's accountant.

## Before you start (15 minutes)

- [ ] Get the **current preview URL** from the handover chat — it changes on every branch push.
- [ ] Open it, sign in with a demo account, and click through steps 1–9 once yourself.
- [ ] Keep a few screenshots and one saved invoice PDF ready in case the preview or network fails.
- [ ] Use the demo environment only. Demo users are dev-only; never present production.
- [ ] Open the handout so you can fill the parking lot live.
- [ ] Optional: open `docs/client-demo-slides.html` in a second tab for the opener and close.

## Opening — say this

> "I'm going to walk you through one full day in the system — goods in, sale, payment, and the reports at the end. I'm not going to teach you accounting; I'll show you where things get recorded. Anything about tax rules we'll park for your accountant."

## The walkthrough

Use the seeded demo data. Do not type live numbers.

| Step | Show this | Say this | Watch out |
|---|---|---|---|
| 1. Sign in | `/login`, MFA if enabled | "Only accounts your admin creates. No public signup, so nobody outside your company gets in." | Don't share the demo password on screen. |
| 2. Dashboard | `/dashboard` | "This is your morning screen: what sold, what cash you have, what stock is running low." | Sample numbers are from the demo seed. Say so. |
| 3. Your lists | `/masters` → Accounts, Parties, Items | "Accounts, customers and suppliers, and your product list. 372 products are loaded as samples. You can import a CSV instead of typing them." | Item names/prices came from a messy PDF; don't claim they're final. |
| 4. Stock in | `/inventory` — a stock row and a movement | "When goods arrive, they go in here. The system flags what to reorder." | Stock valuation method is FIFO or weighted average. |
| 5. Money out | `/vouchers` — a saved purchase or expense voucher | "Every purchase and payment is recorded once here. Mistakes are reversed with a new entry — nothing is silently edited." | Posted vouchers are immutable by design. |
| 6. The sale | `/invoices` — pick a party, add items, GHS/USD/NPR, download the PDF | "Your branded invoice. VAT, NHIL and GETFund appear as separate lines. This is what goes to your customer." | Say tax treatment needs accountant sign-off. Not final. |
| 7. Money in | Receipt voucher / AR in reports | "When they pay, it's recorded against their balance. Receivables update by themselves." | Keep it to the concept; no need to explain double entry. |
| 8. Reports | `/reports` — trial balance, P&L, balance sheet, VAT, AR/AP, day book | "All from the same records. No retyping. This is the pack you hand your accountant." | Don't interpret the numbers. Just show where they live. |
| 9. Control | `/admin` roles, `/audit`, Export | "Five roles limit who sees what. Every change is logged. You can export everything at any time." | Roles: admin, accountant, cashier, viewer, auditor. |

## If they ask something you don't know

- "Good question — I won't guess on a tax or accounting rule. Let me note it and get it confirmed before we rely on it."
- "That's a later-phase feature. Let me write it down so it's not lost."
- "That number is sample data from the demo seed. We'll check it against your real figures."

Write every one in the parking lot on the handout. Do not improvise an answer.

## Close — say this

> "That's the full loop. Before we go live we need your real lists, opening balances, and one real transaction to check the reports. I've written those down on the handout. If you confirm today's demo and send those inputs, we can schedule the live-data pass."

Then work through the go-live checklist on the handout together.

## If technology fails

- **Preview blank / slow** — refresh once, then switch to the saved screenshots.
- **Login fails** — recheck the demo credentials in the handover chat. Do not try production.
- **Data looks wrong** — "That's sample seed data, not your real numbers. We'll load yours during onboarding."

## After the call

1. Send the handout and slide deck to the client.
2. Route every tax/accounting parking-lot item to the accountant or GRA.
3. Record the client's written confirmation and change requests in `docs/HANDOVER.md`.
