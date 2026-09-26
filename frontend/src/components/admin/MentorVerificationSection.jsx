import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Briefcase,
  Mail,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertBanner } from '../common/AlertBanner';

export const MentorVerificationSection = () => {
  const [subTab, setSubTab] = useState('pending'); // 'pending' | 'all'
  const [stats, setStats] = useState({
    totalMentors: 0,
    totalExperts: 0,
    totalPeers: 0,
    pendingCount: 0,
    verifiedExpertsCount: 0,
    rejectedCount: 0,
  });
  const [pendingList, setPendingList] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Rejection modal/state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Expandable bio state
  const [expandedBios, setExpandedBios] = useState({});

  // Search & Filter for All Mentors
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expert' | 'peer'

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [pendingRes, allRes] = await Promise.all([
        api.get('/admin/mentors/pending'),
        api.get('/admin/mentors/all'),
      ]);

      if (pendingRes.data.success) {
        setPendingList(pendingRes.data.mentors || []);
      }
      if (allRes.data.success) {
        setAllMentors(allRes.data.mentors || []);
        if (allRes.data.stats) {
          setStats(allRes.data.stats);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentor verification queue.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBio = (id) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Approve a pending expert mentor
  const handleApprove = async (id, applicantName) => {
    try {
      setActionLoadingId(id);
      setError('');
      setSuccessMsg('');

      const res = await api.patch(`/admin/mentors/${id}/verify`, { verified: true });
      if (res.data.success) {
        // Optimistic UI state update: remove from pending list with animation
        setPendingList((prev) => prev.filter((m) => m.id !== id));
        setAllMentors((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, verified: true, status: 'approved', verifiedAt: new Date() } : m
          )
        );
        setStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          verifiedExpertsCount: prev.verifiedExpertsCount + 1,
        }));

        setSuccessMsg(
          `Verified! ${applicantName || 'Mentor'} is now approved as a Verified Expert and live in the public directory.`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve mentor application.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open rejection dialog
  const openRejectDialog = (id) => {
    setRejectingId(id);
    setRejectionReason('Bio and experience details need further verification or specificity.');
  };

  // Confirm rejection
  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    try {
      setActionLoadingId(rejectingId);
      setError('');
      setSuccessMsg('');

      const res = await api.patch(`/admin/mentors/${rejectingId}/reject`, {
        rejectionReason,
      });

      if (res.data.success) {
        const rejectedMentor = pendingList.find((m) => m.id === rejectingId);
        const name = rejectedMentor?.user?.name || 'Applicant';

        setPendingList((prev) => prev.filter((m) => m.id !== rejectingId));
        setAllMentors((prev) =>
          prev.map((m) =>
            m.id === rejectingId
              ? {
                  ...m,
                  verified: false,
                  status: 'rejected',
                  rejectionReason,
                  rejectedAt: new Date(),
                }
              : m
          )
        );
        setStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          rejectedCount: prev.rejectedCount + 1,
        }));

        setSuccessMsg(
          `Application rejected. An in-app notification has been dispatched to ${name}.`
        );
        setRejectingId(null);
        setRejectionReason('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject mentor application.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered All Mentors
  const filteredAllMentors = allMentors.filter((m) => {
    const matchesSearch =
      !searchQuery.trim() ||
      m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.companyOrCollege?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.expertiseTags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && (m.status === 'approved' || m.verified)) ||
      (statusFilter === 'pending' && (!m.verified || m.status === 'pending') && m.status !== 'rejected') ||
      (statusFilter === 'rejected' && m.status === 'rejected');

    const matchesType = typeFilter === 'all' || m.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* TOP STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card (Urgent / Highlighted) */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            stats.pendingCount > 0
              ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/20'
              : 'bg-zinc-900/60 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Pending Verification
            </span>
            {stats.pendingCount > 0 ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                stats.pendingCount > 0 ? 'text-amber-400' : 'text-zinc-200'
              }`}
            >
              {stats.pendingCount}
            </span>
            <span className="text-xs text-zinc-400">
              {stats.pendingCount === 1 ? 'Expert requires audit' : 'Experts require audit'}
            </span>
          </div>
        </div>

        {/* Verified Experts */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Verified Experts
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {stats.verifiedExpertsCount}
            </span>
            <span className="text-xs text-zinc-400">Credentialed</span>
          </div>
        </div>

        {/* Peer Mentors */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Peer Motivators
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300">
              {stats.totalPeers}
            </span>
            <span className="text-xs text-zinc-400">Auto-approved</span>
          </div>
        </div>

        {/* Total Mentors */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Total Network
            </span>
            <ShieldCheck className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {stats.totalMentors}
            </span>
            <span className="text-xs text-zinc-400">Registered mentors</span>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'pending'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review Queue</span>
            {pendingList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-zinc-950">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'all'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Mentors Audit ({allMentors.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 hidden sm:inline-block font-mono">
          Trust & Verification Protocol • Enforced by Administrator
        </span>
      </div>

      {/* VIEW 1: PENDING QUEUE */}
      {subTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" text="Loading pending expert applications..." />
            </div>
          ) : pendingList.length === 0 ? (
            /* Clean Empty State */
            <div className="text-center py-16 px-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                All caught up — no pending mentor applications
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                All expert applications have been reviewed. When new industry leaders apply at{' '}
                <span className="text-purple-300 font-mono">/mentors/apply</span>, they will appear
                here for credential evaluation.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubTab('all')}
                className="text-xs"
              >
                View Approved Mentors Directory
              </Button>
            </div>
          ) : (
            /* Pending Queue Cards */
            <div className="space-y-4">
              {pendingList.map((app) => {
                const isExpanded = !!expandedBios[app.id];
                const isActioning = actionLoadingId === app.id;

                return (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-zinc-900/70 hover:border-amber-500/50 backdrop-blur-md shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Applicant Bio & Credentials */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold font-mono text-sm">
                            {app.user?.name ? app.user.name[0].toUpperCase() : 'M'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-white">
                                {app.user?.name || 'Applicant'}
                              </h4>
                              <Badge
                                variant="outline"
                                className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] font-mono uppercase"
                              >
                                Pending Expert
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Mail className="w-3 h-3 text-zinc-500" />
                                {app.user?.email}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Calendar className="w-3 h-3 text-zinc-500" />
                                Applied{' '}
                                {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Headline */}
                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                            Claimed Headline & Credentials:
                          </span>
                          <p className="text-sm font-semibold text-white">{app.headline}</p>
                        </div>

                        {/* Meta info chips */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {app.companyOrCollege && (
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 flex items-center gap-1.5 font-medium">
                              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                              {app.companyOrCollege}
                            </span>
                          )}
                          {app.yearsOfExperience && (
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 flex items-center gap-1.5 font-medium">
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              {app.yearsOfExperience}
                            </span>
                          )}
                          {app.availability && (
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {app.availability}
                            </span>
                          )}
                        </div>

                        {/* Expertise Tags */}
                        {app.expertiseTags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {app.expertiseTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/60 text-purple-300 text-xs font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bio Section with Expand/Collapse */}
                        <div className="pt-2">
                          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                            Full Submitted Bio:
                          </span>
                          <p
                            className={`text-xs text-zinc-300 leading-relaxed ${
                              !isExpanded ? 'line-clamp-2' : ''
                            }`}
                          >
                            {app.bio}
                          </p>
                          {app.bio?.length > 140 && (
                            <button
                              onClick={() => toggleBio(app.id)}
                              className="text-xs text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <span>{isExpanded ? 'Show less' : 'Read full bio'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: Approve & Reject Action Buttons */}
                      <div className="flex sm:flex-col items-center gap-2.5 pt-2 sm:pt-0 sm:min-w-[130px]">
                        <Button
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleApprove(app.id, app.user?.name)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActioning}
                          onClick={() => openRejectDialog(app.id)}
                          className="w-full border-rose-800/60 text-rose-300 hover:bg-rose-950/40 hover:border-rose-600 hover:text-white text-xs h-9 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>

                    {/* Inline Rejection Reason Panel (if active) */}
                    {rejectingId === app.id && (
                      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3 animate-quick-fade">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Specify rejection feedback (sent via notification to applicant):
                          </span>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Bio too brief, please provide verifiable industry experience or LinkedIn"
                          className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRejectingId(null)}
                            className="text-xs h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={isActioning || !rejectionReason.trim()}
                            onClick={handleConfirmReject}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 font-bold"
                          >
                            {isActioning ? 'Rejecting...' : 'Confirm Rejection'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ALL MENTORS AUDIT TABLE */}
      {subTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors by name, company, skill..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved / Verified</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="expert">Expert Mentors</option>
                <option value="peer">Peer Motivators</option>
              </select>
            </div>
          </div>

          {/* Audit List */}
          {filteredAllMentors.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No mentors match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Mentor / Applicant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status & Trust Badge</th>
                    <th className="py-3 px-4">Organization & Experience</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredAllMentors.map((m) => {
                    const isVerified = m.verified;
                    const isRejected = m.status === 'rejected';
                    const isPending = !isVerified && !isRejected;

                    return (
                      <tr key={m.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{m.user?.name || 'Mentor'}</div>
                          <div className="text-zinc-400 text-[11px] font-mono">{m.user?.email}</div>
                          <div className="text-zinc-500 text-[10px] truncate max-w-[280px] mt-0.5">
                            {m.headline}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              m.type === 'expert'
                                ? 'border-purple-500/40 text-purple-300 bg-purple-500/10 text-[10px]'
                                : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 text-[10px]'
                            }
                          >
                            {m.type === 'expert' ? 'Expert Mentor' : 'Peer Motivator'}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Expert ✓
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                              <Clock className="w-3.5 h-3.5" /> Pending Audit
                            </span>
                          )}
                          {isRejected && m.rejectionReason && (
                            <div className="text-[10px] text-zinc-500 mt-1 italic">
                              "{m.rejectionReason}"
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-zinc-300">
                          <div>{m.companyOrCollege || 'Independent'}</div>
                          <div className="text-zinc-500 text-[11px]">
                            {m.yearsOfExperience || 'Experienced'}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(m.id, m.user?.name)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2.5"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectDialog(m.id)}
                                className="border-rose-700/60 text-rose-300 text-[11px] h-7 px-2"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : isRejected ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(m.id, m.user?.name)}
                              className="text-[11px] h-7 px-2.5 border-zinc-700 hover:border-emerald-500 text-zinc-300 hover:text-emerald-400"
                            >
                              Re-verify
                            </Button>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">Live</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorVerificationSection;
