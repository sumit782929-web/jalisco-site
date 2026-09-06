# Master Prompt: Jalisco Brews & Bites Website

Build a polished, responsive single-page restaurant website for **Jalisco Brews & Bites**, a luxury rooftop-fusion restaurant in Noida, India.

## Brand Positioning

Jalisco Brews & Bites combines the energy of Mexican food and cocktails with the warmth and comfort of North Indian cuisine. The experience should feel sophisticated, lively, premium, welcoming, and memorable. The visual identity must combine **minimalistic structure, sophisticated typography, refined pop-art details, and luxury hospitality**.

Use this brand line as the central idea:

> Where authentic Mexican zest meets North Indian comfort.

The brand should feel bold but never chaotic, artistic but never childish, premium but never cold, and modern without looking like a generic technology website.

## Visual Direction

Create a **Modern Fiesta luxury editorial** interface using the following direction:

- Dominant colours: obsidian black, warm bone white, deep espresso, metallic gold, Jalisco Terracotta `#E94F32`, and restrained crimson.
- Use Jalisco Terracotta for primary buttons, key actions, active states, important emphasis, and brand punctuation.
- Use metallic gold, mustard, avocado, cobalt, and crimson only as secondary pop-art accents.
- Use warm editorial food and rooftop photography with rich contrast and natural texture.
- Use a refined display serif for large headlines and a clean sans-serif for navigation, body copy, metadata, and buttons.
- Use asymmetric editorial layouts, generous whitespace, offset blocks, thin rules, framed images, circular geometry, sunburst/star symbols, poster-like labels, and subtle print-inspired texture.
- Avoid excessive rounded cards, purple gradients, generic SaaS layouts, default Inter typography, loud neon effects, and unnecessary visual clutter.
- Keep text highly readable against its actual background.

## Homepage Structure

Create the following sections in this order:

1. **Fixed header:** Include the Jalisco logo, wordmark, navigation links for The Concept, Menu, Gallery, and Visit Us, an opening-status indicator, and a Terracotta Reserve button. The header should remain readable over the page.
2. **Hero section:** Use a dark obsidian background with a subtle WebGL ambience, elegant orbit lines, amber particles, and a large outlined JALISCO wordmark behind the content. Add the headline:
   - Where authentic
   - Mexican zest
   - meets North
   - Indian comfort.
   Include a short supporting paragraph, Reserve a Table CTA, Explore the Menu CTA, location, opening hours, and scroll indicator.
3. **Concept section:** Use a bright warm paper background. Present the message “Two cultures. One table.” with a concise description of the restaurant concept and a small editorial side marker.
4. **Menu section:** Add dynamic category tabs such as House Favourites, Tandoor & Fire, and Pour & Pair. Display menu items with name, description, price, vegetarian label, and spice level. Add loading skeletons and an API fallback state.
5. **Gallery section:** Present a horizontal or asymmetric image gallery showing the rooftop, food, cocktails, and restaurant atmosphere. Use crisp image rendering and subtle hover scale only. Do not blur or distort images when the cursor moves over them.
6. **Quote section:** Add the editorial quote “Make tonight the good kind of loud.” on a strong crimson or Terracotta background with a restrained circular/star motif.
7. **Visit section:** Include address, opening hours, phone number, a premium map-style visual, directions link, and reservation CTA.
8. **Footer:** Include the Jalisco logo, short brand line, Instagram link, phone link, and compact contact information.

## Interaction and Animation Requirements

Use motion carefully to make the site feel luxurious and memorable rather than distracting.

### Page entrance

Add a short preloader curtain with the Jalisco monogram, progress line, and “Jalisco Brews & Bites” label. The curtain should exit smoothly after the page is ready. Respect `prefers-reduced-motion` by disabling the preloader for users who request reduced motion.

Use split-character entrance reveals for the hero headline, navigation labels, and key section headlines. Use staggered opacity and vertical movement with premium easing.

### Hero scroll behavior

The Jalisco restaurant name and hero content must **not disappear** after the first scroll. The hero content must remain readable while the hero is in view.

