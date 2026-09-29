import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Sparkles,
  Map,
  FileCheck,
  TrendingUp,
  ArrowRight,
  User,
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
  GitFork,
  Split,
  Users,
  MessageSquare,
  Rocket,
  Compass,
  ShieldCheck,
  ShieldAlert,
  FolderGit2,
} from 'lucide-react';
import { LoadingSpinner, SkeletonCard } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { shouldAnimateFirstVisit } from '../lib/motionVariants';

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [careerSuggestions, setCareerSuggestions] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [journey, setJourney] = useState(null);
  const [skillStats, setSkillStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Purposeful motion: only play entrance animation once per session
  const [shouldAnimate] = useState(() => shouldAnimateFirstVisit('dashboard'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch roadmap, career suggestions, resume history, journey, skill stats, and projects concurrently
        const [roadmapRes, careerRes, resumeRes, journeyRes, skillRes, projectRes] =
          await Promise.allSettled([
            api.get('/roadmap'),
            api.get('/career/suggestions'),
            api.get('/resume/history'),
            api.get('/journey'),
            api.get('/skills/stats'),
            api.get('/projects/mine'),
          ]);

        if (roadmapRes.status === 'fulfilled' && roadmapRes.value.data.success) {
          setRoadmap(roadmapRes.value.data.roadmap);
        }

        if (careerRes.status === 'fulfilled' && careerRes.value.data.success) {
          setCareerSuggestions(careerRes.value.data.suggestions || []);
        }

        if (journeyRes.status === 'fulfilled' && journeyRes.value.data.success) {
          setJourney(journeyRes.value.data.journey);
        }

        if (resumeRes.status === 'fulfilled' && resumeRes.value.data.success) {
          const list = resumeRes.value.data.history || [];
          if (list.length > 0) {
            setLatestResume(list[0]);
          }
        }

        if (skillRes.status === 'fulfilled' && skillRes.value.data.success) {
          setSkillStats(skillRes.value.data);
        }

        if (projectRes.status === 'fulfilled' && projectRes.value.data.success) {
          setProjects(projectRes.value.data.projects || []);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load some dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner message="Aggregating student analytics & AI suggestions..." size="lg" />
        <SkeletonCard count={3} />
      </div>
    );
  }

  const latestPaths = careerSuggestions.length > 0 ? careerSuggestions[0].suggestedPaths : [];
  const completedMilestones = roadmap?.milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalMilestones = roadmap?.milestones?.length || 0;
  const isBrandNewUser = !roadmap && latestPaths.length === 0 && !latestResume;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 ${shouldAnimate ? 'animate-quick-fade' : ''}`}>
      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase mb-3">
            <GraduationCap className="w-4 h-4 text-accent-400" />
            {profile?.educationLevel || 'Undergraduate'} • {profile?.branch || 'Computer Science'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-brand-300">{user?.name}</span>!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Track your personalized AI milestones, bridge detected skill gaps, and optimize your resume for high-demand placements.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/journey"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all"
          >
            <GitFork className="w-4 h-4" />
            <span>Lifelong Journey</span>
          </Link>
          <Link
            to="/career-guidance"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold text-sm shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Match</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors"
          >
            <User className="w-4 h-4" /> Profile
          </Link>
        </div>
      </div>

      {/* Brand-New User Quick-Start Guide (Clarity for First-Time Students) */}
      {isBrandNewUser && (
        <div className="bg-gradient-to-r from-brand-950/40 via-zinc-900 to-accent-950/20 border border-brand-500/40 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-accent-500/20 text-accent-300 border border-accent-500/30">
              <Rocket className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Guided 3-Step Setup</h2>
              <p className="text-xs text-zinc-400">
                Welcome to CareerCompassAI! Complete these 3 core actions to unlock your personalized career intelligence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Step 1 */}
            <Link
              to="/career-guidance"
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-accent-500/50 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400 font-bold bg-accent-500/10 px-2 py-0.5 rounded-full border border-accent-500/20">
                  Step 1 • 2 Mins
                </span>
                <h3 className="text-sm font-bold text-white mt-2 group-hover:text-accent-300 transition-colors">
                  Run AI Career Match
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Discover target tech roles mapped to your life stage, skills, and academic interests.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-accent-400 group-hover:text-accent-300">
                <span>Start AI Match</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Step 2 */}
            <Link
              to="/roadmap"
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-accent-500/50 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400 font-bold bg-accent-500/10 px-2 py-0.5 rounded-full border border-accent-500/20">
                  Step 2 • Action Plan
                </span>
                <h3 className="text-sm font-bold text-white mt-2 group-hover:text-accent-300 transition-colors">
                  Build Milestone Roadmap
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Get a step-by-step checklist of core skills, projects, and free high-yield learning resources.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-accent-400 group-hover:text-accent-300">
                <span>Generate Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Step 3 */}
            <Link
              to="/resume-analyzer"
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                  Step 3 • Benchmark
                </span>
                <h3 className="text-sm font-bold text-white mt-2 group-hover:text-brand-300 transition-colors">
                  Scan Resume with ATS
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Check your ATS compliance score and identify exact missing keywords before applying.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                <span>Audit Resume</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Lifelong Career Navigator Active Path Widget with "Not Satisfied?" Branch Prompt */}
      {journey?.stages?.length > 0 && (
        <div className="bg-gradient-to-r from-brand-950/40 via-zinc-900 to-zinc-950 border border-brand-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-accent-500/20 text-accent-300 border border-accent-500/30 inline-flex">
                <GitFork className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-400">
                Lifelong Career Navigator • Stage {journey.stages.length}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {journey.stages[journey.stages.length - 1].lifeStageAtTime}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {journey.stages[journey.stages.length - 1].chosenPath?.title
                ? `Active Track: ${journey.stages[journey.stages.length - 1].chosenPath.title}`
                : journey.stages[journey.stages.length - 1].decisionPoint}
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {journey.stages[journey.stages.length - 1].chosenPath?.reasoning ||
                'You have an active decision point waiting in your lifelong journey. Choose a path or branch alternatives.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/journey?branch=true"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
            >
              <Split className="w-3.5 h-3.5 text-amber-400" />
              <span>Not feeling this path? Explore alternatives</span>
            </Link>
            <Link
              to="/journey"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <span>View Full Journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Human Guidance Layer Contextual Prompt Banner */}
      <div className="bg-gradient-to-r from-brand-950/40 via-accent-950/20 to-zinc-900 border border-brand-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent-500/20 text-accent-300 border border-accent-500/30 inline-flex">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-400">
              Human Guidance Layer • Peer & Expert Mentorship
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Want to talk to someone who's been through this?
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            AI gives structured, data-driven roadmaps; real people offer the human trust layer.
            Connect 1-on-1 with verified counsellors or relatable peers who walked this exact path.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/mentors"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Explore Mentors & Peers</span>
          </Link>
          <Link
            to="/connections"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent-400" />
            <span>My Connections</span>
          </Link>
        </div>
      </div>

      {/* Verification Status & Reality-Check Layer Widget */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-brand-950/30 border border-brand-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-500/20 text-accent-300 border border-accent-500/30">
              <ShieldCheck className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-400">
                Credibility & Proof Layer • Verification Summary
              </div>
              <h3 className="text-lg font-bold text-white">
                Honest Verification & Interview Readiness
              </h3>
            </div>
          </div>

          <Link
            to="/skill-health"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/40 text-accent-300 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Prerequisite Health Report</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Item 1: Roadmap Skill Proof */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="font-mono uppercase font-bold text-brand-400">Skill Proof</span>
                <span className="text-white font-bold">
                  {skillStats ? `${skillStats.verifiedMilestones} of ${skillStats.totalMilestones}` : '0 of 0'} Verified ✓
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${skillStats?.verificationPercentage || 0}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Skills confirmed via AI assessments rather than self-reported checkboxes.
              </p>
            </div>
            <Link
              to="/roadmap"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Prove roadmap skills</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Item 2: Resume Defense Status */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="font-mono uppercase font-bold text-accent-400">Resume Defense</span>
                {latestResume?.defenseResult?.overallCredibilityScore ? (
                  <span className="font-bold text-accent-300">
                    {latestResume.defenseResult.overallCredibilityScore}/100 Credibility
                  </span>
                ) : (
                  <span className="text-zinc-500">Not Tested</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                {latestResume?.defenseResult?.overallCredibilityScore
                  ? 'Claims defended against pointed engineering hiring manager probing.'
                  : 'Can you defend every metric and line? Test your resume under interviewer scrutiny.'}
              </p>
            </div>
            <Link
              to="/resume-analyzer"
              className="text-xs font-semibold text-accent-400 hover:text-accent-300 flex items-center gap-1"
            >
              <span>{latestResume?.defenseResult?.overallCredibilityScore ? 'View defense report' : 'Take Defense Test'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Item 3: Project Mock Interview Readiness */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="font-mono uppercase font-bold text-brand-400">Project Scrutiny</span>
                <span className="font-bold text-white">
                  {projects.filter((p) => p.interviewResult?.completedAt).length} Interview Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                {projects.length > 0
                  ? `${projects.length} project(s) submitted for scope consistency and mock interviews.`
                  : 'Submit a project to sanity-check complexity and practice mock interviews.'}
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>{projects.length > 0 ? 'Manage portfolio projects' : 'Submit project'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Learning Roadmap */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">Active Curriculum</span>
              <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                <Map className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {roadmap ? roadmap.careerGoal : 'No Active Roadmap'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {roadmap
                ? `${completedMilestones} of ${totalMilestones} milestones completed`
                : 'Run career guidance to generate an ordered milestone curriculum.'}
            </p>

            {roadmap && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Overall Progress</span>
                  <span>{roadmap.overallProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full transition-all duration-500"
                    style={{ width: `${roadmap.overallProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Link
            to="/roadmap"
            className="mt-4 flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 group-hover:text-white transition-colors"
          >
            <span>{roadmap ? 'Continue Learning' : 'Generate Roadmap'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 2: AI Career Matches */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">AI Guidance</span>
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {latestPaths.length > 0 ? `${latestPaths.length} Roles Identified` : 'Explore Your Career Paths'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {latestPaths.length > 0
                ? `Top Match: ${latestPaths[0].title} (${latestPaths[0].matchScore}%)`
                : 'Send your current skills to Claude Sonnet 4.6 for tailored matches.'}
            </p>

            {latestPaths.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {latestPaths.slice(0, 2).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="font-medium text-slate-200 truncate pr-2">{p.title}</span>
                    <span className="font-bold text-brand-300">{p.matchScore}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/career-guidance"
            className="mt-4 flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 group-hover:text-white transition-colors"
          >
            <span>View All Recommendations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 3: Resume Benchmark */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">ATS Resume</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-brand-400 border border-emerald-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {latestResume ? `${latestResume.aiScore}/100 Benchmark` : 'Resume Evaluation'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {latestResume
                ? `Evaluated for: ${latestResume.targetRole}`
                : 'Paste your resume to test ATS compliance and get keyword suggestions.'}
            </p>

            {latestResume && (
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
                <span className="font-semibold text-brand-300">Top Strength: </span>
                {latestResume.strengths?.[0] || 'Clean project presentation.'}
              </div>
            )}
          </div>

          <Link
            to="/resume-analyzer"
            className="mt-4 flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 group-hover:text-white transition-colors"
          >
            <span>{latestResume ? 'Re-analyze Resume' : 'Analyze Resume Now'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Current Skills & Profile Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Your Current Technical Stack</h3>
              <p className="text-xs text-slate-400">Skills registered in your profile</p>
            </div>
          </div>
          <Link to="/profile" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
            Edit in Profile →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {profile?.currentSkills && profile.currentSkills.length > 0 ? (
            profile.currentSkills.map((s, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
              >
                {s}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">
              No skills added yet. Complete your profile to receive tailored recommendations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
