# MedLink

Connecting Distributors & Manufacturers for a Healthier Tomorrow.

A B2B marketplace connecting pharmaceutical distributors and pharmacy owners on one shared, real-time stock ledger. Built with plain HTML5, CSS3, and vanilla JavaScript — no frameworks.

## How to view it

No build step needed. Open `index.html` directly in any browser (double-click it, or drag it into a browser window). Keep the whole `MedLink` folder together — the page loads its CSS, JS, and images from the `css/`, `js/`, and `images/` folders next to it using relative paths.

## Project structure

```
MedLink/
├── index.html          ← Landing page (complete)
├── about.html           ← Coming next
├── products.html        ← Coming next
├── login.html           ← Coming next
├── register.html        ← Coming next
├── dashboard.html        ← Coming next
├── orders.html           ← Coming next
├── tracking.html         ← Coming next
├── profile.html          ← Coming next
├── contact.html          ← Coming next
│
├── css/
│   ├── style.css        ← Design tokens + all landing page section styles
│   └── responsive.css    ← Tablet (≤1024px) and mobile (≤640px) breakpoints
│
├── js/
│   ├── script.js         ← Navbar scroll effect, mobile menu, FAQ accordion
│   └── animation.js      ← Scroll-reveal fade-ins, counter animations
│
├── images/
│   ├── logo.svg          ← MedLink mark (plus/link symbol, not a medical cross)
│   ├── hero-image.svg    ← Hero illustration
│   ├── medicines/        ← Reserved for product images as pages are built
│   ├── icons/            ← Reserved (most icons are inlined as SVG for now)
│   └── companies/        ← Reserved (trusted-companies strip currently uses text wordmarks)
│
└── README.md
```

## Design tokens

Defined at the top of `css/style.css` as CSS variables, so every future page reuses the same values:

- `--primary-blue: #2563EB`
- `--light-navy: #1E3A8A`
- `--orange: #F97316`
- `--gold: #FBBF24`
- `--bg: #F8FAFC`
- Fonts: `Playfair Display` (headings), `IBM Plex Sans` (body/UI)

## Status

Landing page is complete: navigation, hero, trusted companies strip, features, marketplace preview, analytics section, testimonials, FAQ accordion, call-to-action banner, and footer — all responsive and with scroll/hover animations.

Next up, in order: Login → Register → Dashboard → Product Page → Cart → Tracking → Profile.
