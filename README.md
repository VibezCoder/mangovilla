# The Mango Villa — Ratnagiri

An independent, single-page editorial concept for **The Mango Villa**, a family-run homestay on Nachane Road, Ratnagiri. This is a design pitch, **not** the property's official website. All photography and property details belong to The Mango Villa. The build is intentionally `noindex, nofollow`.

## Run it

With Node.js 22+ installed:

```bash
cd mango-villa
node server.mjs
```

Open **http://127.0.0.1:8901/** — serve it, don't double-click `index.html` (module/font loading behaves better over HTTP). On Windows you can also double-click `start-concept.bat`.

The preview server is dependency-free and serves only this folder. No build step is required to view the site.

## What is inside

- **Pinned canopy walk-through** — the hero stays full-bleed and pins while the photograph pushes in, a saffron bloom rises behind the villa, drawn mango branches drift apart, and the headline's two lines separate and dissolve; scrolling back reverses it.
- **Live header inking** — the fixed header reads its midline against every `[data-section-theme]` section on each frame and switches between linen/forest glass.
- **Chapter I · Roots** — the founders' story (Dr. Amit & Dr. Neeti Salvi), masked line reveals, a parallax veranda frame and a floating ixora detail.
- **Estate band** — a wide, slow-scaling view of the villa and garden.
- **Chapter II · Suites** — the four real room categories (Premium Deluxe, Super Deluxe, Deluxe 1, Deluxe 2) with real amenity sets and staggered entrances.
- **Chapter III · The Table** — a 58vh full-bleed culinary interlude using the property's banana-leaf thali photography and real menu names.
- **Field Notes** — a scroll-snap photographic rail with arrow controls.
- **Booking dock + drawer** — live date formatting, nights calculation, guest counts, room prefill, focus trapping, scroll locking, and a two-way handoff to the live IPMS247 engine or WhatsApp concierge.
- **Accessible fallbacks** — reduced-motion mode skips Lenis/GSAP entirely; booking links and the dock's primary CTA still point at the live engine if JavaScript fails.

## Booking behaviour

The villa's guest booking engine (`live.ipms247.com/booking/book-rooms-themangovilla`) does not document public URL parameters for pre-filling dates or guests. The drawer therefore does **not** pretend to reserve anything: it validates and summarises the stay, then either:

1. opens the live IPMS247 booking engine in a new tab, or
2. opens WhatsApp (`+91 84229 26232`) with the dates, nights, guest count and room preference pre-filled.

No payment is taken in this concept. Availability and rates must always be confirmed by the property.

## Structure

```
mango-villa/
├─ index.html
├─ server.mjs                 # dependency-free preview server (port 8901)
├─ start-concept.bat
├─ assets/
│  ├─ css/theme-mango-villa.css
│  ├─ css/lenis.css           # vendored
│  ├─ js/motion-engine.js
│  ├─ js/vendor/              # gsap, ScrollTrigger, Lenis (self-hosted)
│  ├─ fonts/                  # Playfair Display + Plus Jakarta Sans (latin WOFF2)
│  ├─ img/                    # optimized responsive derivatives
│  └─ img-src/                # original photography downloaded from themangovillas.com
└─ tools/build-images.mjs     # sharp pipeline: WebP variants + JPG fallbacks
```

## Image pipeline

Originals were downloaded from the property's WordPress media library into `assets/img-src/`. Regenerate the responsive set from the repository root with:

```bash
node mango-villa/tools/build-images.mjs
```

The script uses the workspace's existing `sharp` install and writes WebP variants plus JPG fallbacks into `assets/img/` (hero, founders' frame, estate band, four suites, dining interlude, six field notes, social cover).

## Motion stack

- `Lenis 1.3.27` and `GSAP 3.15.1 + ScrollTrigger` are vendored locally, so the concept works without a CDN.
- Smooth scrolling is enabled only for fine pointers; touch devices keep native scrolling.
- `prefers-reduced-motion: reduce` disables the pinned canopy, parallax, masks, staggers and Lenis, leaving a fully readable static page.
- Header inking is measured live rather than hard-coded to scroll offsets, so it survives pin spacers and viewport changes.

## Verified

- **Desktop** (912px and 1440px CSS): full-bleed hero and canopy scrub, live header inking, masked chapter reveals, suite stagger, field-notes rail, and the floating dock.
- **Mobile** (390 × 844): collapsed navigation and menu, stacked hero, two-column dock, full-width booking drawer, and no horizontal overflow.
- **Booking drawer**: today +7/+9 defaults, one-night minimum validation, guest and room state, live WhatsApp prefill, IPMS247 submit handoff, scroll lock, Escape/backdrop close, focus trap and focus return.
- **Reduced motion**: static hero (no pin), visible masked headings and suite cards, reset parallax, ambient animations disabled.
- Fresh load: no console errors, failed fonts, or missing images.

## Notes for a real launch

- Replace `noindex, nofollow`, add the property's canonical domain and confirm image rights with the hotel.
- Confirm current room names, amenities, menu and policies before publishing; this concept reflects the public site as of November 2026.
- If IPMS247 later exposes documented prefill parameters, wire them into the drawer's submit handler; until then the two-step handoff is the honest option.
- The preview server is for local presentation only, not a production host.
