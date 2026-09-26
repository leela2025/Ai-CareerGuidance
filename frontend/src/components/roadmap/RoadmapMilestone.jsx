import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  PlayCircle,
  ExternalLink,
  BookOpen,
  Video,
  Code,
  FolderGit2,
  ShieldCheck,
} from 'lucide-react';

export const RoadmapMilestone = ({ milestone, onUpdateStatus, isUpdating }) => {
  const { skillId, skillName, category, status, resources = [], order } = milestone;

  const getStatusBadge = (st) => {
    switch (st) {
      case 'completed':
        return {
          bg: 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300',
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
          label: 'Completed',
        };
      case 'in-progress':
        return {
          bg: 'bg-brand-950/70 border-brand-700/60 text-brand-300',
          icon: <Clock className="w-4 h-4 text-brand-400 animate-spin" />,
          label: 'In Progress',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-400',
          icon: <PlayCircle className="w-4 h-4 text-slate-400" />,
          label: 'Pending',
        };
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-3.5 h-3.5 text-accent-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'project':
        return <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Code className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  const currentBadge = getStatusBadge(status);

  return (
    <div
      className={`relative bg-slate-900 border rounded-2xl p-6 transition-all duration-300 ${
        status === 'completed'
          ? 'border-emerald-500/40 bg-slate-900/90'
          : status === 'in-progress'
          ? 'border-brand-500/60 shadow-lg shadow-brand-950/60 ring-1 ring-brand-500/20'
          : 'border-slate-800'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        {/* Step and Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : status === 'in-progress'
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {order}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                {category}
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentBadge.bg}`}>
                {currentBadge.icon}
                {currentBadge.label}
              </span>
              {milestone.verified && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified ✓
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">{skillName}</h3>
          </div>
        </div>

        {/* Status Toggle & Prove-It Verification Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
          {/* Prove-It Verification CTA */}
          <Link
            to={`/skills/${encodeURIComponent(skillName)}/verify`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              milestone.verified
                ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-600/40'
                : 'bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border-brand-500/40 shadow-sm'
            }`}
            title="Take an AI-powered quiz or practical task to verify this skill"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{milestone.verified ? 'Retest Proof' : 'Prove It ✓'}</span>
          </Link>

          {status !== 'completed' && (
            <button
              disabled={isUpdating}
              onClick={() => onUpdateStatus(skillId, 'completed')}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all disabled:opacity-50"
            >
              Mark Completed
            </button>
          )}

          {status !== 'in-progress' && status !== 'completed' && (
            <button
              disabled={isUpdating}
              onClick={() => onUpdateStatus(skillId, 'in-progress')}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40 transition-all disabled:opacity-50"
            >
              Start Learning
            </button>
          )}

          {status === 'completed' && (
            <button
              disabled={isUpdating}
              onClick={() => onUpdateStatus(skillId, 'in-progress')}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Curated Resources */}
      {resources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Curated Free Learning Resources:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {getResourceIcon(res.type)}
                  <span className="text-xs font-medium truncate">{res.title}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-accent-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapMilestone;
