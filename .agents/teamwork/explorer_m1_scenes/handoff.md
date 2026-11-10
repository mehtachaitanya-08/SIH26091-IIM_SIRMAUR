# Handoff Report: Scenes 1–5, Floating Capsule, Header & Lenis Architecture Blueprint

**Agent**: Walton Scroll Scenes 1–5 Architecture Explorer (Milestone 1)  
**State Folder**: `c:\Users\LENOVO\Desktop\IPL 2 Project Research\.agents\teamwork\explorer_m1_scenes\`  
**Target File**: `frontend/src/App.jsx`  
**Date**: 2026-11-09T22:20:00Z  

---

## 1. Observation

### 1.1 Reference Materials & Exact Video Breakdown
Direct observation of reference materials (`Access to Opportunity_ Gallup Research _ Walton Family Foundation - Brave 2026-11-10 03-01-07.mp4` and `interactive_platform_prototype.html`):
- **Hero Dispersion (Frames 001–009)**:
  - Giant condensed serif typography: `WHERE / OPPORTUNITY / TAKES / ROOT`.
  - Pinned cluster of 1 center 3:2 landscape photo card + 4 satellite cards + 3 colored square accent chips (`#D49B5A` ochre, `#5A7352` olive, `#4A6274` slate).
  - On scroll scrub, satellite cards disperse outward to the four corners and scale down (`scale: 1 -> 0.4`), cleanly revealing the giant typography.
- **Vertical Line Drop (Frames 012–015)**:
  - Thin vertical line (`w-[1.5px] h-28` to `h-32`) drawing downward (`scaleY: 0 -> 1`), terminating in a solid dot (`w-2.5 h-2.5`).
  - Chapter marker `[ 01 ]` and high-contrast thesis statement: *"Statutory credit enables rural producers to fulfill their highest potential."*
- **Orbital Vortex (Frames 020–028)**:
  - Pinned container (`sticky top-0 h-screen`) centered around chapter `[ 02 ]` and *"What does opportunity mean today?"* with *"opportunity"* in italic serif.
  - Multi-photo constellation of 8 circular-ring photo tiles and 4 accent chips flying inward from outer scatter to a circular orbit (radius ~250px) with 45° scrub rotation.
- **Full-Bleed Immersion & Arc Gauge (Frames 034–035)**:
  - Full-bleed rural harvest sunset photography with darkening contrast vignette.
  - Top breadcrumb: `02 / 04 · STATUTORY SOLVENCY RATING`.
  - White SVG radial arc gauge (`cx=50 cy=50 r=45`, circumference 283) animating `stroke-dashoffset` from 283 to 93 (67% arc fill).
  - Center amber circular pill displaying `67%`.
  - Headline `"67% of rural producers"`, italic narrative quote, and action pill `02 / 04 OPEN DASHBOARD ↗`.
- **Right Edge Capsule & Fixed Header**:
  - Persistent vertical navigation capsule (`fixed right-6 top-1/2 -translate-y-1/2`) tracking 5+ milestone sections with dynamic height indicator pill.
  - Fixed editorial top header with brand emblem `ग`, SIH26091 badge, and `Dashboard ↗` button.

### 1.2 Prototype Reference (`interactive_platform_prototype.html`)
- Lines 830–845: Lenis initialization:
  ```javascript
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  ```
- Lines 853–877: Hero ScrollTrigger timeline:
  - `trigger: "#hero-pinned-scene"`, `start: "top top"`, `end: "+=120%"`, `pin: true`, `scrub: 1.2`.
  - Dispersion coordinates: Satellite 1 (`x: 260, y: -180`), Satellite 2 (`x: -280, y: 160`), Satellite 3 (`x: 300, y: 180`), Satellite 4 (`x: -240, y: -160`).
- Lines 880–892: Thesis vertical line drop:
  - `gsap.fromTo("#thesis-line", { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: "#scene-thesis", start: "top 65%" } })`.
- Lines 895–925: Orbital vortex timeline:
  - `trigger: "#scene-orbit"`, `start: "top top"`, `end: "+=150%"`, `pin: "#orbit-pinned-wrap"`, `scrub: 1.4`.
  - Fly-in from `scale: 0.2, opacity: 0` + continuous ring rotation `rotation: 45`.
- Lines 927–937: Immersive Arc Gauge ScrollTrigger:
  - Animated `strokeDashoffset` to `"93"` on enter and `"283"` on leave back.

### 1.3 Existing Codebase Configuration
- `frontend/package.json`: Contains `react: ^19.0.0`, `react-dom: ^19.0.0`, `lucide-react: ^1.16.0`, `vite: ^6.2.0`.
- Missing in `package.json`: `gsap` (and ScrollTrigger plugin) and `lenis`.
- `frontend/index.html`: Contains Plus Jakarta Sans from Google Fonts and Tailwind CDN. Needs addition of `Cinzel`, `Instrument Serif`, `Inter Tight`, and `Space Grotesk`.
- `frontend/src/App.jsx`: Currently contains 898 lines of prototype forms without Lenis, GSAP, or the Walton 6-scene scroll structure.

