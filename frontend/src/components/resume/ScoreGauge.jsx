import React from 'react';
import { Award, CheckCircle, AlertTriangle } from 'lucide-react';

export const ScoreGauge = ({ score = 0, targetRole = 'Software Engineer' }) => {
  // SVG circular gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 85) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Strong ATS Match' };
    if (s >= 70) return { stroke: '#14b8a6', text: 'text-accent-400', badge: 'bg-accent-500/20 text-accent-300 border-accent-500/30', label: 'Competitive Profile' };
    if (s >= 55) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Needs Optimization' };
    return { stroke: '#f43f5e', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Significant Revision Required' };
  };

  const status = getColor(score);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="flex items-center gap-6">
        {/* SVG Circular Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={status.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${status.text}`}>{score}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">/ 100</span>
          </div>
        </div>

        <div>
          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-2 ${status.badge}`}>
            {status.label}
          </span>
          <h3 className="text-xl font-bold text-white">AI Resume Benchmark Score</h3>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated against industry standards for: <span className="text-brand-300 font-semibold">{targetRole}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
