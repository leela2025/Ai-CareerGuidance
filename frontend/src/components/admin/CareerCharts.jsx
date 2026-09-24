import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const CareerCharts = ({ topCareers = [], topSkillGaps = [] }) => {
  // Palette for chart items
  const PIE_COLORS = ['#4f46e5', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{label || payload[0]?.name}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="font-semibold">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Bar Chart: Most Popular Career Recommendations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Most Recommended Career Tracks</h3>
        <p className="text-xs text-slate-400 mb-6">Aggregated across all student profiles analyzed</p>

        <div className="h-72 w-full">
          {topCareers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCareers} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="title"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="count" name="Times Suggested" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No career suggestion records available
            </div>
          )}
        </div>
      </div>

      {/* 2. Pie / Donut Chart: Most Frequent Skill Deficits */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Highest Frequency Skill Gaps</h3>
        <p className="text-xs text-slate-400 mb-6">Crucial topics where students need learning roadmaps</p>

        <div className="h-72 w-full">
          {topSkillGaps.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topSkillGaps}
                  dataKey="count"
                  nameKey="skill"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {topSkillGaps.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No skill gap records available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerCharts;
