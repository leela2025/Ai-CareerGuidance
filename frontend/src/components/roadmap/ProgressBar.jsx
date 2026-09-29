import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export const ProgressBar = ({ progress = 0, completedCount = 0, totalCount = 0 }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Overall Roadmap Progress</h3>
            <p className="text-xs text-slate-400">
              {completedCount} of {totalCount} skill milestones completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progress === 100 && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Industry Placement
            </span>
          )}
          <span className="text-2xl font-extrabold text-white tracking-tight">{progress}%</span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
