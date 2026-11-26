import type { Role } from "./permissions";

export interface DashboardTip {
  title: string;
  meaning: string;
  calculation: string;
  source: string;
  action: string;
  contact: string;
}

export const ROLE_SUMMARY: Record<Role, string> = {
  admin: "You can see the whole business, manage people and investigate any area.",
  accountant: "You handle accounting, tax, stock value and financial reports.",
  cashier: "You sell, create invoices and protect stock while the counter is open.",
  viewer: "You can read information and reports, but you cannot change records.",
  auditor: "You check evidence, exceptions and changes across the business.",
};

export const ROLE_TITLE: Record<Role, string> = {
  admin: "Business Command Centre",
  accountant: "CFO Intelligence Dashboard",
  cashier: "Counter Dashboard",
  viewer: "Read-only Business Overview",
  auditor: "Control & Evidence Dashboard",
};

export const TIPS: Record<string, DashboardTip> = {
  reorder: {
    title: "What is a reorder level?",
    meaning:
      "A reorder level is the minimum quantity you want to keep for an item. When stock reaches this number, it is time to check or order more.",
    calculation:
      "The stock quantity is compared with the reorder level on the stock record, or the item record if the stock record has no value.",
    source: "Stock and item master records.",
    action: "Open Inventory → Low stock, check the items, then arrange purchase or transfer.",
    contact: "Ask Accountant or Admin if the reorder level looks wrong.",
  },
  overdue: {
    title: "What is an overdue invoice?",
    meaning:
      "An invoice is overdue when it was sent to a customer, is still not paid, and its due date has passed.",
    calculation:
      "Only sent invoices with a due date before today are counted. Drafts, paid invoices and void invoices are excluded.",
    source: "Invoice records.",
    action: "Open Invoices, find the unpaid invoice and follow up with the customer.",
    contact: "Ask Accountant about payment terms or write-offs.",
  },
  salesToday: {
    title: "What is sales today?",
    meaning: "The total value of invoices created today, before subtracting costs.",
    calculation: "Invoice totals dated today are added. Void invoices are excluded.",
    source: "Invoice records.",
    action: "Open Invoices to review today’s invoices.",
    contact: "Ask Accountant if an invoice total looks wrong.",
  },
  invoiceValue: {
    title: "What is invoice value?",
    meaning: "The total amount billed to customers, not the amount already received.",
    calculation: "Invoice totals are added for all non-void invoices.",
    source: "Invoice records.",
    action: "Use Reports → VAT or AR / AP Aging for a fuller view.",
    contact: "Ask Accountant before changing an invoice.",
  },
  revenue: {
    title: "What is revenue?",
    meaning: "Income recorded from posted accounting vouchers.",
    calculation: "Income account balances are taken from posted, non-reversed vouchers.",
    source: "Vouchers and chart of accounts.",
    action: "Open Reports → Profit & Loss to see income by group.",
    contact: "Ask Accountant if income is posted to the wrong account.",
  },
  netProfit: {
    title: "What is net profit?",
    meaning: "Income minus expenses from posted accounting records.",
    calculation: "Total income minus total expense balances, excluding reversed and void records.",
    source: "Vouchers and chart of accounts.",
    action: "Open Reports → Profit & Loss for the full breakdown.",
    contact: "Ask Accountant if figures do not match expectations.",
  },
  cashMovement: {
    title: "What is cash movement?",
    meaning: "Money coming in and going out from receipts, payments, contra and expense vouchers.",
    calculation: "Receipts add to cash; payments, contra and expense entries reduce cash.",
    source: "Posted vouchers.",
    action: "Open Reports → Cashflow (lite) for the full list.",
    contact: "Ask Accountant to investigate unusual cash movements.",
  },
  receivables: {
    title: "What are receivables?",
    meaning: "Money customers still owe your business.",
    calculation: "Outstanding invoice totals are grouped by customer and aging bucket.",
    source: "Invoices, payments and parties.",
    action: "Open Reports → AR / AP Aging to see who owes what and for how long.",
    contact: "Ask Accountant about long-overdue customers.",
  },
  payables: {
    title: "What are payables?",
    meaning: "Money your business owes suppliers.",
    calculation: "Purchase and debit-note voucher totals are reduced by recorded payments.",
    source: "Supplier vouchers, payments and parties.",
    action: "Open Reports → AR / AP Aging to review supplier balances.",
    contact: "Ask Accountant before making supplier payment.",
  },
  vat: {
    title: "What is VAT / NHIL / GETFund?",
    meaning: "Tax collected on sales minus tax already paid on purchases.",
    calculation: "Output tax from invoices minus input tax from vouchers.",
    source: "Invoices and vouchers.",
    action: "Open Reports → VAT / NHIL / GETFund before filing.",
    contact: "Ask Accountant or tax adviser before submission.",
  },
  stockValue: {
    title: "What is stock value?",
    meaning: "The estimated worth of stock currently held.",
    calculation: "Quantity on hand multiplied by average cost from stock movements, using the valuation method in settings.",
    source: "Stock, stock movements and item records.",
    action: "Open Reports → Stock Movement for item-level value.",
    contact: "Ask Accountant if stock valuation method was changed.",
  },
  awaitingPayment: {
    title: "What does awaiting payment mean?",
    meaning: "Invoices that have been sent but are not fully paid.",
    calculation: "Sent invoices with an outstanding balance are counted. Void invoices are excluded.",
    source: "Invoice records.",
    action: "Open the invoice and confirm payment status with the customer.",
    contact: "Hand over to Accountant if payment is disputed.",
  },
  itemsSold: {
    title: "What are items sold today?",
    meaning: "Quantity of invoice lines dated today.",
    calculation: "Line quantities from today’s non-void invoices are added by description or item.",
    source: "Invoice lines.",
    action: "Use this to prepare items before the counter gets busy.",
    contact: "Ask Accountant if an invoice line was recorded incorrectly.",
  },
  auditEvents: {
    title: "What is an audit event?",
    meaning: "A recorded change such as create, update, delete or export.",
    calculation: "Audit log entries are grouped by the day they were recorded.",
    source: "Audit log.",
    action: "Open Audit to review the full activity list.",
    contact: "Ask Admin if an action was not made by you.",
  },
  exceptions: {
    title: "What is an exception?",
    meaning: "An activity that needs review because it changes or removes information.",
    calculation: "Delete, export, reversal and void actions are highlighted.",
    source: "Audit log, vouchers and invoices.",
    action: "Open the linked area and verify the supporting document.",
    contact: "Report unexplained activity to Admin.",
  },
  reversals: {
    title: "What is a reversal?",
    meaning: "A correcting entry that cancels an earlier posted voucher.",
    calculation: "Vouchers with reversal links or reversed status are counted.",
    source: "Voucher records.",
    action: "Open Vouchers and trace the original entry.",
    contact: "Ask Accountant why the original entry was reversed.",
  },
  access: {
    title: "Why does access matter?",
    meaning: "Each role has only the tools needed for its job.",
    calculation: "Access comes from your membership role and any permission overrides set by Admin.",
    source: "Membership record.",
    action: "Ask Admin if you need another feature enabled.",
    contact: "Admin approves all access changes.",
  },
  readOnly: {
    title: "What does read-only mean?",
    meaning: "You can view information and reports, but you cannot create, edit or delete records.",
    calculation: "Create and edit actions are hidden and blocked by the server.",
    source: "Membership permissions.",
    action: "If a correction is needed, contact Admin or Accountant.",
    contact: "Admin or Accountant can make approved corrections.",
  },
  evidence: {
    title: "What is evidence?",
    meaning: "Support that explains why a record exists, such as an attachment or reference.",
    calculation: "Records with a supporting attachment or reference are treated as evidenced.",
    source: "Vouchers, invoices and audit log.",
    action: "Open the record and check its reference or attachment.",
    contact: "Ask the user who created the record if evidence is missing.",
  },
  trend: {
    title: "Why is there no trend?",
    meaning: "A trend needs history from earlier days.",
    calculation: "Trends appear only when comparable prior-period data exists.",
    source: "Historical records.",
    action: "Keep recording transactions. Trends will appear once history exists.",
    contact: "Ask Admin about reporting periods if history seems missing.",
  },
  focus: {
    title: "What is the focus count?",
    meaning: "It is a simple count of live issues that need a decision today. It is not a prediction or an AI score.",
    calculation: "Low stock, overdue invoices, waiting payments, access reviews, reversals, voids and risky audit events are counted once each.",
    source: "Records already in your workspace.",
    action: "Open the item linked in Needs your attention, then follow the role playbook.",
    contact: "Ask Admin or Accountant if a signal looks incorrect.",
  },
  roleSnapshot: {
    title: "What is a role snapshot?",
    meaning: "It is a read-only summary of what another role would see. You are not logged in as that person.",
    calculation: "Each snapshot uses the same records as that role, but it never changes your access or identity.",
    source: "Existing workspace records.",
    action: "Open the linked area to review the underlying information.",
    contact: "Ask Admin if you need access to another area.",
  },
  currency: {
    title: "Why are amounts in GHS?",
    meaning: "Dashboard amounts are shown in the company base currency to keep totals comparable.",
    calculation: "Invoice and voucher base amounts in GHS are used.",
    source: "Company settings and transaction records.",
    action: "Use individual invoices for original currency amounts.",
    contact: "Ask Accountant if you need a currency-specific report.",
  },
  pendingUsers: {
    title: "Why are pending users important?",
    meaning: "Pending users cannot use the workspace until their membership is approved.",
    calculation: "Membership records with pending or suspended status are counted.",
    source: "User membership records.",
    action: "Open Users and approve, suspend or correct the account.",
    contact: "The account owner should confirm the request.",
  },
};

