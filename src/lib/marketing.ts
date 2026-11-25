import { COMPANY, SUPPORT } from "./constants";

export const MARKETING_ASSETS = {
  heroBg:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261016_130303_301c35dd-e2d1-4b40-a396-2b53f884d787.png",
  cosmos:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132919_c994332b-7f9d-43b5-933d-1e94faa91dd4.png",
  hangingCosmos:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132924_764b726d-d37a-44cc-8eba-662d823d9a4c.png",
  darkBg:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132814_c3d2b090-c27d-49d1-8107-66d0cfa216c2.png",
  iris:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132926_a7892ae5-8052-4e4b-96a8-ccbdcaaaa5ad.png",
  passion:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261017_132921_d71538ea-5066-4372-963a-2f2d6468374f.png",
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

export const ACCESS_REQUEST_URL = `https://wa.me/${SITE.whatsapp.replace("+", "")}?text=${encodeURIComponent(
  "Hello QUIKPACK, I would like to request access to QUIKPACK Tally. Please share the next steps.",
)}`;

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
    body: "Practical disposables that keep service moving — from table napkins and paper towels to takeaway containers and carry bags.",
    visual: MARKETING_ASSETS.heroBg,
    items: [
      { name: "Paper towels & kitchen rolls", detail: "Absorbent, reliable and easy to stock across busy sites." },
      { name: "Table napkins & serviettes", detail: "Service-ready formats for restaurants, cafés and events." },
      { name: "Paper cups & lids", detail: "Hot and cold drink formats for counters and takeaway." },
      { name: "Takeaway containers", detail: "Food-grade containers for meals, sides and delivery." },
      { name: "Carry bags", detail: "Retail, takeaway and event bags in practical sizes." },
    ],
  },
  {
    slug: "household",
    name: "Household Range",
    eyebrow: "For everyday Ghanaian homes",
    title: "Everyday essentials, stocked without stress.",
    body: "Tissue, napkins, kitchen rolls and household consumables that make daily life cleaner and easier.",
    visual: MARKETING_ASSETS.iris,
    items: [
      { name: "Facial & toilet tissue", detail: "Soft, dependable essentials for the home." },
      { name: "Kitchen towels", detail: "For spills, cleaning and everyday kitchen use." },
      { name: "Disposable napkins", detail: "Neat, convenient and ready for family meals." },
      { name: "Home cleaning consumables", detail: "Practical supplies for routine household care." },
    ],
  },
  {
    slug: "cleaning",
    name: "Cleaning Supplies",
    eyebrow: "For hygiene, housekeeping and washrooms",
    title: "Clean spaces. Steady supply. Less procurement stress.",
    body: "Liquid soaps, bleaches, washing powders and hygiene consumables for businesses and homes that cannot afford to run short.",
    visual: MARKETING_ASSETS.darkBg,
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
    body: "We focus on responsible sourcing, practical packaging choices and reliable supply so customers can reduce waste without disrupting service.",
    visual: MARKETING_ASSETS.passion,
    items: [
      { name: "Responsible sourcing", detail: "Supplier and material choices reviewed with care." },
      { name: "Recyclable options", detail: "Select products and packs designed for recovery." },
      { name: "Right-sized packing", detail: "Reduce unnecessary material in transit and storage." },
      { name: "Local supply", detail: "Shorter, more dependable replenishment routes." },
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
        visual: MARKETING_ASSETS.hangingCosmos,
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
        visual: MARKETING_ASSETS.iris,
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
        visual: MARKETING_ASSETS.cosmos,
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
        visual: MARKETING_ASSETS.passion,
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
};
