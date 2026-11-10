import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight
} from 'lucide-react';
import SetoDashboard from './components/SetoDashboard';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const thesisRef = useRef(null);
  const orbitRef = useRef(null);
  const immersiveRef = useRef(null);
  const cardsRef = useRef(null);
  
  const [activeSection, setActiveSection] = useState(1);
  const [lenisInstance, setLenisInstance] = useState(null);

  // Initialize Lenis Smooth Scroll + GSAP ScrollTrigger Synchronization
  useEffect(() => {
    let lenis;
    let updateTicker;
    let rafId;
    let refreshTimer;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
      });

      setLenisInstance(lenis);

      lenis.on('scroll', ScrollTrigger.update);

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Refresh ScrollTrigger after DOM & images settle
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    } catch (err) {
      console.warn("Lenis initialization error:", err);
    }

    // GSAP Context with strict cleanup
    const ctx = gsap.context(() => {
      // Pin center card exactly in center before animating
      gsap.set("#hero-center-card", { left: "50%", top: "50%", xPercent: -50, yPercent: -50 });

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
        .to("#hero-sat-1", { x: 260, y: -180, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-2", { x: -280, y: 160, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-3", { x: 300, y: 180, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-4", { x: -240, y: -160, scale: 0.35, opacity: 0, duration: 1 }, 0)
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
          scrub: 1.0
        }
      });

      tlOrbit
        .from(".orbit-tile", {
          scale: 0.3,
          opacity: 0,
          stagger: 0.04,
          duration: 0.8,
          ease: "power2.out"
        })
        .from("#orbit-center-text", {
          opacity: 0,
          scale: 0.92,
          duration: 0.8
        }, 0.15)
        .to("#orbit-ring", {
          rotation: 60,
          duration: 2,
          ease: "none"
        }, 0.3)
        .to(".orbit-tile-inner", {
          rotation: -60,
          duration: 2,
          ease: "none"
        }, 0.3);

      // -------------------------------------------------------------
      // SCENE 4: IMMERSIVE ARC GAUGE (FILLS TO 67%)
      // -------------------------------------------------------------
      gsap.fromTo('#gauge-circle',
        { strokeDashoffset: 283 },
        {
          strokeDashoffset: 93,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: immersiveRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // -------------------------------------------------------------
      // SCENE 5: 4 PILLARS STAGGERED REVEAL (Always visible, subtle entrance)
      // -------------------------------------------------------------
      gsap.from(".pillar-card", {
        y: 30,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // -------------------------------------------------------------
      // FLOATING CAPSULE SCROLL TRACKER (SCENES 1 TO 6)
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

    }, containerRef.current);

    return () => {
      if (updateTicker) {
        gsap.ticker.remove(updateTicker);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) lenis.destroy();
      setLenisInstance(null);
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
        
        {/* Left: Spacer to balance layout */}
        <div className="w-24 pointer-events-none"></div>

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

        {/* Right: Dashboard Action */}
        <div className="pointer-events-auto flex items-center justify-end w-24">
          <button 
            onClick={() => scrollToTarget('#dashboard-section')} 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono-num font-bold tracking-wider text-[#111311] uppercase hover:underline cursor-pointer"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MINIMAL FLOATING GUIDE INDICATOR                               */}
      {/* ============================================================== */}
      <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4 pointer-events-auto">
        {[
          { idx: 1, label: '01', target: '#hero-pinned-scene' },
          { idx: 2, label: '02', target: '#scene-thesis' },
          { idx: 3, label: '03', target: '#scene-orbit' },
          { idx: 4, label: '04', target: '#scene-immersive' },
          { idx: 5, label: '05', target: '#scene-cards' },
          { idx: 6, label: '06', target: '#dashboard-section' }
        ].map((item) => (
          <button
            key={item.idx}
            onClick={() => scrollToTarget(item.target)}
            aria-label={`Go to section ${item.label}`}
            className="group flex items-center cursor-pointer p-1"
          >
            <span className={`text-[10px] font-mono-num transition-all duration-300 ${
              activeSection === item.idx 
                ? 'text-[#111311] font-bold scale-125' 
                : 'text-[#686D65]/40 hover:text-[#111311]'
            }`}>
              {item.label}
            </span>
          </button>
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
          <h1 className="hero-big-title font-editorial font-normal uppercase text-[#111311]">
            <div>WHERE</div>
            <div>OPPORTUNITY</div>
            <div>TAKES</div>
            <div>ROOT</div>
          </h1>
        </div>

        {/* Floating Photo Cluster Dispersing Outward on Scrub */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          
          {/* Central Card: Rural Advisory in Action (Farmer + Extension Advisor with Tablet) */}
          <div 
            id="hero-center-card" 
            className="absolute w-[320px] sm:w-[420px] md:w-[480px] h-[220px] sm:h-[280px] md:h-[310px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_center.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/2.jpg"; }}
              alt="Rural producer receiving credit and enterprise advisory" 
              className="w-full h-full object-cover filter brightness-[0.96] contrast-[1.05]"
            />
          </div>

          {/* Satellite 1: Top-Right (Two Tractors Plowing at Sunrise) */}
          <div 
            id="hero-sat-1" 
            className="absolute -top-4 sm:top-14 right-4 sm:right-24 md:right-32 w-28 sm:w-36 md:w-44 h-20 sm:h-26 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_1.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/1.jpg"; }}
              alt="Agro-mechanization and farm harvesting" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 2: Bottom-Left (Rural Retail Kirana Store) */}
          <div 
            id="hero-sat-2" 
            className="absolute bottom-12 sm:bottom-20 left-4 sm:left-24 md:left-32 w-32 sm:w-44 md:w-52 h-22 sm:h-30 md:h-36 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_2.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/3.jpg"; }}
              alt="Rural retail and kirana enterprise" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 3: Bottom-Right (Commercial Dairy Producer) */}
          <div 
            id="hero-sat-3" 
            className="absolute bottom-10 sm:bottom-16 right-6 sm:right-28 md:right-36 w-30 sm:w-40 md:w-48 h-22 sm:h-28 md:h-34 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_3.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/8.jpg"; }}
              alt="Commercial dairy enterprise" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 4: Top-Left (Tailoring Enterprise with Daughter) */}
          <div 
            id="hero-sat-4" 
            className="absolute top-12 sm:top-20 left-6 sm:left-28 md:left-36 w-28 sm:w-38 md:w-44 h-20 sm:h-26 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_4.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/5.jpg"; }}
              alt="Village tailoring and apparel craftsmanship" 
              className="w-full h-full object-cover" 
            />
          </div>
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
        className="min-h-screen py-24 sm:py-32 px-6 sm:px-12 flex flex-col items-center justify-center bg-[#F8F6F0] relative"
      >
        {/* Proportioned Vertical Line Drop with Terminal Dot */}
        <div className="flex flex-col items-center mb-6">
          <div id="thesis-line" className="w-[1.5px] h-8 bg-[#111311] relative origin-top">
            <div id="thesis-dot" className="w-2 h-2 rounded-full bg-[#111311] absolute -bottom-1 -left-[3.25px]"></div>
          </div>
        </div>

        {/* Master Thesis Statement */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial text-center text-[#111311] max-w-4xl leading-[1.14] tracking-tight">
          Statutory credit enables rural producers to fulfill their highest potential.
        </h2>

        {/* Editorial Sub-Thesis Context */}
        <p className="text-sm sm:text-base text-[#686D65] text-center max-w-2xl mt-5 leading-relaxed font-sans-ui">
          To break the cycle of predatory 36% moneylender interest and build intergenerational wealth. Commissioned under the Ministry of Social Justice and Empowerment for Scheduled Caste micro-entrepreneurs across 24 core trade domains.
        </p>

        {/* Architectural 3-Column Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 max-w-4xl w-full text-center divide-y sm:divide-y-0 sm:divide-x divide-black/10">
          <div className="px-4 pt-4 sm:pt-0 flex flex-col items-center justify-center">
            <span className="block text-2xl sm:text-3xl font-editorial text-[#111311] whitespace-nowrap">≤ ₹1.40 Lakh</span>
            <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65] mt-1.5 block">MCF Concessional @ 6.5%</span>
          </div>
          <div className="px-4 pt-4 sm:pt-0 flex flex-col items-center justify-center">
            <span className="block text-2xl sm:text-3xl font-editorial text-[#111311] whitespace-nowrap">Up to ₹50 Lakh</span>
            <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65] mt-1.5 block">Term Loan Facility @ 8.0%</span>
          </div>
          <div className="px-4 pt-4 sm:pt-0 flex flex-col items-center justify-center">
            <span className="block text-2xl sm:text-3xl font-editorial text-[#111311] whitespace-nowrap">Lead-Bank Standard</span>
            <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65] mt-1.5 block">Statutory 1-Page DPR</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 3: PINNED ORBITAL VORTEX                                 */}
      {/* ============================================================== */}
      <section id="scene-orbit" ref={orbitRef} className="relative w-full h-[180vh] bg-[#F4F1EA]">
        <div id="orbit-pinned-wrap" className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center px-4">
          
          {/* Central Narrative Block (Tight Envelope Clear of Orbit Radius) */}
          <div id="orbit-center-text" className="text-center max-w-md z-20 pointer-events-none px-4">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-editorial text-[#111311] leading-[1.05]">
              What does <span className="italic font-normal">opportunity</span><br />
              mean today?
            </h3>
            <p className="text-xs sm:text-sm text-[#686D65] mt-4 max-w-sm mx-auto leading-relaxed font-sans-ui">
              It means access to 6.5% institutional loans instead of 3-senkda sahukars, 12-month solvency stress testing, and instant bank-sanction DPRs.
            </p>
          </div>

          {/* Symmetrical Orbiting Constellation Ring (8 Authentic Beneficiary Photos) */}
          <div id="orbit-ring" className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            {[
              { id: 1, angle: '0deg', x: '0', y: '-1', src: '/images/orbit_1.jpg', fallback: '/images/landing/6.jpg', alt: 'SHG Women Collective Celebration' },
              { id: 2, angle: '45deg', x: '0.7071', y: '-0.7071', src: '/images/orbit_2.jpg', fallback: '/images/landing/11.jpg', alt: 'PM Vishwakarma Artisan Carpentry' },
              { id: 3, angle: '90deg', x: '1', y: '0', src: '/images/orbit_3.jpg', fallback: '/images/landing/3.jpg', alt: 'Rural Kirana General Store' },
              { id: 4, angle: '135deg', x: '0.7071', y: '0.7071', src: '/images/orbit_4.jpg', fallback: '/images/landing/13.jpg', alt: 'Poultry Farm Entrepreneur' },
              { id: 5, angle: '180deg', x: '0', y: '1', src: '/images/orbit_5.jpg', fallback: '/images/landing/7.jpg', alt: 'Village Capacity Building Training Camp' },
              { id: 6, angle: '225deg', x: '-0.7071', y: '0.7071', src: '/images/orbit_6.jpg', fallback: '/images/landing/8.jpg', alt: 'Commercial Dairy Unit' },
              { id: 7, angle: '270deg', x: '-1', y: '0', src: '/images/orbit_7.jpg', fallback: '/images/landing/4.jpg', alt: 'Market Vendor Liquidity and Profit' },
              { id: 8, angle: '315deg', x: '-0.7071', y: '-0.7071', src: '/images/orbit_8.jpg', fallback: '/images/landing/5.jpg', alt: 'Intergenerational Tailoring Workshop' }
            ].map((tile) => (
              <div 
                key={tile.id}
                className="orbit-tile w-28 h-20 sm:w-32 sm:h-24 md:w-36 md:h-26 rounded-2xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
                style={{
                  '--x-factor': tile.x,
                  '--y-factor': tile.y,
                  '--angle': tile.angle
                }}
              >
                <div className="orbit-tile-inner">
                  <img 
                    src={tile.src} 
                    onError={(e) => { e.currentTarget.src = tile.fallback; }} 
                    alt={tile.alt} 
                    className="w-full h-full object-cover filter brightness-[0.94] contrast-[1.05]" 
                  />
                </div>
              </div>
            ))}
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
        {/* Full-Bleed Panoramic Agrarian Roots Backdrop */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/harvest_immersion.jpg" 
            onError={(e) => { e.currentTarget.src = "/images/landing/9.jpg"; }}
            alt="Traditional Agrarian Roots in Golden Morning Light" 
            className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60"></div>
        </div>

        {/* Top Header Eyebrow Spacer */}
        <div className="relative z-10 h-4"></div>

        {/* Center Circular Radial Arc Gauge with Pure Typography (No Pill Badge) */}
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

            {/* Center Percentage Display (Clean Typography, No Pill Badge) */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight">67%</span>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#FACC15] mt-1 font-semibold">LEAN-SEASON RISK</span>
            </div>

            {/* Dot on Top Arc */}
            <div className="absolute top-2 w-2.5 h-2.5 rounded-full bg-white shadow-lg"></div>
          </div>
        </div>

        {/* Bottom Headline & Action Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#FACC15] tracking-tight leading-tight">
              67% of rural producers
            </h3>
            <p className="text-base sm:text-xl text-white/90 mt-3 font-editorial italic leading-relaxed">
              face catastrophic cash flow collapse during the August lean season without structured statutory amortisation.
            </p>
          </div>

          <button 
            onClick={() => scrollToTarget('#dashboard-section')} 
            className="px-7 py-4 rounded-xl bg-white text-[#111311] font-bold text-xs uppercase tracking-wider font-mono-num flex items-center space-x-2 shadow-2xl hover:bg-[#F4F1EA] hover:scale-105 transition-all duration-300 cursor-pointer pointer-events-auto"
          >
            <span>EXPLORE ADVISORY DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 5: PLATFORM IN 4 PILLARS                                 */}
      {/* ============================================================== */}
      <section id="scene-cards" ref={cardsRef} className="py-28 px-6 sm:px-12 max-w-7xl mx-auto bg-[#F4F1EA]">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#111311] tracking-tight leading-[1.08]">
            The Four Pillars.
          </h2>
          <p className="text-sm sm:text-base text-[#686D65] mt-3 font-sans-ui leading-relaxed">
            Translating statutory NSFDC credit guidelines and empirical rural cash flows into a unified advisory platform.
          </p>
        </div>

        {/* 4 Responsive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="pillar-card bg-white rounded-3xl p-6 border-t-4 border-t-[#0E7A53] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <span className="text-[11px] font-mono-num text-[#E86043] font-semibold uppercase tracking-wider">PILLAR 01</span>
              <h4 className="font-semibold text-lg text-[#111311] mt-2 font-sans-ui tracking-tight">NSFDC Dual-Tier Credit</h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
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
              <span className="text-[11px] font-mono-num text-[#E86043] font-semibold uppercase tracking-wider">PILLAR 02</span>
              <h4 className="font-semibold text-lg text-[#111311] mt-2 font-sans-ui tracking-tight">12-Month Solvency Simulator</h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
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
              <span className="text-[11px] font-mono-num text-[#E86043] font-semibold uppercase tracking-wider">PILLAR 03</span>
              <h4 className="font-semibold text-lg text-[#111311] mt-2 font-sans-ui tracking-tight">Mode B Debt Liberation</h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
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
              <span className="text-[11px] font-mono-num text-[#E86043] font-semibold uppercase tracking-wider">PILLAR 04</span>
              <h4 className="font-semibold text-lg text-[#111311] mt-2 font-sans-ui tracking-tight">1-Page Lead-Bank DPR</h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-2.5 leading-relaxed font-sans-ui">
                Single-page bank sanction appraisal conforming to RBI Lead Bank Scheme standards with QR verification.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-black/5 text-xs font-mono-num font-bold text-[#0E7A53]">
              Instant Bank Appraisal Proposal
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 6: SETO MINIMAL DASHBOARD MOCKUP CONTAINER              */}
      {/* ============================================================== */}
      <SetoDashboard />

    </div>
  );
}
