import { COMPANY, SUPPORT } from "./constants";

export const MARKETING_ASSETS = {
  heroBg: "/assets/marketing/hero-backdrop.jpg",
  productCups: "/assets/marketing/product-cups.jpg",
  carryBag: "/assets/marketing/eco-carry-bag.jpg",
  tableNapkins: "/assets/marketing/table-napkins.jpg",
  householdTissue: "/assets/marketing/household-tissue.jpg",
  cleaningSupplies: "/assets/marketing/cleaning-supplies.jpg",
  logo: "/assets/marketing/company-logo.svg",
  loginVideo: "/assets/marketing/login-background.mp4",
  loginPoster: "/assets/marketing/login-background.jpg",
  catalogueNapkins: "/assets/marketing/catalogue-napkins.jpg",
  catalogueFacialTissue: "/assets/marketing/catalogue-facial-tissue.jpg",
  catalogueFineCups: "/assets/marketing/catalogue-fine-cups.jpg",
  cataloguePaperCups: "/assets/marketing/catalogue-paper-cups.jpg",
  cataloguePaperBowls: "/assets/marketing/catalogue-paper-bowls.jpg",
  catalogueTrashBags: "/assets/marketing/catalogue-trash-bags.jpg",
  cataloguePaperBags: "/assets/marketing/catalogue-paper-bags.jpg",
  catalogueAluminiumContainers: "/assets/marketing/catalogue-aluminium-containers.jpg",
  beeGlb:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132918_e8364d8f-7df2-4788-a725-dec28ec19af8.glb",
  beeFallback: "/assets/marketing/bee-fallback.png",
  wingTexture:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132814_3a56ac14-47d8-4e49-a163-94234dea5639.png",
} as const;

export const SITE = {
  brand: "QUIKPACK",
  legalName: COMPANY.legalName,
  tagline: COMPANY.tagline,
  registrationNumber: COMPANY.registrationNumber,
  tin: COMPANY.tin,
  whatsapp: SUPPORT.whatsappNumber,
  whatsappUrl: SUPPORT.whatsappUrl,
  loginUrl: "/login",
} as const;

export const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/manufacturing", label: "Manufacturing" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/products", label: "Products & solutions" },
  { href: "/products/horeca", label: "HORECA range" },
  { href: "/products/household", label: "Household range" },
  { href: "/products/cleaning", label: "Cleaning supplies" },
  { href: "/products/eco", label: "Eco solutions" },
  { href: "/manufacturing", label: "Manufacturing" },
  { href: "/why-quikpack", label: "Why QUIKPACK" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/partners", label: "For partners" },
  { href: "/insights", label: "Insights" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

export type ProductCategory = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  body: string;
  items: Array<{ name: string; detail: string }>;
  visual: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    slug: "horeca",
    name: "HORECA Range",
    eyebrow: "For hotels, restaurants, cafés and caterers",
    title: "Built for busy counters, kitchens and takeaway service.",
    body: "Practical disposables that keep service moving — from table napkins and paper towels to takeaway containers and carry bags. Catalogue examples are drawn from the 17 October 2026 Everpack price list; availability and pricing are confirmed on enquiry.",
    visual: MARKETING_ASSETS.catalogueFineCups,
    items: [
      { name: "Evergreen napkins — 29×29 cm, 80 sheets", detail: "15 packs per box. Catalogue NP01." },
      { name: "Lunch napkins — 33×33 cm, 100 sheets", detail: "15 packs per box. Catalogue NP04/NP06." },
      { name: "Paper cups — 4 oz to 16 oz", detail: "Single-wall 50-cup rolls, 20 rolls per carton. Catalogue PC01–PC07." },
      { name: "Paper bowls — 12 oz to 24 oz", detail: "White and kraft bowls, 25 pieces per pack. Catalogue PB01–PB03." },
      { name: "Microwave containers", detail: "Black 1–3 compartment trays, 200 pieces per carton. Catalogue MCB01–MCB04." },
    ],
  },
  {
    slug: "household",
    name: "Household Range",
    eyebrow: "For everyday Ghanaian homes",
    title: "Everyday essentials, stocked without stress.",
    body: "Tissue, napkins, kitchen rolls and household consumables that make daily life cleaner and easier. Catalogue details below come from the 17 October 2026 Everpack price list and are confirmed on enquiry.",
    visual: MARKETING_ASSETS.catalogueFacialTissue,
    items: [
      { name: "Akwaba & Prime facial tissue", detail: "76-sheet and 150-sheet formats, 36 packs per carton. Catalogue FT01–FT06." },
      { name: "Evergreen & Fluffy toilet rolls", detail: "Family, 4-in-1 and 24/32-piece packs. Catalogue TRE/TRF ranges." },
      { name: "Kitchen towels", detail: "Evergreen, Rainbow and jumbo towel formats. Catalogue KT01–KT23." },
      { name: "Trash bags", detail: "Small to XXX-large, including easy-tie packs. Catalogue ST01–ST13." },
    ],
  },
  {
    slug: "cleaning",
    name: "Cleaning Supplies",
    eyebrow: "For hygiene, housekeeping and washrooms",
    title: "Clean spaces. Steady supply. Less procurement stress.",
    body: "Liquid soaps, bleaches, washing powders and hygiene consumables for businesses and homes that cannot afford to run short.",
    visual: MARKETING_ASSETS.cleaningSupplies,
    items: [
      { name: "Liquid soaps", detail: "Hand wash and general cleaning formats." },
      { name: "Bleaches & disinfectants", detail: "For washrooms, floors and high-use areas." },
      { name: "Washing powders", detail: "Laundry and linen care for homes and institutions." },
      { name: "Hygiene consumables", detail: "Daily-use supplies for clean, well-run spaces." },
    ],
  },
  {
    slug: "eco",
    name: "Eco / Sustainability Solutions",
    eyebrow: "Practical choices for lower waste",
    title: "Better material choices where it matters.",
    body: "We focus on responsible sourcing, practical packaging choices and reliable supply so customers can reduce waste without disrupting service. Catalogue examples are drawn from the 17 October 2026 Everpack price list.",
    visual: MARKETING_ASSETS.cataloguePaperBags,
    items: [
      { name: "Kraft square-bottom paper bags", detail: "20×28 cm to 35×37 cm, 200–1,000 pieces per bag. Catalogue PCB range." },
      { name: "Paper cups and bowls", detail: "Paper formats alongside plastic options where paper fits the service." },
      { name: "Responsible sourcing", detail: "Supplier and material choices reviewed with care." },
      { name: "Right-sized packing", detail: "Reduce unnecessary material in transit and storage." },
    ],
  },
];

