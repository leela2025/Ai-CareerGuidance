import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min.js';

export const HeroBackground = () => {
  const vantaRef = useRef(null);
  const vantaEffectRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check mobile or low power
    const checkMobile = () => {
      const mobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
      return mobile;
    };

    const isMob = checkMobile();

    // If mobile or small screen, skip 3D canvas to maximize battery and performance
    if (isMob) {
      return;
    }

    // Initialize Vanta NET on desktop (Electric Violet theme - Zero Blue)
    try {
      if (!vantaEffectRef.current && vantaRef.current) {
        vantaEffectRef.current = NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 0.5,
          color: 0xa855f7, // Electric Violet (Zero Blue)
          backgroundColor: 0x09090b, // Neutral Zinc-950 Obsidian
          points: 8.0, // lightweight capped points for 60fps performance
          maxDistance: 22.0,
          spacing: 18.0,
          showDots: true,
        });
      }
    } catch (err) {
      console.warn('Vanta initialization fallback:', err);
    }

    return () => {
      if (vantaEffectRef.current) {
        try {
          vantaEffectRef.current.destroy();
        } catch (e) {
          // ignore cleanup error
        }
        vantaEffectRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 3D Vanta Canvas Container for Desktop */}
      <div
        ref={vantaRef}
        className="absolute inset-0 opacity-35 mix-blend-screen transition-opacity duration-1000"
      />

      {/* Sleek Gradient Overlay to blend seamlessly into zinc-950 */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />

      {/* Radiant Glow Orbs (Purple & Emerald - Zero Blue) */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Grid Pattern for depth (Neutral Zinc) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a22_1px,transparent_1px),linear-gradient(to_bottom,#27272a22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
};

export default HeroBackground;
