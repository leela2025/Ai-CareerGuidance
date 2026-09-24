import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Map,
  Sparkles,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  CircleDashed,
  ArrowRight,
} from 'lucide-react';
import { RoadmapMilestone } from '../components/roadmap/RoadmapMilestone';
import { ProgressBar } from '../components/roadmap/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'in-progress' | 'completed'
  const [loading, setLoading] = useState(true);
  const [updatingSkillId, setUpdatingSkillId] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmap');
      if (res.data.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setError('Could not retrieve learning roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (skillId, newStatus) => {
    setUpdatingSkillId(skillId);
    setError('');

    try {
      const res = await api.patch(`/roadmap/${skillId}`, { status: newStatus });
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        setSuccessMsg(`Milestone updated to '${newStatus}'!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update milestone status.');
    } finally {
      setUpdatingSkillId(null);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const res = await api.post('/roadmap/generate', {
        careerGoal: roadmap?.careerGoal || 'Full Stack Cloud Developer',
      });
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        setSuccessMsg('Fresh AI curriculum generated successfully!');
      }
    } catch (err) {
      setError('Failed to regenerate roadmap from AI service.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading your customized learning curriculum..." size="lg" />
      </div>
    );
  }

  const milestones = roadmap?.milestones || [];
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'in-progress').length;
  const pendingCount = milestones.filter((m) => m.status === 'pending').length;

  const filteredMilestones = milestones.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-xs font-semibold uppercase mb-2">
            <Map className="w-3.5 h-3.5" />
            Curriculum Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personalized Skill Roadmap
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Target Career Objective:{' '}
            <span className="text-brand-300 font-bold">
              {roadmap ? roadmap.careerGoal : 'General Software Engineering'}
            </span>
          </p>
        </div>

        {roadmap && (
          <button
            onClick={handleRegenerateRoadmap}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Roadmap</span>
          </button>
        )}
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {roadmap ? (
        <>
          {/* Overall Progress Meter */}
          <ProgressBar
            progress={roadmap.overallProgress}
            completedCount={completedCount}
            totalCount={milestones.length}
          />

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({milestones.length})
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'in-progress'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3 h-3 text-brand-300" />
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'pending'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CircleDashed className="w-3 h-3 text-slate-400" />
                Pending ({pendingCount})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Interactive Kanban Timeline • Click to mark progress
            </span>
          </div>

          {/* Milestones List */}
          <div className="space-y-4">
            {filteredMilestones.length > 0 ? (
              filteredMilestones.map((milestone) => (
                <RoadmapMilestone
                  key={milestone.skillId}
                  milestone={milestone}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updatingSkillId === milestone.skillId}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No milestones match the selected filter.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center justify-center mx-auto">
            <Map className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-sm text-slate-400">
            Generate an AI career analysis first or click below to synthesize a customized roadmap directly.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/career-guidance"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
            >
              Analyze Career First
            </Link>
            <button
              onClick={handleRegenerateRoadmap}
              disabled={isRegenerating}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              Create Default Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