Use ScrollTrigger scrub-based movement for subtle hero scale, canvas parallax, orbital movement, and outlined wordmark drift. The animation must be reversible:

- When the customer scrolls down, the hero moves gently through its exit motion.
- When the customer scrolls up, the same motion reverses smoothly.
- Never leave the hero title, restaurant name, subtitle, or buttons at `opacity: 0`.
- Do not allow generic one-time reveal animations to override the hero’s visibility state.

### WebGL ambience

Use React Three Fiber and Drei to create an atmospheric, low-opacity hero canvas containing:

- Small warm amber particles or embers.
- A translucent floating glass or cocktail-inspired form.
- A slowly rotating ice-like form.
- A torus or ring drift element.
- Gentle mouse parallax only for the WebGL scene.
- Scroll-linked movement for the 3D forms.

The WebGL scene must remain subtle behind the text and must not reduce headline contrast.

### Gallery interactions

Use centre-focus motion for gallery cards: the card closest to the viewport centre may scale slightly, while side cards remain calm and readable. Keep all images sharp. Never apply cursor-triggered blur, liquid displacement, turbulence, or distortion.

### Menu transitions

When the customer changes menu categories, use a refined 3D depth-flip or lift transition for the dish cards. Keep the transition under 600ms and ensure the content remains accessible to keyboard users.

### Cursor behavior

Do not create a custom cursor dot, circle, ring, or trailing pointer. Keep the browser’s native cursor. Buttons and links may use standard hover colour, underline, lift, or shadow states, but no custom cursor overlay.

## Functional Requirements

Use React with a clean component structure. Use React Three Fiber, Drei, GSAP, ScrollTrigger, Lenis, Axios, and TanStack React Query where useful.

Create an API-ready service layer with:

- Configurable `VITE_API_BASE_URL`.
- Axios instance.
- Authorization header interceptor when a token exists.
- Typed functions for menu, gallery, and reservation requests.
- Loading and error states.
- High-quality local fallback data when the backend is unavailable.

Build a reservation slide-over or modal containing:

- Customer name.
- Phone number.
- Email.
- Reservation date.
- Time slot.
- Guest count.
- Special requests.
- Submit button.
- Success and error feedback.

Use accessible labels, focus states, keyboard navigation, semantic headings, alt text, and touch-friendly controls. On mobile, keep quick actions for Call, WhatsApp, Directions, and Reserve visible where appropriate.

## Content Rules

Use concise, specific restaurant copy. Do not use generic filler such as “Welcome to our website” or “Get started today.”

Use placeholder contact details only when final business information has not been supplied. Clearly structure the code so the owner can replace:

- Exact Noida address.
- Sector and landmark.
- Phone number.
- Email address.
- Instagram handle.
- Opening hours.
- Menu prices.
- Reservation endpoint.
- Google Maps coordinates.

Never fabricate customer reviews, ratings, testimonials, awards, or user-generated content. If review content is not supplied, leave the section ready for genuine approved content.

## Responsive and Technical Requirements

The result must work on desktop, tablet, and mobile screens. Design mobile-first for the menu, reservation modal, navigation, and gallery.

Use strong contrast, responsive typography, optimised image URLs, semantic HTML, and reduced-motion fallbacks. Keep the public frontend client-only unless a backend is explicitly provided. Do not modify server logic or database schemas unless the project specifically requires it.

Before delivery:

1. Run the TypeScript check.
2. Run the production build.
3. Check the initial hero state.
4. Check down-scroll and up-scroll behavior.
5. Confirm the restaurant name never becomes permanently hidden.
6. Confirm there is no custom cursor ring.
7. Confirm images remain crisp when hovered.
8. Test the reservation modal on desktop and mobile.
9. Test keyboard focus and reduced-motion behavior.
10. Replace all placeholder business details before publishing.

Deliver a sophisticated Jalisco Brews & Bites website that feels like a high-end rooftop destination: **warm, editorial, luxurious, energetic, and unmistakably its own brand.**