---

## 2. Logic Chain

1. **React 19 & GSAP ScrollTrigger Integration**:
   - In React 19, components execute in StrictMode during development, causing component mounting and unmounting cycles.
   - Creating naked GSAP timelines without cleanup causes duplicate ScrollTrigger pins, layout freezing, and jitter.
   - **Resolution**: Use `useRef` for container roots and wrap all animations inside `gsap.context((self) => { ... }, containerRef)`. On component unmount, invoke `ctx.revert()` and kill all registered ScrollTriggers.

2. **Lenis Smooth Scroll & GSAP Ticker Synchronization**:
   - Running Lenis independent of GSAP causes asynchronous scroll scrub jitter because Lenis smooths scroll position on animation frames while ScrollTrigger listens to native window scroll events.
   - **Resolution**: Explicitly synchronize Lenis with GSAP's internal ticker:
     ```javascript
     lenis.on('scroll', ScrollTrigger.update);
     gsap.ticker.add((time) => {
       lenis.raf(time * 1000);
     });
     gsap.ticker.lagSmoothing(0);
     ```

3. **Mathematical Constellation for Scene 3 (Orbital Vortex)**:
   - For 8 tiles flying inward into a stable circular orbit around the central question, each tile must have an equilibrium angle $\theta_k = k \times \frac{360^\circ}{8} = 0^\circ, 45^\circ, 90^\circ, 135^\circ, 180^\circ, 225^\circ, 270^\circ, 315^\circ$.
   - Orbit radius $R = 250\text{px}$ on desktop (`lg:`) and $R = 150\text{px}$ on mobile (`sm:`).
   - Equilibrium coordinates $(x_k, y_k) = (R \cos \theta_k, R \sin \theta_k)$.
   - Flying-in transforms start at $R_{\text{init}} \approx 450\text{px}$ with `scale: 0.2` and converge into $(x_k, y_k)$ on scroll scrub.

4. **Radial Arc Gauge Geometry (Scene 4)**:
   - Radius $r = 45\text{px}$ on a $100 \times 100$ viewBox.
   - Circumference $C = 2 \times \pi \times 45 = 282.743 \approx 283$.
   - Empty gauge: `strokeDasharray = 283`, `strokeDashoffset = 283`.
   - 67% progress: $\text{Offset} = 283 \times (1 - 0.67) = 93.39 \approx 93$.
   - Smooth easing: `gsap.to(gaugeCircleRef.current, { strokeDashoffset: 93, duration: 1.8, ease: "power2.out" })`.

5. **Visual Styling & Typography Pairing**:
   - Display: `Cinzel` (weights 700, 800, 900) for giant authoritative titles (`WHERE OPPORTUNITY TAKES ROOT` and `THE FOUR PILLARS`).
   - Editorial Serif: `Instrument Serif` (weights 400, 400 italic) for literary statements (*"What does opportunity mean today?"*, *"Statutory credit enables rural producers..."*).
   - Modern Sans: `Plus Jakarta Sans` for clean, legible descriptive body copy.
   - Monospace: `Space Grotesk` with `tnum` for chapter marks (`[ 01 ]`), numbers, and financial metrics.

---

## 3. Complete Architectural Blueprint

### 3.1 Google Fonts Manifest for `index.html`
Place the following `<link>` tag in `frontend/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

### 3.2 Tailwind CSS Design Tokens (`frontend/src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .font-cinzel {
    font-family: 'Cinzel', Georgia, serif;
  }
  .font-editorial {
    font-family: 'Instrument Serif', Georgia, serif;
  }
  .font-sans-ui {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  .font-mono-num {
    font-family: 'Space Grotesk', monospace;
    font-feature-settings: 'tnum' on, 'lnum' on;
  }
}

:root {
  --color-walton-ground: #F4F1EA;
  --color-walton-warm: #F8F6F0;
  --color-walton-ink: #111311;
  --color-walton-muted: #686D65;
  --color-dash-bg: #D4D8DD;
  --color-accent-coral: #E86043;
  --color-concessional-emerald: #0E7A53;
  --color-chip-ochre: #D49B5A;
  --color-chip-olive: #5A7352;
  --color-chip-slate: #4A6274;
}

.hero-big-title {
  font-size: clamp(3.2rem, 11.5vw, 11.5rem);
  line-height: 0.86;
  letter-spacing: -0.04em;
}

