/*
 * Jalisco Brews & Bites — Obsidian Luxury system.
 * Deep charcoal, warm gold, crimson ember, amber light, glass surfaces,
 * cinematic motion, and direct reservation-first interactions.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Points } from "three";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Instagram,
  LoaderCircle,
  MapPin,
  Menu as MenuIcon,
  Phone,
  Sparkles,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
      fetchGallery,
      fetchMenu,
      type MenuCategory,
      type PaymentMethod,
      type ReservationPayload,
} from "@/services/api";

const asset = {
  hero: "/manus-storage/jalisco-hero_75436b0c.jpg",
  mark: "/manus-storage/jalisco-logo-new_dc5379db.png",
  dish: "/manus-storage/jalisco-dish-fallback_240c03ac.jpg",
  interior: "/manus-storage/jalisco-interior-fallback_d52f6af3.jpg",
  cocktail: "/manus-storage/jalisco-cocktail-fallback_940850f7.jpg",
};

const fallbackMenu: MenuCategory[] = [
  {
    name: "North Indian",
    items: [
      { name: "Smoked Dal Makhani", description: "Black lentils, charred garlic, cultured butter, tandoori roti.", price: "₹540", isVeg: true, spicyLevel: 1 },
      { name: "Tandoori Prawns", description: "Carom, kasundi, lime, mango salsa, coriander oil.", price: "₹760", isVeg: false, spicyLevel: 2 },
      { name: "Nalli Nihari Bao", description: "Slow-braised lamb, pickled onion, mint, soft milk bao.", price: "₹680", isVeg: false, spicyLevel: 2 },
    ],
  },
  {
    name: "Mexican Fusion",
    items: [
      { name: "Birria Tacos", description: "Slow-cooked beef, Oaxaca cheese, consommé, onion, cilantro.", price: "₹640", isVeg: false, spicyLevel: 2 },
      { name: "Tostada de Atún", description: "Sesame tostada, avocado, citrus ponzu, crispy leeks.", price: "₹520", isVeg: false, spicyLevel: 1 },
      { name: "Mole Poblano", description: "Roasted chicken, toasted sesame, plantain, warm tortillas.", price: "₹720", isVeg: false, spicyLevel: 2 },
    ],
  },
  {
    name: "Brews & Cocktails",
    items: [
      { name: "Agave Highball", description: "Blanco tequila, kokum, grapefruit, soda, sea salt.", price: "₹480", isVeg: true, spicyLevel: 1 },
      { name: "The Golden Hour", description: "Reposado, saffron, pineapple, lime, chili tincture.", price: "₹560", isVeg: true, spicyLevel: 2 },
      { name: "House Lager", description: "Crisp, cold, bright. Poured for the first round.", price: "₹320", isVeg: true, spicyLevel: 0 },
    ],
  },
];

let sceneScrollProgress = 0;

const splitText = (text: string) => text.split("").map((character, index) => <span className="split-char" key={`${character}-${index}`}>{character === " " ? "\u00a0" : character}</span>);

const fallbackGallery = [
  { imageUrl: asset.interior, title: "The rooftop room", category: "ambience" },
  { imageUrl: asset.dish, title: "Tandoori prawns · mango salsa", category: "plates" },
  { imageUrl: asset.cocktail, title: "Agave after dark", category: "drinks" },
];

gsap.registerPlugin(ScrollTrigger);

function isOpenNow() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const now = hour * 60 + minute;
  return now >= 780 || now <= 120;
}

function EmberField() {
  const points = useMemo(() => {
    const positions = new Float32Array(170 * 3);
    for (let i = 0; i < 170; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return positions;
  }, []);
  const ref = useRef<Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.025 + state.pointer.x * 0.08 + sceneScrollProgress * Math.PI * 1.4;
    ref.current.rotation.x = state.pointer.y * 0.06 + sceneScrollProgress * Math.PI * 0.55;
    ref.current.position.y = Math.sin(sceneScrollProgress * Math.PI) * 0.35;
  });

  return (
    <points ref={ref} position={[0, 0, -1]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffbf00" size={0.035} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

function FloatingForms() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y += 0.0015 + sceneScrollProgress * 0.003;
    group.current.rotation.x = state.pointer.y * 0.05 + sceneScrollProgress * 0.18;
    group.current.position.x = state.pointer.x * 0.18 + Math.sin(sceneScrollProgress * Math.PI * 2) * 0.65;
    group.current.position.z = Math.cos(sceneScrollProgress * Math.PI) * 0.3;
  });

  return (
    <group ref={group} position={[1.8, 0.1, -0.3]}>
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.65}>
        <mesh position={[1.4, 1.2, 0]} rotation={[0.4, 0.25, 0.15]} scale={1 + Math.sin(sceneScrollProgress * Math.PI) * 0.28}>
          <dodecahedronGeometry args={[0.72, 0]} />
          <MeshTransmissionMaterial backside thickness={0.32} roughness={0.08} transmission={0.96} ior={1.35} chromaticAberration={0.04} color="#d4af37" />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.9}>
        <mesh position={[-1.1, -0.8, 0.5]} rotation={[0.25, 0.6, 0.12]} scale={1 + sceneScrollProgress * 0.12}>
          <torusGeometry args={[0.62, 0.2, 24, 64]} />
          <meshPhysicalMaterial color="#8b0000" emissive="#360000" emissiveIntensity={0.25} roughness={0.23} metalness={0.35} clearcoat={0.8} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh position={[0.2, -1.3, 0]} rotation={[0.1, 0.2, 0]} scale={1 + Math.sin(sceneScrollProgress * Math.PI) * 0.5}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshPhysicalMaterial color="#ffbf00" emissive="#6d4300" emissiveIntensity={0.4} roughness={0.22} metalness={0.55} />
        </mesh>
      </Float>
    </group>
  );
}

function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 46 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.4} color="#d4af37" />
      <pointLight position={[3, 3, 2]} color="#ffbf00" intensity={6} distance={9} />
      <pointLight position={[-3, -2, 1]} color="#8b0000" intensity={4} distance={7} />
      <EmberField />
      <FloatingForms />
    </Canvas>
  );
}

function useMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ autoRaf: false, duration: reduced ? 0.01 : 1.15, smoothWheel: !reduced });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const context = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: "power4.out" } });
      entrance.to(".preloader-progress", { scaleX: 1, duration: reduced ? 0.05 : 0.9 }).to(".preloader", { yPercent: -100, duration: reduced ? 0.05 : 0.9, ease: "power4.inOut" }).fromTo(".hero-status-enter", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.35 }, "-=0.45").fromTo(".hero h1 .split-char", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.022 }, "-=0.14").fromTo(".hero-subtitle, .hero-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, "-=0.28");

      gsap.utils.toArray<HTMLElement>(".split-reveal").forEach((element) => {
        gsap.fromTo(element.querySelectorAll(".split-char"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduced ? 0.05 : 0.7, stagger: 0.025, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 82%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>(".reveal:not(.hero-content)").forEach((element) => {
        gsap.fromTo(element, { opacity: 0, y: 40 }, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 84%", once: true },
        });
      });
      gsap.to(".hero-orbit", { yPercent: 34, rotate: 20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 } });
      gsap.to(".hero-canvas", { yPercent: -10, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.4 } });
      gsap.to(".hero-content", { scale: 0.97, yPercent: -4, opacity: 1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".giant-wordmark", { xPercent: -18, skewX: -5, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.1 } });
      gsap.to(".hero h1", { yPercent: -3, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.15 } });
      ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onUpdate: (self) => { sceneScrollProgress = self.progress; } });
      const galleryCards = gsap.utils.toArray<HTMLElement>(".gallery-card");
      ScrollTrigger.create({ trigger: ".gallery-strip", start: "top bottom", end: "bottom top", onUpdate: () => { const center = window.innerWidth / 2; galleryCards.forEach((card) => { const box = card.getBoundingClientRect(); const distance = Math.abs(box.left + box.width / 2 - center) / Math.max(window.innerWidth / 2, 1); gsap.set(card, { scale: 1.08 - Math.min(distance, 1) * 0.22, opacity: 1 - Math.min(distance, 1) * 0.35, rotate: (box.left + box.width / 2 - center) * -0.004 }); }); } });
    });

    return () => {
      cancelAnimationFrame(frame);
      context.revert();
      lenis.destroy();
    };
  }, []);
}

function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reservationMutation = trpc.reservations.create.useMutation();
  const checkoutMutation = trpc.payments.createCheckout.useMutation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [form, setForm] = useState<ReservationPayload>({ customerName: "", phoneNumber: "", email: "", reservationDate: "", timeSlot: "20:00", guestCount: 2, specialRequests: "" });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const update = (key: keyof ReservationPayload, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = { ...form, paymentMethod };
      const reservation = await reservationMutation.mutateAsync(payload);
      const checkout = await checkoutMutation.mutateAsync({ reservationId: reservation.id, paymentMethod, amount: 500, currency: "INR" });
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
      } else {
        toast.success("Booking request received", { description: "Your reservation is saved. Payment gateway credentials are ready to connect." });
      }
      onClose();
    } catch (error) {
      toast.error("We could not save your booking", { description: error instanceof Error ? error.message : "Please try again or call 09211313486." });
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="reservation-drawer" data-lenis-prevent="true" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
        <button className="drawer-close" type="button" onClick={onClose} aria-label="Close reservation form"><X size={20} /></button>
        <p className="kicker gold">RESERVATIONS · JALISCO NOIDA</p>
        <h2 id="reservation-title">Save your<br /><em>seat.</em></h2>
        <p className="drawer-copy">The rooftop is ready. Tell us when you’re coming and we’ll take care of the rest.</p>
        <form className="drawer-form" onSubmit={handleSubmit}>
          <label>Name<input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="Your name" required /></label>
          <label>Phone<input value={form.phoneNumber} onChange={(event) => update("phoneNumber", event.target.value)} placeholder="+91 98xxx xxxxx" required /></label>
          <label>Email<input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" placeholder="you@email.com" required /></label>
          <div className="drawer-row"><label>Date<input value={form.reservationDate} onChange={(event) => update("reservationDate", event.target.value)} type="date" required /></label><label>Guests<select value={form.guestCount} onChange={(event) => update("guestCount", Number(event.target.value))}><option value={2}>2 guests</option><option value={3}>3 guests</option><option value={4}>4 guests</option><option value={5}>5 guests</option><option value={6}>6+ guests</option></select></label></div>
          <label>Time slot<select value={form.timeSlot} onChange={(event) => update("timeSlot", event.target.value)}><option value="19:00">7:00 PM</option><option value="20:00">8:00 PM</option><option value="21:00">9:00 PM</option><option value="22:00">10:00 PM</option></select></label>
          <label>Special requests<textarea value={form.specialRequests} onChange={(event) => update("specialRequests", event.target.value)} placeholder="Birthday, dietary notes, rooftop preference…" rows={3} /></label>
          <fieldset className="payment-block"><legend>Secure booking deposit · ₹500</legend><p>Choose your preferred payment method. The secure gateway can be connected later without changing this booking experience.</p><div className="payment-options">{([['upi', 'UPI', 'Fast Indian checkout'], ['card', 'Cards', 'Credit or debit cards'], ['international', 'International', 'Global card payments']] as const).map(([value, label, description]) => <label className={paymentMethod === value ? "payment-option active" : "payment-option"} key={value}><input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><span><strong>{label}</strong><small>{description}</small></span></label>)}</div></fieldset>
          <button className="gold-button full" type="submit" disabled={reservationMutation.isPending || checkoutMutation.isPending}>{reservationMutation.isPending || checkoutMutation.isPending ? <LoaderCircle className="spin" size={17} /> : <CalendarDays size={17} />} {reservationMutation.isPending || checkoutMutation.isPending ? "Preparing booking" : "Continue to secure payment"}</button>
        </form>
      </aside>
    </div>
  );
}

function StatusPill() {
  const open = isOpenNow();
  return <span className={`status-pill ${open ? "open" : "closed"}`}><span /> {open ? "Open now" : "Closed · opens 1 PM"}</span>;
}

export default function Home() {
  useMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const menuQuery = useQuery({ queryKey: ["menu"], queryFn: fetchMenu, retry: 1, staleTime: 1000 * 60 * 5 });
  const galleryQuery = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery, retry: 1, staleTime: 1000 * 60 * 5 });
  const menu = menuQuery.data?.length ? menuQuery.data : fallbackMenu;
  const gallery = galleryQuery.data?.length ? galleryQuery.data : fallbackGallery;
  const activeItems = menu[activeCategory]?.items || fallbackMenu[0].items;

  return (
    <div className="luxury-site">
      <div className="preloader" aria-hidden="true"><div className="preloader-monogram">J</div><div className="preloader-progress"><span /></div><span className="preloader-label">Jalisco Brews &amp; Bites</span></div>
      <header className="luxury-header">
        <a className="luxury-brand" href="#top" aria-label="Jalisco Brews and Bites home"><img src={asset.mark} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>Jalisco <small>Brews &amp; Bites</small></span></a>
        <nav className={mobileOpen ? "luxury-nav open" : "luxury-nav"} aria-label="Main navigation">
          <a href="#concept" onClick={() => setMobileOpen(false)}>{splitText("The concept")}</a>
          <a href="#menu" onClick={() => setMobileOpen(false)}>{splitText("Menu")}</a>
          <a href="#gallery" onClick={() => setMobileOpen(false)}>{splitText("Gallery")}</a>
          <a href="#visit" onClick={() => setMobileOpen(false)}>{splitText("Visit us")}</a>
        </nav>
        <div className="header-actions"><StatusPill /><button className="gold-button compact" type="button" onClick={() => setReservationOpen(true)} style={{ backgroundColor: "#df5030" }}>Reserve <ArrowRight size={14} /></button><button className="menu-toggle" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">{mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}</button></div>
      </header>

      <main id="top">
        <section className="hero hero-dark" aria-labelledby="hero-title">
          <div className="hero-canvas"><HeroCanvas /></div>
          <div className="giant-wordmark" aria-hidden="true">JALISCO</div>
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-content"><p className="kicker gold hero-status-enter">ROOFTOP DINING · NOIDA</p><h1 id="hero-title"><span className="split-line">{splitText("Where authentic")}</span><span className="split-line accent-line">{splitText("Mexican zest")}</span><span className="split-line">{splitText("meets North")}</span><span className="split-line accent-line">{splitText("Indian comfort.")}</span></h1><p className="hero-subtitle">A high-altitude meeting of fire, spice, and good company. Built for long lunches, golden hour pours, and nights that find their own rhythm.</p><div className="hero-buttons"><button className="gold-button" type="button" onClick={() => setReservationOpen(true)}>Reserve a table <ArrowRight size={16} /></button><a className="text-button light" href="#menu">Explore the menu <ArrowDown size={16} /></a></div></div>
          <div className="hero-footer"><span>Sector 18 · Noida</span><span className="hero-scroll"><span /> Scroll to discover</span><span>12:00 — 23:45 IST</span></div>
        </section>

        <section className="statement-section" id="concept">
          <div className="statement-mark"><Sparkles size={17} /><span>J / B</span></div>
          <div className="statement-copy reveal"><p className="kicker gold">A NEW KIND OF ROOFTOP</p><h2 className="split-reveal"><span className="split-line">{splitText("Two cultures.")}</span><em className="split-line">{splitText("One table.")}</em></h2><p>Jalisco Brews &amp; Bites is a rooftop fusion bar where North Indian soul meets Mexican electricity. Familiar ingredients take the scenic route. The result is unexpected, generous, and made to be passed around.</p><a className="text-button gold-text" href="#gallery">Meet the atmosphere <ArrowRight size={15} /></a></div>
          <div className="statement-side reveal"><div className="side-line" /><p>01</p><p>Fiery plates<br />&amp; slow pours</p></div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading reveal"><div><p className="kicker gold">THE MENU</p><h2 className="split-reveal"><span className="split-line">{splitText("Comfort,")}</span><em className="split-line">{splitText("with a kick.")}</em></h2></div><p className="section-intro">A menu that travels well. Tandoor smoke, citrus brightness, and a little heat in all the right places.</p></div>
          <div className="menu-tabs" role="tablist">{menu.map((category, index) => <button className={activeCategory === index ? "menu-tab active" : "menu-tab"} key={category.name} type="button" role="tab" aria-selected={activeCategory === index} onClick={() => setActiveCategory(index)}>{category.name}</button>)}</div>
          {menuQuery.isLoading ? <div className="menu-loading"><LoaderCircle className="spin" /> Loading the good stuff…</div> : menuQuery.isError ? <div className="api-note">Showing the house menu while the API reconnects.</div> : null}
          <div className="dish-grid reveal" key={activeCategory}>{activeItems.map((item, index) => <article className="dish-card" key={item.name}><div className="dish-number">0{index + 1}</div><div className="dish-info"><div className="dish-topline"><span className="dish-type">{item.isVeg ? "VEG" : "FROM THE FIRE"}</span>{item.spicyLevel ? <span className="heat">{"✦".repeat(item.spicyLevel)}</span> : null}</div><h3>{item.name}</h3><p>{item.description}</p><span className="dish-price">{typeof item.price === "number" ? `₹${item.price}` : item.price}</span></div><div className="dish-arrow"><ArrowRight size={17} /></div></article>)}</div>
          <button className="outline-button" type="button" onClick={() => toast.info("Full menu PDF coming soon.")}>View the full menu <ArrowRight size={15} /></button>
        </section>

        <section className="gallery-section" id="gallery"><div className="gallery-header reveal"><p className="kicker gold">THE ROOFTOP</p><h2 className="split-reveal"><span className="split-line">{splitText("Come for the view.")}</span><em className="split-line">{splitText("Stay for the mood.")}</em></h2><div className="gallery-meta"><StatusPill /><a className="gallery-instagram" href="https://www.instagram.com/jalisco.brews/" target="_blank" rel="noreferrer" aria-label="Open Jalisco Brews and Bites on Instagram">@jalisco.brews <Instagram size={15} /></a></div></div><div className="gallery-strip">{gallery.map((image, index) => <figure className={`gallery-card gallery-${index + 1}`} key={`${image.imageUrl}-${index}`}><img src={image.imageUrl} alt={image.title || "Jalisco rooftop dining"} /><figcaption><span>0{index + 1}</span>{image.title || "Jalisco after dark"}</figcaption></figure>)}</div>{galleryQuery.isLoading ? <div className="gallery-loading"><LoaderCircle className="spin" /> Loading the atmosphere…</div> : null}</section>

        <section className="quote-section"><div className="quote-star">✦</div><blockquote className="split-reveal"><span className="split-line">{splitText("“Make tonight")}</span><em className="split-line">{splitText("the good kind of loud.”")}</em></blockquote><div className="quote-byline"><span /> The Jalisco table · Noida</div></section>

        <section className="payment-band" aria-labelledby="payment-title"><div><p className="kicker gold">BOOK WITH CONFIDENCE</p><h2 id="payment-title">Your table,<br /><em>one secure step away.</em></h2><p>Reserve your evening with a ₹500 deposit. UPI, cards, and international card payments are ready to connect through a secure gateway.</p></div><div className="payment-band-side"><div className="payment-method-row"><span>UPI</span><span>Cards</span><span>International</span></div><button className="gold-button" type="button" onClick={() => setReservationOpen(true)}>Book &amp; pay deposit <ArrowRight size={16} /></button><small>Secure checkout · gateway-ready</small></div></section>

        <section className="visit-section" id="visit"><div className="visit-copy reveal"><p className="kicker gold">FIND YOUR WAY HERE</p><h2 className="split-reveal"><span className="split-line">{splitText("The rooftop")}</span><em className="split-line">{splitText("is calling.")}</em></h2><div className="visit-details"><div><MapPin size={17} /><span>Unit No. 05, 3rd Floor<br /><small>Building Urbtech NPX, Sector 153, Greater Noida, Noida, Uttar Pradesh 201304</small></span></div><div><Clock3 size={17} /><span>Open now · Every day<br /><small>1:00 PM — 2:00 AM IST</small></span></div><div><Phone size={17} /><span>Reservations<br /><small>09211313486</small></span></div></div><a className="gold-button" href="tel:+919211313486">Call to reserve <Phone size={16} /></a></div><div className="visit-map"><div className="map-glow" /><div className="map-lines" /><div className="map-label"><span>JALISCO BREWS &amp; BITES</span><strong>Urbtech NPX</strong><small>Sector 153 · Noida</small></div><div className="map-pin"><MapPin size={18} /></div><a href="https://maps.google.com/?q=Jalisco+Brews+%26+Bites+Urbtech+NPX+Sector+153+Noida+Uttar+Pradesh+201304" target="_blank" rel="noreferrer">Open in maps <ArrowRight size={14} /></a></div></section>
      </main>

      <footer className="luxury-footer"><div className="footer-brand"><img src={asset.mark} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>Jalisco <small>Brews &amp; Bites</small></span></div><p>Authentic zest. North Indian comfort.<br />Made for the rooftop.</p><div className="footer-links"><a href="https://www.instagram.com/jalisco.brews/" target="_blank" rel="noreferrer"><Instagram size={15} /> @jalisco.brews</a><a href="tel:+919211313486"><Phone size={15} /> 09211313486</a></div></footer>
      <ReservationModal open={reservationOpen} onClose={() => setReservationOpen(false)} />
    </div>
  );
}
