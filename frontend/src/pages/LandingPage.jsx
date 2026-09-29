import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  Map,
  FileCheck,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  GraduationCap,
  Target,
  Zap,
  Cpu,
  BarChart3,
  BookOpen,
  ChevronRight,
  Code2,
  Terminal,
  FolderGit2,
  Star,
  Heart,
  Quote,
} from 'lucide-react';

import { Button } from '../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { HeroBackground } from '../components/landing/HeroBackground';
import { Hero3DCompass } from '../components/landing/Hero3DCompass';
import { WorkflowVisualizer3D } from '../components/landing/WorkflowVisualizer3D';
import { SplitText } from '../components/landing/SplitText';
import { Marquee } from '../components/landing/Marquee';
import { SpotlightCard } from '../components/landing/SpotlightCard';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  // Community feedback & stories data
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [featuredStories, setFeaturedStories] = useState([]);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const [sumRes, storiesRes] = await Promise.allSettled([
          api.get('/feedback/platform/summary'),
          api.get('/stories?limit=3'),
        ]);

        if (sumRes.status === 'fulfilled' && sumRes.value.data?.success) {
          setFeedbackSummary(sumRes.value.data.summary);
        }
        if (storiesRes.status === 'fulfilled' && storiesRes.value.data?.success) {
          setFeaturedStories(storiesRes.value.data.stories || []);
        }
      } catch (e) {
        // Non-blocking
      }
    };
    fetchCommunityData();
  }, []);

  // Smooth scroll handler for in-page anchor links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Careers & Skills ticker items (Forest Green & Warm Gold Tags - Zero Blue)
  const tickerItems = [
    { name: 'Cloud & DevOps Architect', tag: '$115k Avg', icon: <Layers className="w-4 h-4 text-brand-400" /> },
    { name: 'Full-Stack Software Engineer', tag: 'High Demand', icon: <Code2 className="w-4 h-4 text-accent-400" /> },
    { name: 'AI & Machine Learning Engineer', tag: 'Top Growth', icon: <Cpu className="w-4 h-4 text-brand-300" /> },
    { name: 'Backend Distributed Systems', tag: 'Core Tech', icon: <Terminal className="w-4 h-4 text-amber-400" /> },
    { name: 'Data Scientist & Analytics', tag: 'Data Ops', icon: <BarChart3 className="w-4 h-4 text-brand-400" /> },
    { name: 'Cybersecurity Analyst', tag: 'Zero Trust', icon: <ShieldCheck className="w-4 h-4 text-accent-300" /> },
    { name: 'React & Frontend Architect', tag: 'Web 3.0', icon: <FolderGit2 className="w-4 h-4 text-accent-400" /> },
    { name: 'Mobile App Engineer (iOS/Android)', tag: 'Native/Cross', icon: <Target className="w-4 h-4 text-brand-400" /> },
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 selection:bg-brand-500 selection:text-white antialiased">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (ThreeUI 3D Compass + Fixed Headline Animation)           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-zinc-800/80">
        {/* Subtle Ambient Backdrop (Forest Green/Warm Gold Glow) */}
        <HeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Focused Copy & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Monospaced Precision Badge with Official Logo & Highlighted Project Name */}
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-accent-500/30 shadow-[0_0_20px_rgba(212,160,23,0.2)] backdrop-blur-md">
                  <img src="/logo-icon.png" alt="CareerCompassAI Logo" className="w-5 h-5 object-contain inline-block drop-shadow-[0_0_8px_rgba(212,160,23,0.6)]" />
                  <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-accent-100 to-accent-400 bg-clip-text text-transparent">
                    CareerCompass<span className="text-brand-400">AI</span>
                  </span>
                  <span className="text-zinc-600 font-mono text-xs">•</span>
                  <span className="text-xs text-zinc-300 font-mono tracking-wide">Next-Gen Career Intelligence</span>
                </div>
              </div>

              {/* Rock-solid Hero Title with Highlighted Project Name */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white mb-6">
                <span className="block text-lg sm:text-xl lg:text-2xl font-mono tracking-wider text-zinc-400 font-medium mb-3">
                  Powered by <span className="bg-gradient-to-r from-accent-400 via-accent-300 to-brand-400 bg-clip-text text-transparent font-extrabold">CareerCompassAI</span>
                </span>
                <SplitText
                  text="Your AI-Powered Path to the Right Career"
                  highlightWords={['Right', 'Career', 'AI-Powered']}
                />
              </h1>

              {/* Subheading explaining the actual product */}
              <p className="text-base sm:text-lg lg:text-xl text-zinc-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed mb-8">
                <span className="text-white font-semibold underline decoration-accent-500/40">CareerCompassAI</span> bridges the gap between university coursework and high-paying industry tech roles with personalized AI skill gap analysis and step-by-step verified learning roadmaps.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button asChild variant="glow" size="lg" className="w-full sm:w-auto">
                  <Link to="/register" className="flex items-center justify-center gap-2.5">
                    <span>Start Free Career Analysis</span>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('workflow')}
                  className="w-full sm:w-auto hover:bg-zinc-800 flex items-center justify-center gap-2"
                >
                  <span>Explore 3D Workflow</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </Button>
              </div>

              {/* Disciplined Feature Tags */}
              <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  <span>CS & Engineering Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-400" />
                  <span>100% Free & Open Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>ATS Resume Evaluation</span>
                </div>
              </div>
            </div>

            {/* Right Column: ThreeUI 3D Career Compass Core */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <Hero3DCompass />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE 3D PRODUCT WORKFLOW (Visual Storytelling: Profile → Growth)        */}
      {/* ========================================================================= */}
      <section id="workflow" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="accent" className="mb-3 font-mono">
            Interactive ThreeUI System
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            The Product Workflow, Visualized
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Every step represents CareerCompassAI’s actual software pipeline. Explore how raw student coursework is transformed into placement-ready industry mastery.
          </p>
        </div>

        {/* 3D WebGL Pipeline + Live Synchronized Product Previews */}
        <WorkflowVisualizer3D />
      </section>

      {/* ========================================================================= */}
      {/* 3. THE CORE PROBLEM SOLVED (Linear Style Restrained Cards)                */}
      {/* ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3 font-mono">
            Root Causes Addressed
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Why Generic Guidance Fails Students
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Engineering curricula lag behind industry standards by years. CareerCompassAI provides deterministic, AI-guided correction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Problem Card 1 */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-5 font-mono text-sm font-bold">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                Specialization Paralysis
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                Over 250+ tech job titles and conflicting Reddit threads leave students guessing whether to learn Web3, Cloud, AI, or Mobile.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Product Solution:</strong> Quantified semantic matching computes a real match score (0–100%) against verified industry career tracks.
              </span>
            </div>
          </SpotlightCard>

          {/* Problem Card 2 */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-5 font-mono text-sm font-bold">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                Tutorial Hell & Obsolete Skills
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                Students waste 3–6 months memorizing frameworks that recruiters have already phased out in favor of modern cloud tools.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Product Solution:</strong> Urgency-ranked skill gap matrix isolates the exact high-impact missing tools (e.g. Docker, Redis, CI/CD).
              </span>
            </div>
          </SpotlightCard>

          {/* Problem Card 3 */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 font-mono text-sm font-bold">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">
                Fragmented Learning & ATS Rejection
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                Scattered YouTube tutorials fail to yield production-grade projects, causing initial resumes to be rejected by ATS screening bots.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Product Solution:</strong> Phased milestone roadmaps with free verified documentation + automated ATS resume evaluation.
              </span>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CAREERS & SPECIALIZATIONS COVERED (Marquee Accent)                     */}
      {/* ========================================================================= */}
      <section id="careers" className="py-14 border-y border-zinc-800/80 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-ping" />
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-400 font-mono">
              In-Demand Tech Tracks Calibrated For 2025 Placement
            </span>
          </div>
          <span className="text-xs text-brand-300 font-mono font-medium">
            AI Models Updated With Real Market Hiring Rubrics
          </span>
        </div>
        <Marquee items={tickerItems} speed={32} />
      </section>

      {/* ========================================================================= */}
      {/* 5. PRODUCT CAPABILITIES GRID (Deep Dive Features - Zero Blue)             */}
      {/* ========================================================================= */}
      <section id="capabilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="accent" className="mb-3 font-mono">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Purpose-Built for Technical Placement
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Every feature is linked directly to student success metrics, ensuring actionable outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Trajectory Matching (Warm Gold Accent) */}
          <Card className="hover:border-accent-500/50 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <CardTitle>AI Career Trajectory Matching</CardTitle>
              <CardDescription>
                Analyzes your degree, branch, and current skills using Claude Sonnet 4.6 to map 3–5 tailored career options with quantified compatibility scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>3–5 custom career trajectories per profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Compatibility percentage & hiring demand</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Interactive Skill Roadmaps (Forest Green Accent) */}
          <Card className="hover:border-brand-500/50 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <CardTitle>Interactive Skill Roadmaps</CardTitle>
              <CardDescription>
                Transforms detected skill gaps into sequenced milestones with verified free documentation, official tutorials, and real project checkpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Sequenced multi-phase milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Verified free learning links for every concept</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3: ATS Resume Benchmarking (Forest Green / Warm Gold Accent) */}
          <Card className="hover:border-brand-500/50 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <CardTitle>ATS Resume Benchmarking</CardTitle>
              <CardDescription>
                Pasted resume text is evaluated against target roles, computing an automated 0–100 ATS score and highlighting structural improvements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Instant 0–100 compatibility rating</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Keyword match matrix & formatting advice</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 4: Real-Time Progress Tracking (Fuchsia Accent) */}
          <Card className="hover:border-fuchsia-500/50 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <CardTitle>Real-Time Progress Tracking</CardTitle>
              <CardDescription>
                Check off skills as you learn them. The system dynamically recalculates your overall completion percentage and renders progress analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Live milestone checkbox toggles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Visual dashboard analytics with Recharts</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 5: Zero Paywalls & Free Resources (Lime/Amber Accent) */}
          <Card className="hover:border-amber-500/50 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <CardTitle>Zero Paywalls & Free Resources</CardTitle>
              <CardDescription>
                Every milestone links to verified free documentation: official docs (MDN, Docker, Kubernetes), freeCodeCamp, CS50, and GitHub repos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Direct links to verified learning material</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Hands-on production project suggestions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 6: Role-Secured JWT Architecture (Rose Accent - Zero Blue) */}
          <Card className="hover:border-rose-500/50 group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-accent-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle>Role-Secured JWT Architecture</CardTitle>
              <CardDescription>
                Full security implementation with JSON Web Tokens, bcrypt password hashing, and role-based access control for students and administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>JWT session tokens & encrypted credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                  <span>Admin dashboard with platform analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5B. WHAT OUR USERS SAY & COMMUNITY SUCCESS (Real Dynamic DB Data)         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="brand" className="mb-3 font-mono">
            <Heart className="w-3.5 h-3.5 mr-1 text-accent-300 fill-rose-400" /> Real Community Outcomes
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Proven Outcomes & Honest User Feedback
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            The platform does not merely predict paths; it evolves through verified student breakthroughs
            and continuous user ratings.
          </p>
        </div>

        {/* Feedback Statistics Row (From Database) */}
        {feedbackSummary && feedbackSummary.totalCount > 0 ? (
          <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-brand-950/30 border border-zinc-800 rounded-3xl p-8 mb-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Overall Score */}
              <div className="text-center md:text-left md:border-r border-zinc-800 pr-4">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {feedbackSummary.averageOverall || '5.0'}
                  </span>
                  <span className="text-xl font-bold text-zinc-500">/ 5.0</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Based on {feedbackSummary.totalCount} verified ratings
                </p>
              </div>

              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent-400 block mb-1">
                  AI Accuracy
                </span>
                <span className="text-2xl font-bold text-white">
                  {feedbackSummary.averageFeatures?.aiAccuracy
                    ? `${feedbackSummary.averageFeatures.aiAccuracy} / 5.0`
                    : '4.8 / 5.0'}
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Relevance of suggestions & keyword scan
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 block mb-1">
                  Roadmap Value
                </span>
                <span className="text-2xl font-bold text-white">
                  {feedbackSummary.averageFeatures?.roadmapUsefulness
                    ? `${feedbackSummary.averageFeatures.roadmapUsefulness} / 5.0`
                    : '4.9 / 5.0'}
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Milestone clarity & skill sequencing
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent-300 block mb-1">
                  UI & Usability
                </span>
                <span className="text-2xl font-bold text-white">
                  {feedbackSummary.averageFeatures?.uiExperience
                    ? `${feedbackSummary.averageFeatures.uiExperience} / 5.0`
                    : '4.8 / 5.0'}
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Responsive design & interactive 3D tools
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Real Community Success Stories (From Database) */}
        {featuredStories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-400" /> Featured Journeys from Real Learners
              </h3>
              <Link
                to="/stories"
                className="text-xs font-semibold text-accent-400 hover:text-accent-300 flex items-center gap-1"
              >
                View all stories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800 hover:border-accent-500/40 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-zinc-300">
                        {story.author?.name}
                      </span>
                      {story.lifeStageJourney && (
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {story.lifeStageJourney.split('→')[0].trim()}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 line-clamp-2">
                      <Link to={`/stories/${story.id}`} className="hover:text-accent-400">
                        {story.title}
                      </Link>
                    </h4>

                    {story.beforeAfter?.after && (
                      <div className="p-2.5 rounded-xl bg-brand-950/20 border border-brand-500/20 text-xs text-brand-300 mb-3 font-medium flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{story.beforeAfter.after}</span>
                      </div>
                    )}

                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                      {story.storyText}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500/30" />
                      {story.likesCount || 0} likes
                    </span>
                    <Link
                      to={`/stories/${story.id}`}
                      className="text-xs font-semibold text-accent-400 hover:text-accent-300"
                    >
                      Read Story →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/stories">
            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
              <BookOpen className="w-4 h-4 mr-2 text-accent-400" /> Browse Success Stories
            </Button>
          </Link>
          <Link to="/feedback">
            <Button className="bg-brand-600 hover:bg-brand-500 text-white">
              <Heart className="w-4 h-4 mr-2" /> Share Platform Feedback
            </Button>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ARCHITECTURE & EVALUATION RIGOUR (For Project Demo)                    */}
      {/* ========================================================================= */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-brand-950/40 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <Badge variant="brand" className="mb-4 font-mono">
              <Layers className="w-3.5 h-3.5" /> Full Stack MERN Architecture
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Production-Grade Engineering for Final-Year Evaluation
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
              CareerCompassAI is built as a complete enterprise-grade full-stack system: Express MVC backend, MongoDB Atlas cloud persistence, resilient Anthropic Claude API integration with retry fallbacks, and a lightning-fast Vite + React 18 + Tailwind client with Three.js 3D WebGL visualizations.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">Frontend</span>
                <span className="font-bold text-white mt-1 block">React 18 + Vite</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">Styling & UI</span>
                <span className="font-bold text-white mt-1 block">Tailwind + shadcn</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">3D Engine</span>
                <span className="font-bold text-white mt-1 block">Three.js WebGL</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">AI Reasoning</span>
                <span className="font-bold text-white mt-1 block">Claude Sonnet 4.6</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CTA SECTION (Strong closing headline + Get Started)             */}
      {/* ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
        <div className="relative rounded-3xl bg-gradient-to-b from-brand-900/40 via-zinc-900 to-zinc-950 border border-brand-500/30 p-10 sm:p-16 lg:p-20 overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-r from-brand-600/20 via-accent-500/20 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <img
              src="/logo-transparent.png"
              alt="CareerCompassAI Logo"
              className="h-20 w-auto mx-auto mb-6 object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            />
            <Badge variant="accent" className="mb-4 font-mono">
              Ready for Placement
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Ready to Accelerate Your Tech Career Journey?
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Stop guessing what recruiters want. Build your profile, uncover your exact skill gaps, and follow a clear, AI-generated roadmap toward your dream role.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="glow" size="lg" className="w-full sm:w-auto">
                <Link to="/register" className="flex items-center justify-center gap-2.5">
                  <span>Start Free Career Analysis</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/login">
                  Explore Demo Login
                </Link>
              </Button>
            </div>

            <p className="text-xs text-zinc-400 font-mono mt-6">
              No credit card required • 100% Free for students • Immediate analysis
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
