import React from 'react';
import { ArrowRight, TrendingUp, Briefcase, Award } from 'lucide-react';

export const CareerCard = ({ path, onSelectRole }) => {
  const { title, matchScore, description, targetRoles = [], marketDemand } = path;

  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 80) return 'text-accent-400 border-accent-500/30 bg-accent-500/10';
    if (score >= 70) return 'text-brand-400 border-brand-500/30 bg-brand-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getDemandBadge = (demand) => {
    switch (demand) {
      case 'Exponential':
      case 'Very High':
        return 'bg-purple-950/60 text-purple-300 border-purple-800';
      case 'High':
        return 'bg-accent-950/60 text-accent-300 border-accent-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-950/50 group">
      <div>
        {/* Top Header with Title and Match Score */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-2 ${getDemandBadge(marketDemand)}`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {marketDemand} Demand
            </span>
            <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
              {title}
            </h3>
          </div>

          {/* Match Score Ring / Badge */}
          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${getScoreColor(matchScore)} shrink-0`}>
            <span className="text-xl font-extrabold">{matchScore}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Match</span>
          </div>
        </div>

        {/* AI Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {description}
        </p>

        {/* Target Roles */}
        {targetRoles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Applicable Industry Roles:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {targetRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => onSelectRole && onSelectRole(title)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600/20 hover:bg-brand-600 border border-brand-500/30 hover:border-brand-500 text-brand-300 hover:text-white font-medium text-sm transition-all shadow-md group/btn"
        >
          <span>Generate Roadmap for this Role</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CareerCard;