export const PLAYBOOKS: Record<Role, Array<{ title: string; detail: string; href?: string }>> = {
  admin: [
    { title: "Start with attention items", detail: "Fix stock, invoice and access problems before anything else." },
    { title: "Review role summaries", detail: "Check Accountant, Cashier, Viewer and Auditor snapshots for unusual activity." },
    { title: "Manage people", detail: "Create users, assign roles and review permissions in Users & access.", href: "/admin/users" },
    { title: "Investigate changes", detail: "Use Audit when deletes, exports or reversals appear.", href: "/audit" },
    { title: "Supervise month-end", detail: "Ask Accountant to complete VAT, AR/AP, stock and P&L checks.", href: "/reports" },
  ],
  accountant: [
    { title: "Check attention items", detail: "Start with overdue invoices, supplier dues and reversals." },
    { title: "Post transactions", detail: "Record receipts, payments, expenses and journals in Vouchers.", href: "/vouchers" },
    { title: "Review invoices", detail: "Confirm sent, paid and void invoices are correct.", href: "/invoices" },
    { title: "Check VAT", detail: "Run VAT / NHIL / GETFund before filing.", href: "/reports" },
    { title: "Close the month", detail: "Review P&L, balance sheet, AR/AP and stock value.", href: "/reports" },
  ],
  cashier: [
    { title: "Check low stock first", detail: "Products at reorder level may run out today.", href: "/inventory" },
    { title: "Create the invoice", detail: "Choose the customer, add items, check tax and totals.", href: "/invoices" },
    { title: "Confirm payment status", detail: "Mark the invoice paid only when payment is actually received.", href: "/invoices" },
    { title: "Download or send invoice", detail: "Give the customer the PDF when required.", href: "/invoices" },
    { title: "Hand over to Accountant", detail: "Report unpaid invoices, returns or stock problems at close." },
  ],
  viewer: [
    { title: "Read the role strip", detail: "Confirm what you can and cannot do before starting." },
    { title: "Check stock", detail: "Open Inventory to view stock and reorder levels.", href: "/inventory" },
    { title: "Open a report", detail: "Use Reports for business information without changing records.", href: "/reports" },
    { title: "Request corrections", detail: "Contact Admin or Accountant if something looks wrong." },
  ],
  auditor: [
    { title: "Review attention items", detail: "Start with deletes, exports, reversals and voids." },
    { title: "Open the audit log", detail: "Read the full activity list in chronological order.", href: "/audit" },
    { title: "Trace a voucher", detail: "Check reversal links and narration for unusual entries.", href: "/vouchers" },
    { title: "Verify stock movement", detail: "Confirm receipts and issues have references.", href: "/inventory" },
    { title: "Report findings", detail: "Send unexplained activity to Admin with date and document reference." },
  ],
};
