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
} from 'lucide-react';
import { LoadingSpinner, SkeletonCard } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [careerSuggestions, setCareerSuggestions] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch roadmap, career suggestions, and resume history concurrently
        const [roadmapRes, careerRes, resumeRes] = await Promise.allSettled([
          api.get('/roadmap'),
          api.get('/career/suggestions'),
          api.get('/resume/history'),
        ]);

        if (roadmapRes.status === 'fulfilled' && roadmapRes.value.data.success) {
          setRoadmap(roadmapRes.value.data.roadmap);
        }

        if (careerRes.status === 'fulfilled' && careerRes.value.data.success) {
          setCareerSuggestions(careerRes.value.data.suggestions || []);
        }

        if (resumeRes.status === 'fulfilled' && resumeRes.value.data.success) {
          const list = resumeRes.value.data.history || [];
          if (list.length > 0) {
            setLatestResume(list[0]);
          }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            to="/career-guidance"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold text-sm shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Career Match</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors"
          >
            <User className="w-4 h-4" /> Edit Profile
          </Link>
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
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ATS Resume</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
                <span className="font-semibold text-emerald-300">Top Strength: </span>
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
