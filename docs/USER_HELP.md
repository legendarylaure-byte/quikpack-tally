# User help

Skeleton for the first release. Expand with screenshots after client sign-off.

## Sign in

Use the email address and password created by your administrator. If MFA is enabled, open your authenticator app and enter the current six-digit code. Sign out with **Sign out** in the navigation.

## Masters

- **Accounts**: chart of accounts and opening balances.
- **Parties**: customers and suppliers. CSV headers: `name,type,contactPerson,phone,email,tin,currency`.
- **Items**: SKUs, prices, units and tax category. CSV headers: `sku,name,unit,salePrice,purchasePrice,reorderLevel`.
- **Catalogue**: Everpack source prices; importing does not reprice existing items.

CSV imports update matching SKUs or names instead of creating duplicates. Only admins and accountants can import.

## Daily workflow

1. Record purchases and expenses as vouchers.
2. Record receipts and payments against parties.
3. Move stock in or out from Inventory; low-stock alerts appear on the dashboard and stock list.
4. Create invoices with GHS, USD or NPR and the correct tax category.
5. Download the invoice PDF and share it with the customer.

Posted records are not edited silently; use reversal entries.

## Reports and export

Reports cover dashboard, trial balance, P&L, balance sheet, VAT/NHIL/GETFund, stock, AR/AP aging, ledger and day book. Use **Export** for JSON or CSV backup. The audit log records create, update, delete and reversal actions.

## Roles

- Admin: users, settings and all modules.
- Accountant: masters, vouchers, invoices and reports.
- Cashier: invoicing, payments and stock.
- Viewer: read-only dashboards, masters and reports.
- Auditor: read-only dashboards, masters, inventory, reports and audit log.

## Support

Contact QUIKPACK on WhatsApp at `+233592810728`.
