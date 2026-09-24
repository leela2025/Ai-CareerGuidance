import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Sparkles,
  TrendingUp,
  Target,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';
import { CareerCard } from '../components/career/CareerCard';
import { SkillGapList } from '../components/career/SkillGapList';
import { LoadingSpinner, SkeletonCard } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const CareerGuidancePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [customGoal, setCustomGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch past suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/career/suggestions');
      if (res.data.success && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
        setActiveSuggestion(res.data.suggestions[0]);
      }
    } catch (err) {
      console.error('Failed to load career suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsAnalyzing(true);

    try {
      const res = await api.post('/career/analyze', {
        customGoal: customGoal.trim(),
      });

      if (res.data.success) {
        const newSuggestion = res.data.suggestion;
        setSuggestions([newSuggestion, ...suggestions]);
        setActiveSuggestion(newSuggestion);
        setSuccessMsg('Claude AI career analysis complete! Review your matched career paths below.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to complete AI career analysis. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectRoleForRoadmap = async (roleTitle) => {
    try {
      setIsAnalyzing(true);
      const gaps = activeSuggestion ? activeSuggestion.skillGaps : [];
      const res = await api.post('/roadmap/generate', {
        careerGoal: roleTitle,
        skillGaps: gaps,
      });

      if (res.data.success) {
        navigate('/roadmap');
      }
    } catch (err) {
      setError('Failed to generate roadmap for this role.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            AI Trajectory Optimization (Claude Sonnet 4.6)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Career Guidance & Gap Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Synthesizes your academic background ({profile?.educationLevel || 'Undergrad'}, {profile?.branch || 'CS'}) and current skills to recommend high-fit career roles and prioritize missing competencies.
          </p>
        </div>

        {/* Trigger Button */}
        <button
          onClick={() => handleRunAnalysis()}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all disabled:opacity-50 shrink-0"
        >
          {isAnalyzing ? (
            <LoadingSpinner message="Consulting Claude AI..." size="sm" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Career Analysis</span>
            </>
          )}
        </button>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Optional Custom Target Goal Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Target a specific domain? (e.g. Cloud Architect, AI Systems, Full Stack Developer)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            Refine Guidance
          </button>
        </form>
      </div>

      {isLoading ? (
        <SkeletonCard count={3} />
      ) : activeSuggestion ? (
        <div className="space-y-8">
          {/* Prioritized Skill Gaps */}
          <SkillGapList
            skillGaps={activeSuggestion.skillGaps}
            aiReasoning={activeSuggestion.aiReasoning}
          />

          {/* Suggested Career Paths */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Recommended Career Trajectories</h2>
                <p className="text-xs text-slate-400">
                  Generated on {new Date(activeSuggestion.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeSuggestion.suggestedPaths?.length || 0} Paths Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSuggestion.suggestedPaths?.map((path, idx) => (
                <CareerCard
                  key={idx}
                  path={path}
                  onSelectRole={handleSelectRoleForRoadmap}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Career Analysis Generated Yet</h3>
          <p className="text-sm text-slate-400">
            Click the button above to have Claude AI evaluate your current profile, identify hiring skill gaps, and match you to tech roles.
          </p>
          <button
            onClick={() => handleRunAnalysis()}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
          >
            Start Initial Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerGuidancePage;
