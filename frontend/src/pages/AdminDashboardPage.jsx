import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  ShieldCheck,
  Users,
  Map,
  FileCheck,
  Award,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsCard } from '../components/admin/AnalyticsCard';
import { CareerCharts } from '../components/admin/CareerCharts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/stats');
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(
        err.response?.data?.message || 'Access denied. Administrator privileges required.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner message="Calculating institutional aggregations from MongoDB..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator Control Panel
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Institutional Career Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated MongoDB analytics across student cohorts, recommended careers, and skill deficits.
          </p>
        </div>

        <button
          onClick={fetchAdminStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {stats && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard
              title="Total Enrolled Students"
              value={stats.totalStudents || stats.totalUsers || 0}
              subtitle="Registered university profiles"
              icon={Users}
              color="brand"
            />
            <AnalyticsCard
              title="Active Roadmaps"
              value={stats.totalRoadmaps || 0}
              subtitle={`Avg Completion: ${stats.avgRoadmapProgress || 0}%`}
              icon={Map}
              color="accent"
            />
            <AnalyticsCard
              title="Resumes Audited"
              value={stats.totalResumes || 0}
              subtitle="Claude ATS evaluations"
              icon={FileCheck}
              color="emerald"
            />
            <AnalyticsCard
              title="Avg Resume Benchmark"
              value={`${stats.avgResumeScore || 0}/100`}
              subtitle="Overall cohort preparedness"
              icon={Award}
              color="amber"
            />
          </div>

          {/* Recharts Visualizations */}
          <CareerCharts
            topCareers={stats.topCareers || []}
            topSkillGaps={stats.topSkillGaps || []}
          />

          {/* Recent Registrations Table */}
          {stats.recentUsers && stats.recentUsers.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">
                Recent Student Registrations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.recentUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{u.email}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
