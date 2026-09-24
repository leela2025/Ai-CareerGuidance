import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

export const SkillGapList = ({ skillGaps = [], aiReasoning = '' }) => {
  if (!skillGaps || skillGaps.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Prioritized Skill-Gap Analysis</h3>
          <p className="text-xs text-slate-400">High-leverage competencies required to reach top hiring percentile</p>
        </div>
      </div>

      {aiReasoning && (
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 leading-relaxed italic">
          "{aiReasoning}"
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Identified Skill Deficits to Bridge:
        </h4>
        <div className="flex flex-wrap gap-2">
          {skillGaps.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-amber-500/30 text-amber-200 text-sm font-medium shadow-sm hover:border-amber-400/60 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{skill}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGapList;
