import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Hero3DCompass — ThreeUI Inspired 3D Career Compass Core
 *
 * Visual Storytelling (Forest Green and Warm Gold Palette):
 * - Concentric glowing orbital rings (Degrees of exploration)
 * - Inner luminous neural core (Claude AI Engine in Forest Green & Warm Gold)
 * - Orbiting data nodes (Student Profile, Skills, Roadmap checkpoints)
 * - Interactive mouse parallax tilt and smooth inertia
 */
export const Hero3DCompass = () => {
  const mountRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect mobile or low performance
    const isMobile =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    let renderer, scene, camera, animationFrameId;
    let compassGroup, coreMesh, ring1, ring2, ring3, satellitesGroup, particlesMesh;
    let coreGeo, coreMat, ring1Geo, ring1Mat, ring2Geo, ring2Mat, ring3Geo, ring3Mat;
    let innerCoreGlowGeo, innerCoreGlowMat, particleGeo, particleMat;
    let satGeometries = [];
    let satMaterials = [];

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    try {
      const width = container.clientWidth || 450;
      const height = container.clientHeight || 450;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 24;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));

      // Clear any prior canvas to be StrictMode & HMR safe
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      compassGroup = new THREE.Group();
      scene.add(compassGroup);

      // --- 1. Inner Neural Core (Claude AI Engine in Forest Green) ---
      coreGeo = new THREE.IcosahedronGeometry(3.2, 1);
      coreMat = new THREE.MeshBasicMaterial({
        color: 0x2D6A4F, // Forest Green (Primary Light)
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      coreMesh = new THREE.Mesh(coreGeo, coreMat);
      compassGroup.add(coreMesh);

      // Inner glowing point light (Warm Gold)
      innerCoreGlowGeo = new THREE.SphereGeometry(2.0, 16, 16);
      innerCoreGlowMat = new THREE.MeshBasicMaterial({
        color: 0xD4A017, // Warm Gold Accent
        transparent: true,
        opacity: 0.28,
      });
      const innerGlow = new THREE.Mesh(innerCoreGlowGeo, innerCoreGlowMat);
      compassGroup.add(innerGlow);

      // --- 2. Concentric Gyroscopic Rings (Workflow axes) ---
      // Ring 1: Warm Gold Orbit
      ring1Geo = new THREE.TorusGeometry(5.2, 0.04, 8, 80);
      ring1Mat = new THREE.MeshBasicMaterial({
        color: 0xD4A017, // Warm Gold
        transparent: true,
        opacity: 0.65,
      });
      ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 4;
      compassGroup.add(ring1);

      // Ring 2: Forest Green Trajectory Orbit
      ring2Geo = new THREE.TorusGeometry(6.6, 0.04, 8, 80);
      ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x2D6A4F, // Forest Green Light
        transparent: true,
        opacity: 0.7,
      });
      ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.y = Math.PI / 3;
      ring2.rotation.x = -Math.PI / 6;
      compassGroup.add(ring2);

      // Ring 3: Light Warm Gold Milestones Orbit
      ring3Geo = new THREE.TorusGeometry(8.0, 0.03, 8, 90);
      ring3Mat = new THREE.MeshBasicMaterial({
        color: 0xE8C468, // Lighter Warm Gold
        transparent: true,
        opacity: 0.55,
      });
      ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
      ring3.rotation.z = Math.PI / 5;
      ring3.rotation.x = Math.PI / 2.5;
      compassGroup.add(ring3);

      // --- 3. Orbiting Workflow Satellites (Forest Green + Warm Gold) ---
      satellitesGroup = new THREE.Group();
      compassGroup.add(satellitesGroup);

      const satelliteData = [
        { radius: 5.2, angle: 0, color: 0xD4A017, size: 0.35, label: 'Profile' },
        { radius: 6.6, angle: Math.PI * 0.6, color: 0x2D6A4F, size: 0.4, label: 'AI' },
        { radius: 6.6, angle: Math.PI * 1.4, color: 0xE8C468, size: 0.4, label: 'Match' },
        { radius: 8.0, angle: Math.PI * 0.3, color: 0x1B4332, size: 0.35, label: 'Gaps' },
        { radius: 8.0, angle: Math.PI * 1.1, color: 0x40C281, size: 0.45, label: 'Roadmap' },
        { radius: 8.0, angle: Math.PI * 1.8, color: 0xA67C00, size: 0.4, label: 'Growth' },
      ];

      const satelliteMeshes = satelliteData.map((data) => {
        const satGeo = new THREE.SphereGeometry(data.size, 12, 12);
        const satMat = new THREE.MeshBasicMaterial({
          color: data.color,
          transparent: true,
          opacity: 0.95,
        });
        satGeometries.push(satGeo);
        satMaterials.push(satMat);

        const mesh = new THREE.Mesh(satGeo, satMat);
        mesh.userData = data;
        satellitesGroup.add(mesh);
        return mesh;
      });

      // --- 4. Ambient Particle Nebula (Warm Gold Stardust) ---
      const particleCount = isMobile ? 60 : 140;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const r = 4.0 + Math.random() * 8.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        particlePositions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = r * Math.cos(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = r * Math.sin(phi);
      }
      particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleMat = new THREE.PointsMaterial({
        color: 0xE8C468, // Warm Gold Stardust
        size: 0.12,
        transparent: true,
        opacity: 0.55,
      });
      particlesMesh = new THREE.Points(particleGeo, particleMat);
      compassGroup.add(particlesMesh);

      // Mouse move listener for smooth 3D tilt
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotationY = x * 0.8;
        targetRotationX = -y * 0.8;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      // Resize listener
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };
      window.addEventListener('resize', handleResize);

      // Animation Loop (High-precision timer without deprecated THREE.Clock)
      const startTime = performance.now();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = (performance.now() - startTime) * 0.001;

        // Smooth mouse inertia
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        compassGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.3) * 0.08;
        compassGroup.rotation.y = currentRotationY + elapsedTime * 0.15;

        // Individual ring rotations
        ring1.rotation.z += 0.006;
        ring2.rotation.x += 0.004;
        ring3.rotation.y += 0.005;

        // Core pulsing
        const pulse = 1 + Math.sin(elapsedTime * 2.0) * 0.05;
        coreMesh.scale.set(pulse, pulse, pulse);
        coreMesh.rotation.y -= 0.008;

        // Satellite orbits
        satelliteMeshes.forEach((sat, i) => {
          const speed = 0.4 + i * 0.08;
          const currentAngle = sat.userData.angle + elapsedTime * speed;
          const r = sat.userData.radius;
          sat.position.x = Math.cos(currentAngle) * r;
          sat.position.y = Math.sin(currentAngle) * r * Math.sin(sat.userData.angle);
          sat.position.z = Math.sin(currentAngle) * r * Math.cos(sat.userData.angle);
        });

        // Slow particle cloud rotation
        particlesMesh.rotation.y = elapsedTime * 0.03;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        // Dispose GPU memory
        coreGeo?.dispose();
        coreMat?.dispose();
        innerCoreGlowGeo?.dispose();
        innerCoreGlowMat?.dispose();
        ring1Geo?.dispose();
        ring1Mat?.dispose();
        ring2Geo?.dispose();
        ring2Mat?.dispose();
        ring3Geo?.dispose();
        ring3Mat?.dispose();
        particleGeo?.dispose();
        particleMat?.dispose();
        satGeometries.forEach((g) => g.dispose());
        satMaterials.forEach((m) => m.dispose());

        if (renderer) {
          if (renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      };
    } catch (e) {
      console.warn('Three.js initialization fallback:', e);
      setIsSupported(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center">
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-700"
      />

      {/* Atmospheric Ambient Lighting & Glow rings (Forest Green & Warm Gold) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 rounded-full bg-[#1B4332]/25 blur-3xl" />
        <div className="w-56 h-56 rounded-full bg-[#D4A017]/15 blur-2xl" />
      </div>

      {/* Overlay Badges explaining the 3D Nexus */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400 backdrop-blur-md shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] animate-pulse" />
        <span>3D Nexus: Profile → Claude Analysis → Verified Milestones</span>
      </div>
    </div>
  );
};

export default Hero3DCompass;
