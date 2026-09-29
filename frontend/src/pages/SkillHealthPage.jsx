import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Layers,
  Map,
  Sparkles,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const SkillHealthPage = () => {
  const [report, setReport] = useState(null);
  const [skillGraph, setSkillGraph] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('gaps'); // 'gaps' | 'all' | 'graph'

  useEffect(() => {
    fetchSkillHealth();
  }, []);

  const fetchSkillHealth = async () => {
    try {
      setLoading(true);
      const [reportRes, graphRes] = await Promise.allSettled([
        api.get('/skills/dependency-report'),
        api.get('/skills/graph'),
      ]);

      if (reportRes.status === 'fulfilled' && reportRes.value.data.success) {
        setReport(reportRes.value.data);
      }

      if (graphRes.status === 'fulfilled' && graphRes.value.data.success) {
        setSkillGraph(graphRes.value.data.skills || []);
      }
    } catch (err) {
      console.error('Failed to load skill health report:', err);
      setError('Could not generate full dependency report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message="Auditing roadmap prerequisite graph & foundations..." size="lg" />
      </div>
    );
  }

  const reports = report?.reports || [];
  const milestones = report?.milestones || [];
  const totalGaps = report?.totalGaps || 0;
  const highRiskCount = report?.highRiskCount || 0;
  const verifiedCount = report?.verifiedCount || 0;
  const completedCount = report?.completedCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-quick-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Foundational Reality-Check
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Skill Health & Dependency Report
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Detects when skills were marked or learned out of order. Shoring up missing fundamentals stops your roadmap from being a shaky checklist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/roadmap"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Map className="w-3.5 h-3.5" />
            <span>View Roadmap</span>
          </Link>
          <button
            onClick={fetchSkillHealth}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all"
            title="Refresh Audit"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-1">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Curriculum Goal</div>
          <div className="text-base font-bold text-white truncate">
            {report?.roadmapGoal || 'Software Engineer'}
          </div>
          <div className="text-[11px] text-zinc-500">{report?.totalMilestones || 0} Total Milestones</div>
        </div>

        <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-5 space-y-1">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Skills
          </div>
          <div className="text-2xl font-black text-emerald-300">{verifiedCount}</div>
          <div className="text-[11px] text-zinc-400">Proved via AI assessment</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-1">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> Completed
          </div>
          <div className="text-2xl font-black text-white">{completedCount}</div>
          <div className="text-[11px] text-zinc-400">Self-reported milestones</div>
        </div>

        <div
          className={`bg-zinc-900 border rounded-2xl p-5 space-y-1 ${
            totalGaps > 0 ? 'border-amber-500/50 bg-amber-950/20' : 'border-zinc-800'
          }`}
        >
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Prerequisite Gaps
          </div>
          <div className="text-2xl font-black text-amber-300">{totalGaps}</div>
          <div className="text-[11px] text-zinc-400">{highRiskCount} High Risk (Completed without base)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gaps'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Detected Foundation Gaps ({totalGaps})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Roadmap Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'graph'
              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Platform Skill Graph ({skillGraph.length} Skills)
        </button>
      </div>

      {/* Tab 1: Detected Gaps */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((gap, idx) => (
              <div
                key={idx}
                className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 transition-all hover:border-amber-500/50 shadow-lg shadow-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        gap.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {gap.severity === 'high' ? 'High Risk • Shaky Foundation' : 'Pending Foundation Gap'}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      Status: <strong className="text-white capitalize">{gap.status}</strong>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{gap.skillName}</span>
                  </h3>

                  <div className="text-xs text-amber-200/90 font-medium">
                    Missing Required Prerequisites:{' '}
                    <span className="text-amber-300 font-bold underline">
                      {gap.missingPrerequisites.join(', ')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-amber-500/40 pl-3">
                    "{gap.riskExplanation}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  {gap.missingPrerequisites[0] && (
                    <Link
                      to={`/skills/${encodeURIComponent(gap.missingPrerequisites[0])}/verify`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
                    >
                      <span>Shore Up {gap.missingPrerequisites[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <Link
                    to={`/skills/${encodeURIComponent(gap.skillName)}/verify`}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    <span>Prove {gap.skillName} Directly</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">All Foundations Verified!</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No foundational dependency gaps detected across your learning trajectory. Your completed skills rest on confirmed prerequisites.
              </p>
              <Link
                to="/roadmap"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                <span>Continue Roadmap Progression</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Roadmap Milestones */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div
              key={m._id || idx}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                    m.verified
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : m.status === 'completed'
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {m.order || idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{m.skillName}</h4>
                    {m.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3" /> Verified ✓
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 capitalize">{m.category} • Status: {m.status}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/skills/${encodeURIComponent(m.skillName)}/verify`}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{m.verified ? 'Retest Proof' : 'Prove It ✓'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Skill Graph Reference */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-400">
            Prerequisite relationship hierarchy used by the platform to protect learners from advancing without foundational competencies.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillGraph.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 font-bold px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">
                      {item.assessmentType}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{item.skill}</h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="text-[11px] text-zinc-400">
                    Prerequisites:{' '}
                    {item.prerequisites && item.prerequisites.length > 0 ? (
                      <span className="text-amber-300 font-medium">{item.prerequisites.join(', ')}</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">None (Foundational Entry Point)</span>
                    )}
                  </div>
                  <Link
                    to={`/skills/${encodeURIComponent(item.skill)}/verify`}
                    className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-brand-600 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Skill</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillHealthPage;
