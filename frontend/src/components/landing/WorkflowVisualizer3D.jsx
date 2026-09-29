import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  GraduationCap,
  Sparkles,
  Target,
  AlertTriangle,
  Map,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

/**
 * WorkflowVisualizer3D — ThreeUI Product Workflow System
 *
 * Visual Storytelling (Forest Green & Warm Gold Palette - Zero Blue):
 * Stage 1: Profile (Academic & Skill Ingestion - Warm Gold Light)
 * Stage 2: AI Analysis (Claude Sonnet 4.6 Engine - Forest Green Light)
 * Stage 3: Career Match (Quantified Trajectories - Warm Gold Primary)
 * Stage 4: Skill Gaps (Prioritized Missing Tools - Deep Gold/Bronze)
 * Stage 5: Roadmap (Phased Milestones - Bright Forest Green)
 * Stage 6: Growth (ATS 92/100 & Placement - Deep Forest Green)
 */
export const WorkflowVisualizer3D = () => {
  const [activeStage, setActiveStage] = useState(0);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const nodesRef = useRef([]);

  const stages = [
    {
      id: 'profile',
      number: '01',
      title: 'Student Profile',
      tagline: 'Academic & Skill Ingestion',
      icon: <GraduationCap className="w-4 h-4" />,
      color: '#E8C468',
      colorHex: 0xE8C468,
      description:
        'Input your university degree, branch, current semester, and existing coding capabilities to establish a baseline.',
    },
    {
      id: 'analysis',
      number: '02',
      title: 'AI Analysis',
      tagline: 'Claude Sonnet 4.6 Engine',
      icon: <Sparkles className="w-4 h-4" />,
      color: '#2D6A4F',
      colorHex: 0x2D6A4F,
      description:
        'Claude Sonnet 4.6 synthesizes your profile against modern 2025 tech market demands with strict JSON schema verification.',
    },
    {
      id: 'recommendation',
      number: '03',
      title: 'Career Match',
      tagline: 'Quantified Trajectories',
      icon: <Target className="w-4 h-4" />,
      color: '#D4A017',
      colorHex: 0xD4A017,
      description:
        'Surfaces 3–5 tailored industry roles with compatibility scores, salary benchmarks, and hiring trends.',
    },
    {
      id: 'skillgap',
      number: '04',
      title: 'Skill Gaps',
      tagline: 'Prioritized Missing Tools',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: '#A67C00',
      colorHex: 0xA67C00,
      description:
        'Reveals critical missing competencies ranked by hiring urgency, eliminating wasted time on outdated tutorials.',
    },
    {
      id: 'roadmap',
      number: '05',
      title: 'Roadmap',
      tagline: 'Phased Milestones',
      icon: <Map className="w-4 h-4" />,
      color: '#40C281',
      colorHex: 0x40C281,
      description:
        'Generates weekly actionable learning goals linked to verified free documentation, official courses, and real projects.',
    },
    {
      id: 'growth',
      number: '06',
      title: 'Career Growth',
      tagline: 'ATS & Placement Proof',
      icon: <TrendingUp className="w-4 h-4" />,
      color: '#1B4332',
      colorHex: 0x1B4332,
      description:
        'Continuous progress tracking, automated ATS resume scoring (0–100), and job application readiness.',
    },
  ];

  // 3D Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Build the 3D Pathway Pipeline
    const curvePoints = [
      new THREE.Vector3(-9.0, -1.5, 0),
      new THREE.Vector3(-5.4, 1.2, 1),
      new THREE.Vector3(-1.8, -0.8, 0.5),
      new THREE.Vector3(1.8, 1.2, -0.5),
      new THREE.Vector3(5.4, -0.6, 0.8),
      new THREE.Vector3(9.0, 1.0, 0),
    ];

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x27272a, // neutral zinc-800 (zero blue)
      transparent: true,
      opacity: 0.7,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // Glowing Laser Pulse along the curve (Warm Gold)
    const pulseCount = 14;
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: 0xD4A017, // Warm Gold Accent
      size: 0.35,
      transparent: true,
      opacity: 0.9,
    });
    const pulsePointsMesh = new THREE.Points(pulseGeo, pulseMat);
    scene.add(pulsePointsMesh);

    // 6 Stage Nodes
    nodesRef.current = [];
    curvePoints.forEach((pos, idx) => {
      const stage = stages[idx];
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);

      // Outer Ring
      const ringGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: stage.colorHex,
        transparent: true,
        opacity: idx === activeStage ? 0.95 : 0.4,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      nodeGroup.add(ringMesh);

      // Inner Core Sphere
      const sphereGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: stage.colorHex,
        transparent: true,
        opacity: idx === activeStage ? 1.0 : 0.6,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      nodeGroup.add(sphereMesh);

      scene.add(nodeGroup);
      nodesRef.current.push({ group: nodeGroup, ring: ringMesh, sphere: sphereMesh, pos });
    });

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop (High-precision timer without deprecated THREE.Clock)
    let animationId;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) * 0.001;

      // Animate flowing pulses along the curve
      const posAttr = pulseGeo.attributes.position;
      for (let i = 0; i < pulseCount; i++) {
        const u = ((t * 0.25 + i / pulseCount) % 1);
        const p = curve.getPoint(u);
        posAttr.setXYZ(i, p.x, p.y, p.z);
      }
      posAttr.needsUpdate = true;

      // Animate Nodes
      nodesRef.current.forEach((node, idx) => {
        node.ring.rotation.z += 0.01;
        node.ring.rotation.x = Math.sin(t * 1.5 + idx) * 0.2;

        if (idx === activeStage) {
          const pulseScale = 1.0 + Math.sin(t * 3.0) * 0.12;
          node.sphere.scale.set(pulseScale, pulseScale, pulseScale);
        } else {
          node.sphere.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);

      // Dispose Three.js resources cleanly
      tubeGeo?.dispose();
      tubeMat?.dispose();
      pulseGeo?.dispose();
      pulseMat?.dispose();

      if (renderer) {
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, []);

  // Update 3D visual highlight when activeStage changes
  useEffect(() => {
    if (!nodesRef.current.length || !cameraRef.current) return;

    nodesRef.current.forEach((node, idx) => {
      const isActive = idx === activeStage;
      node.ring.material.opacity = isActive ? 0.95 : 0.35;
      node.sphere.material.opacity = isActive ? 1.0 : 0.45;
    });

    // Smoothly nudge camera towards active node
    const targetNode = nodesRef.current[activeStage];
    if (targetNode) {
      const targetX = targetNode.pos.x * 0.35;
      cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.1;
    }
  }, [activeStage]);

  return (
    <div className="w-full">
      {/* 3D WebGL Pipeline Track (ThreeUI System) */}
      <div className="relative w-full h-[220px] sm:h-[260px] bg-zinc-900/60 rounded-3xl border border-zinc-800/80 backdrop-blur-xl overflow-hidden shadow-2xl mb-8">
        <div ref={mountRef} className="w-full h-full" />

        {/* Ambient Top Glow (Forest Green & Warm Gold) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#D4A017]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Active Node Floating HUD Pin */}
        <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-300">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: stages[activeStage].color }}
          />
          <span>Stage {stages[activeStage].number}: {stages[activeStage].title}</span>
        </div>

        <div className="absolute bottom-3 right-6 text-[10px] font-mono text-zinc-500 hidden sm:block">
          Interactive Three.js Workflow Nexus • Click Stages Below
        </div>
      </div>

      {/* Stage Selector Stepper Tabs (Linear Style Hierarchy) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
        {stages.map((stage, idx) => {
          const isActive = idx === activeStage;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(idx)}
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900/90 border-zinc-700 shadow-xl shadow-zinc-950/60 ring-1 ring-accent-500/50 -translate-y-1'
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700/60 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold"
                  style={{
                    backgroundColor: `${stage.color}15`,
                    borderColor: `${stage.color}40`,
                    color: stage.color,
                  }}
                >
                  {stage.icon}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                  {stage.number}
                </span>
              </div>
              <span
                className={`text-xs font-bold transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-300'
                }`}
              >
                {stage.title}
              </span>
              <span className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                {stage.tagline}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Product Preview Deck (Visualizing Actual Product Behavior) */}
      <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: `${stages[activeStage].color}12` }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Explanatory Product Story */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="font-mono text-xs uppercase tracking-wider"
                  style={{ borderColor: `${stages[activeStage].color}50`, color: stages[activeStage].color }}
                >
                  Workflow Phase {stages[activeStage].number}
                </Badge>
                <span className="text-xs text-zinc-400 font-medium">
                  {stages[activeStage].tagline}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                {stages[activeStage].title}
              </h3>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                {stages[activeStage].description}
              </p>
            </div>

            {/* Navigation Steppers */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <span>Progress:</span>
                <span className="text-white font-bold">{activeStage + 1} of 6</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveStage((prev) => (prev > 0 ? prev - 1 : 5))}
                  className="text-xs h-8 px-3"
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setActiveStage((prev) => (prev < 5 ? prev + 1 : 0))}
                  className="text-xs h-8 px-3 flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Actual Product UI Component Mockup */}
          <div className="lg:col-span-7">
            {/* STAGE 1: Profile View */}
            {activeStage === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-zinc-300">student_academic_profile.json</span>
                  </div>
                  <span className="text-[10px] text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 font-mono">
                    Baseline Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-400 text-[11px] block">Degree & Branch</span>
                    <span className="font-bold text-white mt-0.5 block">B.Tech Computer Science</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-400 text-[11px] block">Current Year</span>
                    <span className="font-bold text-white mt-0.5 block">Year 3 • Semester 6</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-zinc-400 text-[11px] block mb-2">Acquired Tech Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'JavaScript (ES6)', 'React.js', 'Node.js', 'Express', 'SQL', 'Git'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-xs border border-zinc-700/80 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                  <span>Target Industry Domain: <strong className="text-white">Cloud Architecture & Full Stack</strong></span>
                  <span className="text-brand-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Ingested
                  </span>
                </div>
              </div>
            )}

            {/* STAGE 2: AI Analysis View */}
            {activeStage === 1 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-400 animate-spin-slow" />
                    <span className="text-zinc-300 font-bold">Claude Sonnet 4.6 • Reasoning Protocol</span>
                  </div>
                  <span className="text-accent-300 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 text-[10px]">
                    Strict JSON Engine
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 space-y-1.5 overflow-x-auto text-[11px] leading-relaxed">
                  <p className="text-zinc-500">// Vector match against 2025 Industry Tech Rubrics</p>
                  <p><span className="text-accent-400">POST</span> /api/career/analyze</p>
                  <p className="text-brand-400">✔ Degree alignment: 94.2% (Computer Science)</p>
                  <p className="text-brand-400">✔ Core foundations: Data Structures, OOP, Web APIs</p>
                  <p className="text-accent-400">⚠ Detected Critical Gap: Container Orchestration & Distributed Systems</p>
                  <p className="text-accent-300">→ Synthesizing 3 Optimal Trajectories + Sequence Roadmaps...</p>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-400">
                  <span>Inference latency: <strong className="text-white">1.18s</strong></span>
                  <span className="text-accent-400">Deterministic Temperature: 0.3</span>
                </div>
              </div>
            )}

            {/* STAGE 3: Career Recommendation View */}
            {activeStage === 2 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-400" />
                    Top Recommended Trajectories
                  </span>
                  <span className="text-[10px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-mono">
                    3 Matches Surfaced
                  </span>
                </div>

                {/* Match 1 */}
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-brand-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Cloud DevOps Engineer</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold uppercase font-mono">
                        Top Fit
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Leverages existing Linux & Python foundations; fast ROI.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-brand-400 font-mono">94%</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Match Score</span>
                  </div>
                </div>

                {/* Match 2 */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between opacity-85">
                  <div>
                    <span className="font-bold text-sm text-white">Full-Stack Cloud Developer</span>
                    <span className="text-xs text-zinc-400 block mt-0.5">High direct synergy with React & Node background.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-accent-300 font-mono">91%</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Match Score</span>
                  </div>
                </div>

                {/* Match 3 */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between opacity-70">
                  <div>
                    <span className="font-bold text-sm text-white">AI Systems Integration Engineer</span>
                    <span className="text-xs text-zinc-400 block mt-0.5">Requires additional vector DB and Python model training.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-accent-400 font-mono">86%</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Match Score</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: Skill Gaps View */}
            {activeStage === 3 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-400" />
                    Target Role: Cloud DevOps Engineer Skill Gaps
                  </span>
                  <span className="text-[10px] text-accent-300 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 font-mono">
                    4 High Impact Missing
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-accent-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#9B2C2C]" />
                      <div>
                        <span className="text-sm font-bold text-white">Docker Containerization</span>
                        <p className="text-xs text-zinc-400">Required in 92% of junior DevOps postings.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A5A5] bg-[#9B2C2C]/20 px-2 py-1 rounded font-mono">
                      Critical
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-accent-400" />
                      <div>
                        <span className="text-sm font-bold text-white">Kubernetes Pod Architecture</span>
                        <p className="text-xs text-zinc-400">Microservice orchestration baseline.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-400 bg-accent-500/10 px-2 py-1 rounded font-mono">
                      High Priority
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-brand-400" />
                      <div>
                        <span className="text-sm font-bold text-white">CI/CD Automation (GitHub Actions)</span>
                        <p className="text-xs text-zinc-400">Automated build and test pipelines.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-1 rounded font-mono">
                      Medium
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 5: Personalized Roadmap View */}
            {activeStage === 4 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Map className="w-4 h-4 text-brand-400" />
                    Personalized 4-Phase Roadmap
                  </span>
                  <span className="text-[10px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-mono">
                    Interactive Checkpoints
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-brand-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold font-mono">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white line-through opacity-80">
                          Phase 1: Linux Foundations & Bash Scripting
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                          <span>FreeCodeCamp Linux Lab</span> • <span>Completed</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-brand-400 font-bold">100%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-brand-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-xs font-bold animate-pulse font-mono">
                        2
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">
                          Phase 2: Docker Multi-Stage Builds & Compose
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-accent-300">
                          <span>Docker Official Docs & Tutorials</span> • <span>In Progress (60%)</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-accent-400 font-bold">ACTIVE</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold font-mono">
                        3
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">
                          Phase 3: CI/CD Pipeline & AWS Deployment
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                          <span>GitHub Actions Lab + AWS Cloud</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Upcoming</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 6: Growth & ATS View */}
            {activeStage === 5 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    Automated Placement Readiness & ATS Scoring
                  </span>
                  <span className="text-[10px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-mono">
                    Placement Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-brand-500/30 text-center">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                      ATS Benchmark Score
                    </span>
                    <span className="text-4xl font-extrabold text-brand-400 font-mono my-1 block">
                      92<span className="text-lg text-zinc-400">/100</span>
                    </span>
                    <span className="text-[11px] text-accent-300 font-medium font-mono">
                      Top 8% of CS Applicants
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300">Target Role Keyword Match:</span>
                      <strong className="text-brand-400 font-mono">94%</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300">Action Verb Density:</span>
                      <strong className="text-brand-400 font-mono">Optimal</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300">Overall Placement Confidence:</span>
                      <strong className="text-accent-300 font-mono">High</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                  Recruiter Feedback: <em className="text-zinc-200">"Strong evidence of real Dockerized production apps and verified git milestones."</em>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizer3D;
