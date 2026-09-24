import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-brand-600/20 via-accent-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          Powered by Claude Sonnet 4.6 & MERN Stack
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Navigate Your Tech Career with <br />
          <span className="bg-gradient-to-r from-brand-400 via-accent-300 to-teal-200 bg-clip-text text-transparent">
            Precision AI Guidance
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          CareerCompassAI maps university students' academic background and programming skills directly to high-demand industry roles, reveals critical skill gaps, and generates step-by-step interactive learning roadmaps.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-base shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
          >
            <span>Start Free Career Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 transition-colors"
          >
            Explore Demo Login
          </Link>
        </div>

        {/* Highlight Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-extrabold text-white">100%</div>
            <div className="text-xs text-slate-400 mt-1">Personalized Roadmaps</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-extrabold text-accent-400">Strict JSON</div>
            <div className="text-xs text-slate-400 mt-1">Claude 4.6 Schemas</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-extrabold text-emerald-400">ATS 0-100</div>
            <div className="text-xs text-slate-400 mt-1">Resume Benchmarking</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-extrabold text-brand-400">JWT + RBAC</div>
            <div className="text-xs text-slate-400 mt-1">Role-Secured Modules</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Core Platform Modules</h2>
          <p className="text-3xl font-extrabold text-white">Engineered for Academic Rigour & Industry Placement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: AI Career Matching */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-brand-950/40">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Career Trajectory Matching</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analyzes your degree, branch, current skills, and ambitions using Claude Sonnet 4.6 to surface 3–5 tailored career paths with quantified match scores.
            </p>
          </div>

          {/* Card 2: Interactive Skill Roadmap */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-brand-950/40">
            <div className="w-12 h-12 rounded-2xl bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center justify-center mb-6">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Dynamic Milestone Roadmaps</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transforms detected skill gaps into sequenced milestones with verified free learning resources. Track completion live with dynamic progress recalculation.
            </p>
          </div>

          {/* Card 3: ATS Resume Critique */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-brand-950/40">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Automated Resume Evaluation</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Receives pasted resume text, calculates an ATS match score (0–100), extracts structural strengths, and outputs actionable improvement recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="bg-gradient-to-br from-slate-900 to-brand-950/40 border border-slate-800 rounded-3xl p-8 lg:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-xs font-semibold uppercase mb-4">
              <Layers className="w-3.5 h-3.5" /> Full Stack Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Production-Grade Architecture Built for Live Demos
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Built with an Express MVC backend, MongoDB Atlas cloud persistence, strict Claude Sonnet 4.6 JSON parsing with retry fallbacks, and a responsive Vite + React + Tailwind frontend.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">MongoDB Atlas</span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">Express.js REST API</span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">React 18 + Vite</span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">Tailwind CSS</span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">Anthropic Claude Sonnet 4.6</span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">Recharts Analytics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
