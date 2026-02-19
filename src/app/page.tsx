"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Stethoscope } from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { DemoSection } from "@/components/landing/demo-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";
import { PitchProvider } from "@/components/pitch/pitch-provider";
import { PitchOverlay } from "@/components/pitch/pitch-overlay";
import { PitchSlideRenderer } from "@/components/pitch/pitch-slide-renderer";
import { PitchProgress } from "@/components/pitch/pitch-progress";

// Register all GSAP plugins once (except MotionPathPlugin — lazy only)
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    DrawSVGPlugin,
    SplitText,
    ScrambleTextPlugin,
    MorphSVGPlugin,
    Physics2DPlugin
  );
}

const navItems = [
  { name: "Features", link: "#features" },
  { name: "How It Works", link: "#workflow" },
  { name: "Demo", link: "#demo" },
];

export default function LandingPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create ScrollSmoother (tuned for buttery feel)
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.15,
      normalizeScroll: true,
    });

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ScrollSmoother-aware anchor navigation
  const scrollToHash = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      if (smootherRef.current) {
        smootherRef.current.scrollTo(target, true, "top top");
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  return (
    <PitchProvider>
    <div className="min-h-screen overflow-x-hidden">
      {/* ═══ PITCH DECK — Outside ScrollSmoother (fixed overlay) ═══ */}
      <PitchOverlay />
      <PitchSlideRenderer />
      <PitchProgress />

      {/* ═══ NAVBAR — Outside ScrollSmoother (fixed) ═══ */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div onClick={scrollToHash}>
      <Navbar>
        <NavBody>
          <NavbarLogo
            logo={
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
            }
            name="MedScribe AI"
          />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <NavbarButton href="/login" variant="secondary">
              Log in
            </NavbarButton>
            <NavbarButton
              href="/register"
              variant="gradient"
              className="bg-gradient-to-b from-primary to-primary/80"
            >
              Get Started
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo
              logo={
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
              }
              name="MedScribe AI"
            />
            <MobileNavToggle
              isOpen={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isMobileNavOpen}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={(e) => {
                  scrollToHash(e);
                  setIsMobileNavOpen(false);
                }}
                className="w-full text-neutral-600 dark:text-neutral-300 text-sm"
              >
                {item.name}
              </a>
            ))}
            <div className="flex w-full flex-col gap-2">
              <NavbarButton href="/login" variant="primary" className="w-full">
                Log in
              </NavbarButton>
              <NavbarButton
                href="/register"
                variant="gradient"
                className="w-full bg-gradient-to-b from-primary to-primary/80"
              >
                Get Started
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      </div>

      {/* ═══ SCROLLSMOOTHER WRAPPER ═══ */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <WorkflowSection />
          <DemoSection />
          <CtaSection />
          <FooterSection />
        </div>
      </div>
    </div>
    </PitchProvider>
  );
}
