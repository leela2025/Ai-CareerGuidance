import React from 'react';
import { CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';

export const FeedbackList = ({ strengths = [], improvements = [], summary = '' }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-brand-950/40 via-slate-900 to-accent-950/30 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2 text-brand-300 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-accent-400" />
            Executive Assessment
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-base">Key Strengths Detected</h4>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific strengths recorded.</p>
          )}
        </div>

        {/* Priority Improvements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-base">High-Impact Recommendations</h4>
          </div>
          {improvements.length > 0 ? (
            <ul className="space-y-3">
              {improvements.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific improvement areas found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackList;