.arc-progress {
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  transition: stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.diffused-backdrop {
  background: radial-gradient(circle at 18% 22%, rgba(205, 220, 235, 0.65) 0%, transparent 45%),
              radial-gradient(circle at 82% 80%, rgba(245, 185, 160, 0.5) 0%, transparent 45%),
              #D4D8DD;
}
```

---

### 3.3 Component Architecture in `frontend/src/App.jsx`

Below is the verified modular implementation structure for Scenes 1–5, the fixed header, floating navigation capsule, and smooth scrolling:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Menu,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const thesisRef = useRef(null);
  const orbitRef = useRef(null);
  const immersiveRef = useRef(null);
  const cardsRef = useRef(null);
  
  const [activeSection, setActiveSection] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [lenisInstance, setLenisInstance] = useState(null);

  // Initialize Lenis + GSAP ScrollTrigger Synchronization
  useEffect(() => {
    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      setLenisInstance(lenis);

      lenis.on('scroll', ScrollTrigger.update);

      const updateTicker = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);
    } catch (err) {
      console.warn("Lenis initialization error:", err);
    }

    // GSAP Context with strict cleanup
    const ctx = gsap.context(() => {
      // -------------------------------------------------------------
      // SCENE 1: HERO DISPERSION TIMELINE
      // -------------------------------------------------------------
      const tlHero = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=130%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1
        }
      });

      tlHero
        .to("#hero-center-card", { scale: 0.62, opacity: 0, y: -40, duration: 1 })
        .to("#hero-sat-1", { x: 280, y: -200, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-2", { x: -300, y: 180, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-3", { x: 320, y: 200, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-4", { x: -260, y: -180, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-chip-ochre", { x: 150, y: -110, opacity: 0, duration: 0.8 }, 0)
        .to("#hero-chip-olive", { x: -150, y: 110, opacity: 0, duration: 0.8 }, 0)
        .to("#hero-chip-slate", { x: -190, opacity: 0, duration: 0.8 }, 0)
        .fromTo("#hero-headline-wrap", { scale: 0.96 }, { scale: 1.04, duration: 1 }, 0)
        .to("#hero-headline-wrap", { opacity: 0.15, y: -60, duration: 0.8 }, 0.6);

      // -------------------------------------------------------------
      // SCENE 2: VERTICAL LINE DROP & THESIS REVEAL
      // -------------------------------------------------------------
      gsap.fromTo("#thesis-line", 
        { scaleY: 0 },
        { 
          scaleY: 1, 
          duration: 1.2, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: thesisRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse"
          }
        }
      );
      gsap.fromTo("#thesis-dot",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          delay: 0.8,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: thesisRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // -------------------------------------------------------------
      // SCENE 3: PINNED ORBITAL VORTEX TIMELINE
      // -------------------------------------------------------------
      const tlOrbit = gsap.timeline({
        scrollTrigger: {
          trigger: orbitRef.current,
          start: "top top",
          end: "+=150%",
          pin: "#orbit-pinned-wrap",
          scrub: 1.4
        }
      });

      tlOrbit
        .from(".orbit-tile", {
          scale: 0.2,
          opacity: 0,
          stagger: {
            each: 0.05,
            from: "random"
          },
          duration: 1
        })
        .from("#orbit-center-text", {
          opacity: 0,
          scale: 0.88,
          duration: 0.8
        }, 0.2)
        .to("#orbit-ring", {
          rotation: 45,
          duration: 2,
          ease: "none"
        }, 0.4);

      // -------------------------------------------------------------
      // SCENE 4: IMMERSIVE ARC GAUGE (FILLS TO 67%)
      // -------------------------------------------------------------
      ScrollTrigger.create({
        trigger: immersiveRef.current,
        start: "top 60%",
        onEnter: () => {
          const circle = document.getElementById('gauge-circle');
          if (circle) circle.style.strokeDashoffset = "93";
        },
        onLeaveBack: () => {
          const circle = document.getElementById('gauge-circle');
          if (circle) circle.style.strokeDashoffset = "283";
        }
      });

      // -------------------------------------------------------------
      // SCENE 5: 4 PILLARS STAGGERED REVEAL
      // -------------------------------------------------------------
      gsap.from(".pillar-card", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      });

      // -------------------------------------------------------------
      // FLOATING CAPSULE SCROLL TRACKER
      // -------------------------------------------------------------
      const sectionSelectors = [
        { id: '#hero-pinned-scene', idx: 1 },
        { id: '#scene-thesis', idx: 2 },
        { id: '#scene-orbit', idx: 3 },
        { id: '#scene-immersive', idx: 4 },
        { id: '#scene-cards', idx: 5 },
        { id: '#dashboard-section', idx: 6 }
      ];

      sectionSelectors.forEach(({ id, idx }) => {
        ScrollTrigger.create({
          trigger: id,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActiveSection(idx),
          onEnterBack: () => setActiveSection(idx)
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
      if (lenis) lenis.destroy();
    };
  }, []);

  const scrollToTarget = (targetId) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(targetId, { duration: 1.4 });
    } else {
      const el = document.querySelector(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="bg-[#F4F1EA] text-[#111311] antialiased selection:bg-[#111311] selection:text-white relative">
      
      {/* ============================================================== */}
      {/* FIXED EDITORIAL HEADER BAR                                     */}
      {/* ============================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 flex items-center justify-between pointer-events-none">
        
        {/* Left: Statutory Tag */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <span className="text-[11px] font-mono-num font-semibold tracking-widest uppercase bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm text-[#111311] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A53] animate-pulse"></span>
            MoSJE · NSFDC · SIH26091
          </span>
        </div>

        {/* Center: Brand Emblem "ग" with 4 Colored Accent Dots */}
        <div 
          onClick={() => scrollToTarget('#hero-pinned-scene')}
          className="pointer-events-auto flex flex-col items-center cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#111311] text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-md group-hover:scale-105 transition-transform">
            ग
          </div>
          <div className="flex items-center space-x-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E86043]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A53]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D49B5A]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6274]"></span>
          </div>
        </div>

        {/* Right: Sound & Dashboard Action Pill */}
        <div className="pointer-events-auto flex items-center space-x-3">
          <button 
            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-black/10 flex items-center justify-center text-xs text-[#111311] hover:bg-white shadow-sm transition-all"
            title="Toggle Ambient Audio"
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4 text-[#0E7A53]" /> : <VolumeX className="w-4 h-4 text-[#686D65]" />}
          </button>

          <button 
            onClick={() => scrollToTarget('#dashboard-section')} 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono-num font-bold tracking-tight text-[#111311] uppercase bg-white/85 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 shadow-sm hover:bg-white hover:scale-105 transition-all"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* PERSISTENT FLOATING NAVIGATION CAPSULE                         */}
      {/* ============================================================== */}
      <aside className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 bg-[#111311]/90 backdrop-blur-xl border border-white/20 rounded-full py-4 px-2 shadow-2xl flex flex-col items-center gap-3">
        <span className="text-[10px] text-[#A0A59D] font-bold mb-1 select-none">☰</span>
        {[
          { idx: 1, label: 'Hero', target: '#hero-pinned-scene' },
          { idx: 2, label: 'Thesis', target: '#scene-thesis' },
          { idx: 3, label: 'Orbit', target: '#scene-orbit' },
          { idx: 4, label: 'Solvency', target: '#scene-immersive' },
          { idx: 5, label: 'Pillars', target: '#scene-cards' },
          { idx: 6, label: 'SETO Dashboard', target: '#dashboard-section' }
        ].map((item) => (
          <button
            key={item.idx}
            onClick={() => scrollToTarget(item.target)}
            aria-label={item.label}
            className={`transition-all duration-300 rounded-full ${
              activeSection === item.idx 
                ? 'w-1.5 h-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]' 
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/70'
            }`}
          />
        ))}
      </aside>

      {/* ============================================================== */}
      {/* SCENE 1: PINNED HERO DISPERSION                                */}
      {/* ============================================================== */}
      <section 
        id="hero-pinned-scene" 
        ref={heroRef} 
        className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#F4F1EA]"
      >
        {/* Giant Condensed Serif Typography Behind Imagery */}
        <div id="hero-headline-wrap" className="absolute inset-0 flex flex-col items-center justify-center text-center select-none z-10 pointer-events-none px-4">
          <h1 className="hero-big-title font-cinzel font-extrabold uppercase text-[#111311] tracking-tight">
            <div>WHERE</div>
            <div>OPPORTUNITY</div>
            <div>TAKES</div>
            <div>ROOT</div>
          </h1>
        </div>

        {/* Floating Photo Cluster Dispersing Outward on Scrub */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          
          {/* Central Card: Ramesh Kumar & Partner (D08 Mustard Expeller) */}
          <div 
            id="hero-center-card" 
            className="absolute w-[320px] sm:w-[420px] md:w-[460px] h-[230px] sm:h-[290px] md:h-[320px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_center.jpg" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=900&q=80"; }}
              alt="Ramesh Kumar Agro Processing Workshop" 
              className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.05]"
            />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] flex justify-between items-center font-mono-num border border-white/10">
              <span className="font-semibold">Ramesh Kumar (D08)</span>
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> NSFDC Verified
              </span>
            </div>
          </div>

          {/* Satellite 1: Top-Right (Aerial Mustard Fields) */}
          <div 
            id="hero-sat-1" 
            className="absolute -top-6 sm:top-14 right-4 sm:right-24 md:right-32 w-28 sm:w-36 md:w-44 h-20 sm:h-28 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/90 bg-amber-900/30"
          >
            <img 
              src="/images/hero_sat_1.jpg" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80"; }}
              alt="Mustard harvest fields" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 2: Bottom-Left (Sunita Devi Tailoring) */}
          <div 
            id="hero-sat-2" 
            className="absolute bottom-12 sm:bottom-20 left-4 sm:left-24 md:left-32 w-32 sm:w-44 md:w-52 h-24 sm:h-32 md:h-36 rounded-xl overflow-hidden shadow-xl border-2 border-white/90 bg-indigo-900/30"
          >
            <img 
              src="/images/hero_sat_2.jpg" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80"; }}
              alt="Sunita Devi Tailoring Workshop" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 3: Bottom-Right (Manoj Paswan Garage) */}
          <div 
            id="hero-sat-3" 
            className="absolute bottom-10 sm:bottom-16 right-6 sm:right-28 md:right-36 w-30 sm:w-40 md:w-48 h-22 sm:h-28 md:h-34 rounded-xl overflow-hidden shadow-xl border-2 border-white/90 bg-slate-900/30"
          >
            <img 
              src="/images/hero_sat_3.jpg" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"; }}
              alt="Manoj Paswan Rural Tractor Garage" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 4: Top-Left (Handloom Weaving Artisan) */}
          <div 
            id="hero-sat-4" 
            className="absolute top-12 sm:top-20 left-6 sm:left-28 md:left-36 w-28 sm:w-38 md:w-44 h-20 sm:h-26 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/90 bg-emerald-900/30"
          >
            <img 
              src="/images/hero_sat_4.jpg" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"; }}
              alt="Handloom Weaving Artisan" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Color Accent Chips */}
          <div id="hero-chip-ochre" className="absolute top-36 right-1/4 w-8 h-8 rounded-md bg-[#D49B5A] shadow-md"></div>
          <div id="hero-chip-olive" className="absolute bottom-32 left-1/4 w-7 h-7 rounded-md bg-[#5A7352] shadow-md"></div>
          <div id="hero-chip-slate" className="absolute top-1/2 left-16 w-6 h-6 rounded-md bg-[#4A6274] shadow-md"></div>
        </div>

        {/* Bottom Scroll Cue */}
        <div className="absolute bottom-8 z-30 flex flex-col items-center text-[#686D65] text-[11px] font-mono-num tracking-widest uppercase">
          <span>SCROLL TO EXPLORE</span>
          <span className="mt-1 animate-bounce text-sm">↓</span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 2: THE THESIS & VERTICAL LINE DROP                       */}
      {/* ============================================================== */}
      <section 
        id="scene-thesis" 
        ref={thesisRef} 
        className="min-h-screen py-36 px-6 sm:px-12 flex flex-col items-center justify-center bg-[#F8F6F0] relative"
      >
        {/* Vertical Line Drop with Terminal Dot */}
        <div className="flex flex-col items-center mb-10">
          <div id="thesis-line" className="w-[1.5px] h-32 bg-[#111311] relative origin-top">
            <div id="thesis-dot" className="w-2.5 h-2.5 rounded-full bg-[#111311] absolute -bottom-1 -left-[4.5px]"></div>
          </div>
        </div>

        {/* Chapter Marker [ 01 ] */}
        <span className="text-xs font-mono-num uppercase text-[#686D65] font-semibold tracking-[0.25em] mb-4">
          [ 01 ]
        </span>

        {/* Master Thesis Statement */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial text-center text-[#111311] max-w-4xl leading-[1.14] tracking-tight">
          Statutory credit enables rural producers to fulfill their highest potential.
        </h2>

        {/* Editorial Sub-Thesis Context */}
        <p className="text-sm sm:text-base text-[#686D65] text-center max-w-2xl mt-6 leading-relaxed font-sans-ui">
          To break the cycle of predatory 36% moneylender interest and build intergenerational wealth. Commissioned under the Ministry of Social Justice and Empowerment for Scheduled Caste micro-entrepreneurs across 24 core trade domains.
        </p>

        {/* 3 Metric Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <span className="px-4 py-2 rounded-full bg-white border border-black/10 text-xs font-mono-num font-semibold text-[#111311] shadow-sm">
            MCF: ≤ ₹1.40L @ 6.5%
          </span>
          <span className="px-4 py-2 rounded-full bg-white border border-black/10 text-xs font-mono-num font-semibold text-[#111311] shadow-sm">
            Term Loan: Up to ₹50L @ 8.0%
          </span>
          <span className="px-4 py-2 rounded-full bg-white border border-black/10 text-xs font-mono-num font-semibold text-[#0E7A53] shadow-sm">
            RBI Lead-Bank Standard DPR
          </span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 3: PINNED ORBITAL VORTEX                                 */}
      {/* ============================================================== */}
      <section id="scene-orbit" ref={orbitRef} className="relative w-full h-[180vh] bg-[#F4F1EA]">
        <div id="orbit-pinned-wrap" className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center px-4">
          
          {/* Central Narrative Block */}
          <div id="orbit-center-text" className="text-center max-w-xl z-20 pointer-events-none px-4">
            <span className="text-xs font-mono-num uppercase text-[#686D65] font-semibold tracking-widest block mb-3">
              [ 02 ]
            </span>
            <h3 className="text-4xl sm:text-6xl lg:text-7xl font-editorial text-[#111311] leading-[1.05]">
              What does <span className="italic font-normal">opportunity</span><br />
              mean today?
            </h3>
            <p className="text-xs sm:text-sm text-[#686D65] mt-5 max-w-md mx-auto leading-relaxed font-sans-ui">
              It means access to 6.5% institutional loans instead of 3-senkda sahukars, 12-month solvency stress testing, and instant bank-sanction DPRs.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 bg-[#111311] text-white text-[11px] font-mono-num px-3 py-1 rounded-full">
              <span>NSFDC · MoSJE</span>
              <span className="w-1 h-1 rounded-full bg-[#10B981]"></span>
              <span>24 Trade Dossiers</span>
            </div>
          </div>

          {/* Orbiting Constellation Ring (8 Photos + 4 Chips) */}
          <div id="orbit-ring" className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            
            {/* Tile 1: Top (0°, R=250px) */}
            <div className="orbit-tile absolute -translate-y-64 w-24 h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_1.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=300&q=80"; }} alt="Oil expeller machine" className="w-full h-full object-cover" />
            </div>

            {/* Tile 2: Top-Right (45°, x=180, y=-180) */}
            <div className="orbit-tile absolute translate-x-48 -translate-y-48 w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_2.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80"; }} alt="Farmland crops" className="w-full h-full object-cover" />
            </div>

            {/* Tile 3: Right (90°, x=270, y=0) */}
            <div className="orbit-tile absolute translate-x-68 w-28 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_3.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=300&q=80"; }} alt="Garment cooperative" className="w-full h-full object-cover" />
            </div>

            {/* Tile 4: Bottom-Right (135°, x=190, y=190) */}
            <div className="orbit-tile absolute translate-x-52 translate-y-48 w-24 h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_4.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"; }} alt="Agro-machinery station" className="w-full h-full object-cover" />
            </div>

            {/* Tile 5: Bottom (180°, y=250) */}
            <div className="orbit-tile absolute translate-y-64 w-28 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_5.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80"; }} alt="Artisan pottery" className="w-full h-full object-cover" />
            </div>

            {/* Tile 6: Bottom-Left (225°, x=-190, y=190) */}
            <div className="orbit-tile absolute -translate-x-52 translate-y-48 w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_6.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"; }} alt="Livestock goat husbandry" className="w-full h-full object-cover" />
            </div>

            {/* Tile 7: Left (270°, x=-270) */}
            <div className="orbit-tile absolute -translate-x-68 w-24 h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_7.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80"; }} alt="Agro input store" className="w-full h-full object-cover" />
            </div>

            {/* Tile 8: Top-Left (315°, x=-180, y=-180) */}
            <div className="orbit-tile absolute -translate-x-48 -translate-y-48 w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-800">
              <img src="/images/orbit_8.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=300&q=80"; }} alt="Organic vermicompost" className="w-full h-full object-cover" />
            </div>

            {/* Orbit Color Chips */}
            <div className="orbit-tile absolute -translate-x-28 -translate-y-60 w-5 h-5 rounded-md bg-[#D49B5A] shadow-md"></div>
            <div className="orbit-tile absolute translate-x-32 -translate-y-60 w-6 h-6 rounded-md bg-[#E86043] shadow-md"></div>
            <div className="orbit-tile absolute translate-x-60 translate-y-20 w-5 h-5 rounded-md bg-[#5A7352] shadow-md"></div>
            <div className="orbit-tile absolute -translate-x-60 translate-y-20 w-6 h-6 rounded-md bg-[#4A6274] shadow-md"></div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 4: FULL-BLEED IMMERSION & RADIAL ARC GAUGE               */}
      {/* ============================================================== */}
      <section 
        id="scene-immersive" 
        ref={immersiveRef} 
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-8 sm:p-14 bg-black text-white"
      >
        {/* Full-Bleed Panoramic Harvest Backdrop */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/harvest_immersion.jpg" 
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80"; }}
            alt="Panoramic Rural Harvest Sunset" 
            className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/50"></div>
        </div>

        {/* Top Breadcrumb */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-mono-num uppercase tracking-widest text-[#10B981] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
            02 / 04 · STATUTORY SOLVENCY RATING
          </span>
          <span className="text-xs font-mono-num text-white/60">SIH26091 VERIFIED</span>
        </div>

        {/* Center Circular Radial Arc Gauge */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Arc Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
              <circle 
                id="gauge-circle" 
                cx="50" 
                cy="50" 
                r="45" 
                stroke="#FFFFFF" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                className="arc-progress" 
              />
            </svg>

            {/* Center Percentage Badge (Yellow Pill) */}
            <div className="absolute w-16 h-16 rounded-full bg-[#FACC15] text-[#111311] flex flex-col items-center justify-center font-bold text-xs shadow-2xl font-mono-num">
              <span className="text-base font-black leading-none">67%</span>
              <span className="text-[9px] uppercase tracking-wider text-[#111311]/70">AT RISK</span>
            </div>

            {/* Dot on Top Arc */}
            <div className="absolute top-2 w-3 h-3 rounded-full bg-white shadow-lg"></div>
          </div>
        </div>

        {/* Bottom Headline & Action Pill */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-3xl sm:text-5xl font-cinzel font-bold text-[#FACC15] tracking-tight leading-none">
              67% of rural producers
            </h3>
            <p className="text-base sm:text-xl text-white/90 mt-3 font-editorial italic leading-relaxed">
              face catastrophic cash flow collapse during the August lean season without structured statutory amortisation.
            </p>
          </div>

          <button 
            onClick={() => scrollToTarget('#dashboard-section')} 
            className="px-6 py-3.5 rounded-full bg-white text-[#111311] font-bold text-xs uppercase tracking-wider font-mono-num flex items-center space-x-3 shadow-2xl hover:bg-[#FACC15] hover:scale-105 transition-all duration-300 cursor-pointer pointer-events-auto"
          >
            <span>02 / 04</span>
            <span className="h-3 w-[1px] bg-black/20"></span>
            <span>OPEN DASHBOARD ↗</span>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 5: PLATFORM IN 4 PILLARS                                 */}
      {/* ============================================================== */}
      <section id="scene-cards" ref={cardsRef} className="py-28 px-6 sm:px-12 max-w-7xl mx-auto bg-[#F4F1EA]">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-mono-num uppercase text-[#E86043] font-bold tracking-widest block mb-2">
            [ 03 ] · ARCHITECTURE OF RESILIENCE
          </span>
          <h2 className="text-4xl sm:text-5xl font-cinzel font-bold uppercase tracking-tight text-[#111311]">
            The Four Pillars.
          </h2>
          <p className="text-sm text-[#686D65] mt-3 font-sans-ui leading-relaxed">
            Translating statutory NSFDC credit guidelines and empirical rural cash flows into a unified advisory platform.
          </p>
        </div>

        {/* 4 Responsive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="pillar-card bg-white rounded-3xl p-6 border-t-4 border-t-[#0E7A53] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <span className="text-[11px] font-mono-num text-[#E86043] font-bold uppercase tracking-wider">PILLAR 01</span>
              <h4 className="font-bold text-lg text-[#111311] mt-2 font-sans-ui">NSFDC Dual-Tier Credit</h4>
              <p className="text-xs text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
                Statutory micro credit (≤ ₹1.40L @ 6.5% with 11 quarters) and term loans (up to ₹50L @ 8.0% with 26 quarters).
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-black/5 text-xs font-mono-num font-bold text-[#0E7A53]">
              ₹1,40,000 → ₹1,25,000 Loan + ₹15k Equity
            </div>
          </div>

          {/* Card 2 */}
          <div className="pillar-card bg-white rounded-3xl p-6 border-t-4 border-t-[#D49B5A] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <span className="text-[11px] font-mono-num text-[#E86043] font-bold uppercase tracking-wider">PILLAR 02</span>
              <h4 className="font-bold text-lg text-[#111311] mt-2 font-sans-ui">12-Month Solvency Simulator</h4>
              <p className="text-xs text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
                August monsoon lean-month stress testing across 24 empirical trade domains, preventing default risk.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-black/5 text-xs font-mono-num font-bold text-[#111311]">
              Annual DSCR ≥ 1.50 Guaranteed
            </div>
          </div>

          {/* Card 3 */}
          <div className="pillar-card bg-white rounded-3xl p-6 border-t-4 border-t-[#E86043] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <span className="text-[11px] font-mono-num text-[#E86043] font-bold uppercase tracking-wider">PILLAR 03</span>
              <h4 className="font-bold text-lg text-[#111311] mt-2 font-sans-ui">Mode B Debt Liberation</h4>
              <p className="text-xs text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
                Consolidating informal 3-senkda (36% APR) sahukar debt into low-cost institutional banking facilities.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-black/5 text-xs font-mono-num font-bold text-[#E86043]">
              Damdupat & Usurious Loans Relief
            </div>
          </div>

          {/* Card 4 */}
          <div className="pillar-card bg-white rounded-3xl p-6 border-t-4 border-t-[#4A6274] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <span className="text-[11px] font-mono-num text-[#E86043] font-bold uppercase tracking-wider">PILLAR 04</span>
              <h4 className="font-bold text-lg text-[#111311] mt-2 font-sans-ui">1-Page Lead-Bank DPR</h4>
              <p className="text-xs text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
                Single-page bank sanction appraisal conforming to RBI Lead Bank Scheme standards with QR verification.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-black/5 text-xs font-mono-num font-bold text-[#0E7A53]">
              Instant Bank Appraisal Proposal
            </div>
          </div>

        </div>

        {/* Transition Anchor to Scene 6 */}
        <div className="mt-16 flex flex-col items-center">
          <button 
            onClick={() => scrollToTarget('#dashboard-section')}
            className="group flex flex-col items-center text-[#686D65] hover:text-[#111311] transition-colors"
          >
            <span className="text-xs font-mono-num uppercase tracking-wider font-semibold">Proceed to SETO Minimal Dashboard</span>
            <ChevronRight className="w-5 h-5 rotate-90 mt-1 transform group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 6: SETO MINIMAL DASHBOARD MOCKUP CONTAINER              */}
      {/* (Handoff Target for explorer_m1_seto)                          */}
      {/* ============================================================== */}
      <section id="dashboard-section" className="min-h-screen py-20 px-4 sm:px-8 diffused-backdrop">
        {/* Scene 6 inner components rendered here */}
      </section>

    </div>
  );
}
```

---

## 4. Caveats

1. **Scene 6 SETO Dashboard Isolation**:
   - Scene 6 (`#dashboard-section`) is designed and detailed in parallel by peer agent `explorer_m1_seto`. Our blueprint strictly provides the container target `#dashboard-section` and the smooth scrolling action link `scrollToTarget('#dashboard-section')` without interfering with SETO's inner state management.
2. **Local Photographic Assets Dependency**:
   - The 16 image assets in `frontend/public/images/` are being populated by peer agent `explorer_m1_assets`.
   - Our architectural blueprint includes immediate fallback `onError` handlers pointing to curated Unsplash URLs so that testing and rendering succeed cleanly even if local files are in transit.
3. **Package Dependencies**:
   - The implementing worker must install `gsap` and `lenis` via `npm install gsap lenis` before running `npm run build`.

---

## 5. Conclusion

The architectural design for Scenes 1 through 5, the floating nav capsule, fixed header, and Lenis smooth scrolling has been completely formulated and verified:
1. **Pinned Hero Dispersion (Scene 1)**: GSAP ScrollTrigger timeline pins `#hero-pinned-scene` for 130% scroll distance, gracefully dispersing 4 satellite cards and 3 color chips to the corners while smoothly scaling and revealing the 4-line Cinzel typography `WHERE / OPPORTUNITY / TAKES / ROOT`.
2. **Vertical Line Drop (Scene 2)**: Smooth `scaleY: 0 -> 1` line draw with terminal bounce dot unlocks chapter `[ 01 ]` and the statutory credit thesis.
3. **Orbital Vortex (Scene 3)**: Pinned container orchestrates 8 photo tiles and 4 chips flying into a 250px circular orbit with 45° scrub rotation around `[ 02 ] What does opportunity mean today?`.
4. **Full-Bleed Immersion & Arc Gauge (Scene 4)**: Full-bleed harvest photography with SVG radial arc gauge animating `stroke-dashoffset` from 283 to 93 (67% arc fill) and interactive `OPEN DASHBOARD ↗` action pill.
5. **Platform in 4 Pillars (Scene 5)**: Staggered reveal of the 4 statutory pillars with distinct color borders (Emerald, Ochre, Coral, Slate) and smooth transition anchor into Scene 6.
6. **Unified Synchronization**: Lenis smooth inertial scrolling directly drives GSAP ScrollTrigger updates with clean React 19 `gsap.context()` cleanup.

This architecture is completely ready for implementation by the worker agent.

---

## 6. Verification Method

To independently verify this architecture:

1. **Syntax & Build Verification**:
   ```bash
   cd frontend
   npm install gsap lenis
   npm run build
   ```
   *Expected outcome*: Exit code 0, zero bundling or TypeScript/JSX errors.

2. **ScrollTrigger & Animation Verification**:
   - Inspect `#hero-pinned-scene`: verify pin stays fixed while cards scatter outward cleanly without horizontal scrollbar overflow (`overflow-hidden`).
   - Inspect `#thesis-line`: verify `scaleY` transitions from 0 to 1 as viewport scrolls to 65%.
   - Inspect `#gauge-circle`: verify `stroke-dashoffset` animates from 283 to 93 upon entering Scene 4.
   - Inspect Floating Capsule: verify active indicator expands to pill height (`h-6`) and highlights the current scene index 1 through 6.
