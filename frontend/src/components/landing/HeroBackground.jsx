import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check mobile or low power
    const isMobile =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) return;

    let renderer, scene, camera, animId;
    let pointsMesh, linesMesh;
    let particleGeo, particleMat, linesGeo, linesMat;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
      camera.position.z = 280;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Particle nodes (Electric Violet Theme - Zero Blue)
      const particleCount = 55;
      const maxDistance = 68;
      const maxConnections = particleCount * 6;

      const positions = new Float32Array(particleCount * 3);
      const velocities = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 320;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

        velocities.push({
          x: (Math.random() - 0.5) * 0.4,
          y: (Math.random() - 0.5) * 0.4,
          z: (Math.random() - 0.5) * 0.25,
        });
      }

      particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Circular canvas texture for smooth rounded glowing dots
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(192, 132, 252, 1)'); // Lavender Violet
      grad.addColorStop(0.4, 'rgba(168, 85, 247, 0.7)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      const texture = new THREE.CanvasTexture(canvas);

      particleMat = new THREE.PointsMaterial({
        color: 0xc084fc,
        size: 5,
        map: texture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      pointsMesh = new THREE.Points(particleGeo, particleMat);
      scene.add(pointsMesh);

      // Connecting lines
      const linePositions = new Float32Array(maxConnections * 6);
      linesGeo = new THREE.BufferGeometry();
      linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

      linesMat = new THREE.LineBasicMaterial({
        color: 0xa855f7, // Electric violet
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      linesMesh = new THREE.LineSegments(linesGeo, linesMat);
      scene.add(linesMesh);

      // Subtle mouse parallax
      const handleMouseMove = (e) => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        targetX = ((e.clientX - halfW) / halfW) * 20;
        targetY = ((e.clientY - halfH) / halfH) * 20;
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      // Resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
        animId = requestAnimationFrame(animate);

        // Smooth camera tilt towards mouse
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;
        camera.position.x = mouseX;
        camera.position.y = -mouseY;
        camera.lookAt(0, 0, 0);

        // Update particle positions
        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          pos[idx] += velocities[i].x;
          pos[idx + 1] += velocities[i].y;
          pos[idx + 2] += velocities[i].z;

          // Soft boundary bounce
          if (pos[idx] < -180 || pos[idx] > 180) velocities[i].x *= -1;
          if (pos[idx + 1] < -120 || pos[idx + 1] > 120) velocities[i].y *= -1;
          if (pos[idx + 2] < -90 || pos[idx + 2] > 90) velocities[i].z *= -1;
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Update connecting lines
        let lineIdx = 0;
        const linePos = linesGeo.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
          for (let j = i + 1; j < particleCount; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < maxDistance && lineIdx < maxConnections) {
              const start = lineIdx * 6;
              linePos[start] = pos[i * 3];
              linePos[start + 1] = pos[i * 3 + 1];
              linePos[start + 2] = pos[i * 3 + 2];
              linePos[start + 3] = pos[j * 3];
              linePos[start + 4] = pos[j * 3 + 1];
              linePos[start + 5] = pos[j * 3 + 2];
              lineIdx++;
            }
          }
        }
        linesGeo.setDrawRange(0, lineIdx * 2);
        linesGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);

        particleGeo?.dispose();
        particleMat?.dispose();
        texture?.dispose();
        linesGeo?.dispose();
        linesMat?.dispose();

        if (renderer) {
          if (renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('HeroBackground 3D canvas fallback:', err);
    }
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
