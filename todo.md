# Jalisco Brews & Bites Redesign Tasks

- [x] Install Three.js, React Three Fiber, Drei, GSAP, Lenis, Axios, and TanStack React Query.
- [x] Update the brand, copy, metadata, and visual system to Jalisco Brews & Bites.
- [x] Build the interactive WebGL hero canvas with amber particles and floating 3D forms.
- [x] Add Lenis smooth scrolling and GSAP ScrollTrigger section motion.
- [x] Add magnetic CTA and tilt/parallax card interactions.
- [x] Create the API service layer with Axios, auth interceptor, loading/error handling, and fallback data.
- [x] Build dynamic menu category tabs with loading skeletons and API fallback.
- [x] Build the interactive gallery with loading/error states and API fallback.
- [x] Build the reservation slide-over modal and POST reservation flow.
- [x] Validate mobile, reduced-motion behavior, TypeScript, and production build.
- [x] Save a final checkpoint and deliver the updated project.

## Animation Layer v2

- [x] Add the chained preloader curtain and hero entrance/exit timeline.
- [x] Add the fine-pointer custom cursor with magnetic interactive states.
- [x] Add split-character nav and heading reveals plus giant outlined JALISCO wordmark.
- [x] Tie floating WebGL forms to scroll progress.
- [x] Add SVG turbulence liquid filters and image hover distortion.
- [x] Add gallery focus scale/tilt behavior.
- [x] Add 3D depth-flip transitions to menu category changes.
- [x] Revalidate reduced-motion behavior, touch behavior, and production build.
- [x] Save a final animation checkpoint and deliver the update.

## Cursor and Luxury Polish Refinement

- [x] Remove the visible cursor ring while preserving native cursor behavior.
- [x] Remove cursor-triggered image blur and turbulence distortion.
- [x] Refine hero motion and scroll choreography for a more premium feel.
- [x] Strengthen luxury pop-art hierarchy, depth, and interaction polish.
- [x] Validate desktop/mobile rendering and production build.
- [x] Save and deliver the refined project checkpoint.

## Persistent Hero Scroll Refinement

- [x] Keep the Jalisco name and hero content visible while scrolling through the page.
- [x] Make the hero entrance reverse naturally when the customer scrolls back upward.
- [x] Validate the behavior on desktop and mobile, then save the update.

## Hero Visibility Debug

- [x] Inspect hero entrance and ScrollTrigger opacity state.
- [x] Remove any persistent hidden state from split-character hero content.
- [x] Verify the name remains visible after down-scroll and reverse up-scroll.
- [x] Rebuild and save the fix.

## Business Details and Payments

- [x] Replace map and visit-section content with the supplied Jalisco Noida address.
- [x] Update all opening hours to 1:00 PM–2:00 AM and show Open now.
- [x] Replace the contact number with 09211313486.
- [x] Add a payment and booking section ready for secure backend gateway integration.
- [x] Validate the updated contact details, booking flow, and build.
- [x] Save and deliver the updated project checkpoint.

## Booking Scroll Fix

- [x] Inspect the booking drawer and any body/Lenis scroll-lock behavior.
- [x] Ensure the payment drawer has independent internal scrolling.
- [x] Restore page scrolling after close, submit, or backdrop dismissal.
- [x] Validate Book & Pay Deposit on desktop and mobile, then save the fix.

## Full-Stack Booking and Payments

- [x] Upgrade the static project to full-stack web-db-user capabilities.
- [x] Define reservation, availability, and payment data models; document notifications as a future enhancement.
- [x] Generate and apply database migrations safely.
- [x] Implement typed backend reservation procedures and validation.
- [x] Implement secure provider-neutral payment order and webhook contracts.
- [x] Connect the frontend booking flow to the backend procedures.
- [x] Add protected admin reservation visibility and status operations.
- [x] Defer live gateway secrets and document the remaining Razorpay activation requirements.
- [x] Test reservation, payment, failure, duplicate, and webhook paths.
- [x] Save a production-ready checkpoint and guide the user to Publish.

## Full-Stack Repair and Completion Pass

- [x] Repair missing full-stack dependencies and restore the dev server.
- [x] Add reservation, availability, and payment persistence tables.
- [x] Apply and verify database migrations safely.without destructive changes.
- [x] Implement secure backend procedures, payment adapter, and webhook contract.
- [x] Connect the frontend booking UI to typed backend procedures.
- [x] Add protected admin reservation visibility and status operations.
- [x] Add Vitest coverage and run check, test, and production build.
- [x] Save a publish-ready checkpoint and provide Publish instructions.

## Razorpay Test Mode Integration

- [x] Defer storing Razorpay Test Mode credentials until an organization merchant account exists.
- [x] Defer requesting the Razorpay webhook secret until an organization merchant account exists.
- [x] Defer Razorpay order creation and hosted checkout handoff until merchant onboarding is complete.
- [x] Defer Razorpay signature verification activation; the provider-neutral signed webhook boundary is implemented.
- [x] Keep checkout status provider-neutral until Razorpay merchant credentials are available.
- [x] Defer Razorpay-specific payment tests; provider-neutral payment and webhook tests pass.
- [x] Defer the Razorpay integration checkpoint and document the Live Mode handoff in JALISCO_SETUP.md.

## Deferred Live Payments Completion

- [x] Keep Razorpay credentials and webhook configuration deferred until an organization merchant account exists.
- [x] Document the gateway-neutral booking state and future Razorpay activation steps.
- [x] Run final gateway-neutral tests, production build, and responsive verification.
- [x] Save the publish-ready gateway-neutral checkpoint and provide Publish instructions.

- [x] Run final mobile visual verification for the gateway-neutral public booking flow.
- [x] Verify the admin route at a small viewport or document it as desktop-oriented.

## Professional Admin Dashboard

- [ ] Inspect the current admin reservations page and its typed backend data/actions.
- [ ] Design a professional Jalisco operations dashboard with clear hierarchy and responsive behavior.
- [ ] Add KPI cards, reservation filters, search, status actions, and useful empty/loading states.
- [ ] Preserve admin protection and connect all actions to real backend procedures.
- [ ] Validate desktop/mobile admin layouts, permissions, tests, and production build.
- [ ] Save and deliver the admin dashboard checkpoint.