export type MarketingSection = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string[];
  layout?: "split" | "list" | "grid";
  theme?: "light" | "dark";
  reverse?: boolean;
  visual?: string;
  items?: Array<{ title: string; detail: string }>;
};

export type MarketingPageContent = {
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  sections: MarketingSection[];
  ctaTitle: string;
  ctaBody: string;
};

export const MARKETING_PAGES: Record<string, MarketingPageContent> = {
  about: {
    title: "About QUIKPACK",
    description:
      "QUIKPACK supplies disposable, cleaning and hygiene products to HORECA, corporate and household customers across Ghana.",
    eyebrow: "About QUIKPACK",
    heroTitle: "We make everyday service easier.",
    heroBody:
      "QUIKPACK is a Ghana-focused disposables partner serving hotels, restaurants, cafés, retailers, institutions and homes with practical products that keep people serving, packing and cleaning.",
    sections: [
      {
        id: "trading",
        eyebrow: "Trading strength",
        title: "One dependable source for the products used every day.",
        body: [
          "Our trading business brings paper towels, napkins, cups, containers, carry bags and cleaning supplies together in one supply relationship.",
          "That means fewer fragmented purchases, clearer planning and a partner who understands the rhythm of busy Ghanaian businesses.",
        ],
        layout: "grid",
        items: [
          { title: "Breadth", detail: "HORECA, household and cleaning ranges under one roof." },
          { title: "Availability", detail: "Practical stock planning for repeat use." },
          { title: "Local understanding", detail: "Products chosen for the way Ghana businesses operate." },
        ],
      },
      {
        id: "manufacturing",
        eyebrow: "The next chapter",
        title: "From trading strength to local production.",
        body: [
          "QUIKPACK is setting up manufacturing for table napkins and other tissue materials. This gives customers a more consistent, locally grounded source for products they use in volume.",
        ],
        layout: "split",
        reverse: true,
        visual: MARKETING_ASSETS.carryBag,
      },
      {
        id: "approach",
        eyebrow: "Our approach",
        title: "Practical products. Reliable supply. Clear support.",
        body: [
          "We focus on the unglamorous things that make a real difference: consistent quality, useful pack sizes, honest guidance and dependable follow-up.",
        ],
        layout: "list",
        items: [
          { title: " Listen first", detail: "We start with how you serve, stock and clean." },
          { title: " Supply what fits", detail: "Ranges are selected around real operating needs." },
          { title: " Stay close", detail: "Support continues after the first delivery." },
        ],
      },
    ],
    ctaTitle: "Need a supply partner that understands your operation?",
    ctaBody: "Tell us what you use, where you use it and how much you move each month.",
  },
  manufacturing: {
    title: "Manufacturing Capabilities",
    description:
      "QUIKPACK is setting up local manufacturing for table napkins and tissue materials with quality, consistency and dependable supply at the centre.",
    eyebrow: "Manufacturing (NEW)",
    heroTitle: "Made closer. Supplied smarter.",
    heroBody:
      "Our new table napkin and tissue production capability is being built to give customers consistent quality, dependable availability and a stronger local supply chain.",
    sections: [
      {
        id: "focus",
        eyebrow: "Production focus",
        title: "Starting with table napkins and tissue materials.",
        body: [
          "The first focus is high-use tissue products: table napkins and related materials that restaurants, hotels, households and distributors reorder again and again.",
        ],
        layout: "grid",
        items: [
          { title: "Table napkins", detail: "Service-ready formats for HORECA and household use." },
          { title: "Tissue materials", detail: "Core inputs for dependable everyday products." },
          { title: "Quality control", detail: "Consistency built into every production run." },
        ],
      },
      {
        id: "benefit",
        eyebrow: "Why it matters",
        title: "Local capability changes the supply equation.",
        body: [
          "Manufacturing closer to the market means better planning, shorter replenishment loops and the ability to respond faster to customer requirements.",
        ],
        layout: "split",
        visual: MARKETING_ASSETS.householdTissue,
      },
      {
        id: "partner",
        eyebrow: "Partner with us",
        title: "Grow with a supplier building for the long term.",
        body: [
          "Distributors, hotels, restaurants and retail partners can work with QUIKPACK on categories with predictable demand and dependable supply.",
        ],
        layout: "list",
        items: [
          { title: "Volume planning", detail: "Share your monthly requirements with us." },
          { title: "Format selection", detail: "Choose packs that fit your customers." },
          { title: "Long-term supply", detail: "Build a dependable replenishment rhythm." },
        ],
      },
    ],
    ctaTitle: "Interested in our napkin and tissue range?",
    ctaBody: "Send your estimated volume and preferred formats. We will get back to you on WhatsApp.",
  },
  "why-quikpack": {
    title: "Why QUIKPACK",
    description:
      "Reasons HORECA, corporate and household customers choose QUIKPACK for disposables and cleaning supplies in Ghana.",
    eyebrow: "Why QUIKPACK",
    heroTitle: "A supplier built around real operating needs.",
    heroBody:
      "Customers choose QUIKPACK because we combine useful range, dependable supply and an understanding of how Ghanaian businesses actually serve and clean.",
    sections: [
      {
        id: "reasons",
        eyebrow: "The difference",
        title: "Five reasons customers stay with us.",
        body: [
          "We are not trying to be everything to everyone. We focus on the products daily operations cannot run without.",
        ],
        layout: "list",
        items: [
          { title: "Range depth", detail: "Serving, packing and cleaning products in one place." },
          { title: "Reliability", detail: "Repeat-use products planned around real demand." },
          { title: "Local context", detail: "Built for Ghanaian HORECA, retail and household use." },
          { title: "Manufacturing direction", detail: "Local napkin and tissue production capability." },
          { title: "Human support", detail: "Direct, practical help through WhatsApp and enquiry." },
        ],
      },
      {
        id: "care",
        eyebrow: "How we work",
        title: "Supply is a relationship, not a one-off delivery.",
        body: [
          "We pay attention to pack sizes, reorder timing and product fit because those details decide whether operations run smoothly.",
        ],
        layout: "split",
        reverse: true,
        visual: MARKETING_ASSETS.productCups,
      },
    ],
    ctaTitle: "Compare your current supply with QUIKPACK.",
    ctaBody: "Send your top product categories and we will respond with a practical supply conversation.",
  },
  sustainability: {
    title: "Sustainability",
    description:
      "QUIKPACK focuses on responsible sourcing, practical packaging choices and lower-waste supply options.",
    eyebrow: "Sustainability",
    heroTitle: "Practical choices for less waste.",
    heroBody:
      "Sustainability in disposables is about better decisions at the product, pack and replenishment level — not slogans. We focus on choices that can hold up in daily operations.",
    sections: [
      {
        id: "materials",
        eyebrow: "Materials",
        title: "Choose the right material for the real job.",
        body: [
          "Different service environments need different solutions. We help customers think through material, format and volume rather than buying on habit alone.",
        ],
        layout: "grid",
        items: [
          { title: "Responsible", detail: "Supplier and material choices reviewed with care." },
          { title: "Recoverable", detail: "Recyclable options where product and market allow." },
          { title: "Right-sized", detail: "Less unnecessary packaging in transit and storage." },
        ],
      },
      {
        id: "supply",
        eyebrow: "Lower-waste supply",
        title: "Better planning can reduce avoidable waste.",
        body: [
          "Accurate reorder planning, sensible pack sizes and local availability all help reduce overstock, emergency buying and product loss.",
        ],
        layout: "split",
        visual: MARKETING_ASSETS.cleaningSupplies,
      },
    ],
    ctaTitle: "Want to review your disposable choices?",
    ctaBody: "Tell us your use case and we will suggest practical options. Final certification details will be published once confirmed.",
  },
  partners: {
    title: "For Partners & Distributors",
    description:
      "Partner with QUIKPACK for dependable disposables, cleaning supplies and emerging local tissue manufacturing capability.",
    eyebrow: "For partners",
    heroTitle: "Stock products that move again and again.",
    heroBody:
      "Distributors, retailers and institutional buyers can work with QUIKPACK on everyday categories with predictable demand and practical supply support.",
    sections: [
      {
        id: "opportunity",
        eyebrow: "Opportunity",
        title: "Everyday categories, dependable replenishment.",
        body: [
          "Tissue, napkins, cups, containers, bags and cleaning supplies are repeat-use products. That makes them the kind of range partners can plan around.",
        ],
        layout: "grid",
        items: [
          { title: "Distributors", detail: "Build a stable everyday consumables range." },
          { title: "Retailers", detail: "Stock products households already need." },
          { title: "Institutions", detail: "Plan bulk supply for schools, offices and facilities." },
        ],
      },
      {
        id: "support",
        eyebrow: "Partner support",
        title: "A straightforward supply conversation.",
        body: [
          "Share your market, volume expectations and preferred categories. We will work backward from what your customers actually buy.",
        ],
        layout: "list",
        items: [
          { title: "Category fit", detail: "Start with the products your customers request most." },
          { title: "Pack planning", detail: "Choose formats that suit your channel." },
          { title: "Reorder rhythm", detail: "Set a supply cadence that protects availability." },
        ],
      },
    ],
    ctaTitle: "Become a QUIKPACK partner.",
    ctaBody: "Tell us your location, channel and estimated monthly volume.",
  },
  insights: {
    title: "Insights",
    description: "Practical notes on disposables, HORECA supply, hygiene and tissue products.",
    eyebrow: "Insights",
    heroTitle: "Notes from the world of everyday supply.",
    heroBody:
      "Short, practical writing for people who run kitchens, stock shelves, manage facilities and buy products that keep operations moving.",
    sections: [
      {
        id: "articles",
        eyebrow: "Topics we will cover",
        title: "Useful, specific and grounded in daily operations.",
        body: [
          "This section will grow with practical guides from QUIKPACK trading and manufacturing experience.",
        ],
        layout: "list",
        items: [
          { title: "Choosing napkins for HORECA", detail: "Format, absorbency, presentation and cost-per-service." },
          { title: "Takeaway packaging basics", detail: "Matching containers and bags to real menu formats." },
          { title: "Cleaning supply planning", detail: "Avoiding stockouts in high-use washrooms and kitchens." },
          { title: "Tissue manufacturing in Ghana", detail: "What local production changes for buyers." },
        ],
      },
    ],
    ctaTitle: "Have a supply question we should write about?",
    ctaBody: "Send it to us. Real customer questions shape the best insights.",
  },
  careers: {
    title: "Careers",
    description: "Build with QUIKPACK as we grow our disposables trading and tissue manufacturing capability.",
    eyebrow: "Careers",
    heroTitle: "Work on products people use every day.",
    heroBody:
      "QUIKPACK is growing from a dependable trading business into local manufacturing. We are building a team that cares about quality, supply and practical service.",
    sections: [
      {
        id: "culture",
        eyebrow: "How we work",
        title: "Practical people, real responsibility, visible results.",
        body: [
          "Our work is grounded in daily operations: products, stock, customers and continuous improvement. If you like seeing the result of your work, this is the kind of place where that happens quickly.",
        ],
        layout: "grid",
        items: [
          { title: "Operations", detail: "Stock, supply and customer coordination." },
          { title: "Manufacturing", detail: "Production, quality and process discipline." },
          { title: "Commercial", detail: "Partnerships, distributors and customer growth." },
        ],
      },
    ],
    ctaTitle: "Interested in building with QUIKPACK?",
    ctaBody: "Send a short note about your experience and the kind of work you want to do.",
  },
  contact: {
    title: "Contact / Enquiry",
    description: "Contact QUIKPACK for HORECA, household, cleaning and tissue product enquiries in Ghana.",
    eyebrow: "Contact / enquiry",
    heroTitle: "Tell us what you need.",
    heroBody:
      "Whether you run a restaurant, stock a shop, manage a facility or need dependable household supplies, send the details and we will respond on WhatsApp.",
    sections: [],
    ctaTitle: "Prefer to chat now?",
    ctaBody: "Open WhatsApp and speak directly with the QUIKPACK team.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How S M QUIKPACK GLOBAL LIMITED COMPANY handles enquiry and QUIKPACK Tally workspace data in Ghana.",
    eyebrow: "Legal · Privacy",
    heroTitle: "Your information, handled carefully.",
    heroBody:
      "This policy explains what we collect, why we collect it and the choices you have. Last updated 26 November 2026.",
    sections: [
      {
        id: "controller",
        eyebrow: "Who we are",
        title: "QUIKPACK is the data controller.",
        body: [
          "S M QUIKPACK GLOBAL LIMITED COMPANY operates this website and the QUIKPACK Tally workspace. Contact us on WhatsApp at +233592810728 for any privacy question.",
        ],
        layout: "list",
        items: [
          { title: "Legal name", detail: "S M QUIKPACK GLOBAL LIMITED COMPANY" },
          { title: "Registration", detail: "CS220561026" },
          { title: "TIN", detail: "C0068105959" },
          { title: "Country", detail: "Ghana" },
        ],
      },
      {
        id: "collected",
        eyebrow: "What we collect",
        title: "Only what the service needs.",
        body: [
          "We collect information you give us directly and information generated by your use of the workspace.",
        ],
        layout: "list",
        items: [
          {
            title: "Enquiries",
            detail: "Name, business, phone/WhatsApp, email, product category, estimated volume and your message.",
          },
          {
            title: "Workspace accounts",
            detail: "Email, display name, role, permissions, membership status and sign-in activity managed by Firebase Authentication.",
          },
          {
            title: "Business records",
            detail: "Parties, items, stock movements, invoices, vouchers, settings and reports that you enter into QUIKPACK Tally.",
          },
          {
            title: "Service data",
            detail: "Hosting and diagnostic data needed to keep the site and APIs secure and working.",
          },
        ],
      },
      {
        id: "purposes",
        eyebrow: "Why we use it",
        title: "To supply, support and secure the service.",
        body: [
          "Enquiry details are used only to respond to your product enquiry through WhatsApp. Workspace data is used to provide accounting, inventory and invoicing features, enforce access controls and keep records accurate.",
          "We do not sell personal information and we do not run advertising tracking on this website.",
        ],
        layout: "list",
      },
      {
        id: "processors",
        eyebrow: "Sharing",
        title: "Trusted service providers only.",
        body: [
          "We share only what is needed with the providers that run the service.",
        ],
        layout: "list",
        items: [
          { title: "Firebase / Google", detail: "Authentication, database and file storage for the workspace." },
          { title: "Vercel", detail: "Website hosting, previews and deployment protection." },
          { title: "Resend", detail: "Administrator invitation emails." },
          { title: "WhatsApp / Meta", detail: "Delivery of your enquiry to our team when you choose to open WhatsApp." },
        ],
      },
      {
        id: "retention",
        eyebrow: "Retention and choices",
        title: "Kept only as long as needed.",
        body: [
          "Enquiry messages remain with the QUIKPACK team for follow-up. Workspace records remain while your account is active and for as long as needed for accounting, tax and audit obligations under Ghanaian law.",
          "You may ask for access, correction or deletion using the data deletion page or by contacting us on WhatsApp. We may retain records that we are legally required to keep.",
        ],
        layout: "list",
      },
      {
        id: "changes",
        eyebrow: "Changes",
        title: "We will update this page when the service changes.",
        body: [
          "Material changes will be posted here with a new last-updated date. Continued use of the website or workspace after a change means you accept the updated policy.",
        ],
        layout: "list",
      },
    ],
    ctaTitle: "Need a privacy clarification?",
    ctaBody: "Message the QUIKPACK team on WhatsApp and we will help.",
  },
  terms: {
    title: "Terms of Use",
    description:
      "Terms for using the QUIKPACK website and the QUIKPACK Tally workspace.",
    eyebrow: "Legal · Terms",
    heroTitle: "Clear terms for using QUIKPACK.",
    heroBody:
      "These terms explain the ground rules for the website and the Tally workspace. Last updated 26 November 2026.",
    sections: [
      {
        id: "information",
        eyebrow: "Website information",
        title: "Product details are not a price offer.",
        body: [
          "Catalogue examples and product details are taken from the 17 October 2026 Everpack price list. Prices and availability are confirmed on enquiry and are not published on this website.",
          "We aim to keep information accurate, but product images, pack sizes and descriptions may change after catalogue or supplier updates.",
        ],
        layout: "list",
      },
      {
        id: "accounts",
        eyebrow: "Accounts",
        title: "Access is approved by an administrator.",
        body: [
          "There is no public self-registration for QUIKPACK Tally. Accounts are created and approved by an administrator, and access depends on the role and permissions assigned to you.",
          "You are responsible for keeping your credentials safe and for all activity that happens under your account.",
        ],
        layout: "list",
      },
      {
        id: "ip",
        eyebrow: "Intellectual property",
        title: "Brand and content belong to their owners.",
        body: [
          "The QUIKPACK name, logo, site content and workspace branding belong to S M QUIKPACK GLOBAL LIMITED COMPANY or its licensors. Catalogue material remains the property of its respective owner.",
          "You may not copy, redistribute or reuse site content or product imagery without written permission.",
        ],
        layout: "list",
      },
      {
        id: "use",
        eyebrow: "Acceptable use",
        title: "Use the service responsibly.",
        body: [
          "Do not misuse the website or workspace, attempt unauthorised access, upload unlawful content, interfere with other users or use the service to break applicable law.",
          "We may suspend or remove access where misuse is suspected.",
        ],
        layout: "list",
      },
      {
        id: "law",
        eyebrow: "Liability and law",
        title: "Provided for business use, with limits.",
        body: [
          "The website and workspace are provided on an as-is basis. To the extent permitted by law, QUIKPACK is not liable for indirect or consequential losses arising from use of the service.",
          "These terms are governed by the laws of Ghana.",
        ],
        layout: "list",
      },
    ],
    ctaTitle: "Questions about the terms?",
    ctaBody: "Contact the QUIKPACK team before continuing to use the service.",
  },
  "data-deletion": {
    title: "Data Deletion",
    description:
      "How to request deletion of personal information held by QUIKPACK Tally.",
    eyebrow: "Legal · Data deletion",
    heroTitle: "Request data deletion.",
    heroBody:
      "You can ask us to delete personal information we hold about you. Last updated 26 November 2026.",
    sections: [
      {
        id: "request",
        eyebrow: "How to request",
        title: "Send a clear deletion request.",
        body: [
          "Signed-in users can submit a deletion request from the workspace settings area. You can also send the same request on WhatsApp to +233592810728.",
        ],
        layout: "list",
        items: [
          { title: "1", detail: "Tell us the email address linked to your account." },
          { title: "2", detail: "Explain what you want deleted and why." },
          { title: "3", detail: "We may verify your identity before acting." },
        ],
      },
      {
        id: "delete",
        eyebrow: "What we can delete",
        title: "Account and contact data.",
        body: [
          "We can delete or anonymise workspace profile details, access records and enquiry messages that are not needed for an active business relationship.",
        ],
        layout: "list",
      },
      {
        id: "retain",
        eyebrow: "What we must retain",
        title: "Some records must remain.",
        body: [
          "Invoices, vouchers, tax records and audit trails may need to be retained to meet Ghanaian accounting and tax requirements. Where possible we will remove personal identifiers while keeping the financial record intact.",
        ],
        layout: "list",
      },
      {
        id: "timeline",
        eyebrow: "Timeline",
        title: "We respond after verification.",
        body: [
          "We aim to respond to deletion requests within 30 days. If a request is complex or legally restricted, we will explain why and tell you what can be done.",
        ],
        layout: "list",
      },
    ],
    ctaTitle: "Ready to send a request?",
    ctaBody: "Open WhatsApp or contact your workspace administrator.",
  },
};
