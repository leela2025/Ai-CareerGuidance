import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
  ShieldCheck,
  Users,
  Map,
  FileCheck,
  Award,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Heart,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Clock,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { AnalyticsCard } from '../components/admin/AnalyticsCard';
import { CareerCharts } from '../components/admin/CareerCharts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { StarRating } from '../components/common/StarRating';
import { MentorVerificationSection } from '../components/admin/MentorVerificationSection';

export const AdminDashboardPage = ({ defaultTab }) => {
  const location = useLocation();
  const initialTab =
    defaultTab || (location.pathname.includes('/mentors') ? 'mentors' : 'analytics');
  const [activeTab, setActiveTab] = useState(initialTab); // 'analytics' | 'stories' | 'feedback' | 'mentors'
  const [pendingMentorsCount, setPendingMentorsCount] = useState(0);

  // Tab 1: Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Tab 2: Stories Moderation
  const [stories, setStories] = useState([]);
  const [storyFilter, setStoryFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [loadingStories, setLoadingStories] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Tab 3: Platform Feedback
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAdminStats();
    fetchPendingMentorsCount();
  }, []);

  const fetchPendingMentorsCount = async () => {
    try {
      const res = await api.get('/admin/mentors/pending');
      if (res.data.success) {
        setPendingMentorsCount(res.data.count || res.data.mentors?.length || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (activeTab === 'stories') {
      fetchStories();
    } else if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab, storyFilter]);

  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      setError('');
      const res = await api.get('/admin/stats');
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Access denied. Administrator privileges required.'
      );
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      setError('');
      const res = await api.get(`/admin/stories/pending?status=${storyFilter}`);
      if (res.data?.success) {
        setStories(res.data.stories || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stories for moderation.');
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoadingFeedback(true);
      setError('');
      const [listRes, sumRes] = await Promise.all([
        api.get('/admin/feedback/platform'),
        api.get('/feedback/platform/summary'),
      ]);
      if (listRes.data?.success) {
        setFeedbackList(listRes.data.feedback || []);
      }
      if (sumRes.data?.success) {
        setFeedbackSummary(sumRes.data.summary);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform feedback.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleModerateStory = async (storyId, newStatus, featuredVal) => {
    try {
      setActionLoadingId(storyId);
      const payload = {};
      if (newStatus) payload.status = newStatus;
      if (featuredVal !== undefined) payload.featured = featuredVal;

      const res = await api.patch(`/admin/stories/${storyId}/moderate`, payload);
      if (res.data?.success) {
        setSuccessMsg(`Story successfully updated to ${newStatus || 'modified'}.`);
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? {
                  ...s,
                  status: newStatus || s.status,
                  featured: featuredVal !== undefined ? featuredVal : s.featured,
                }
              : s
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to moderate story.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator Control Panel
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Institutional Career Intelligence & Moderation
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Oversee student analytics, review community success stories, and monitor user feedback.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'analytics') fetchAdminStats();
            else if (activeTab === 'stories') fetchStories();
            else fetchFeedback();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {successMsg && (
        <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Institutional Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'stories'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Story Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'feedback'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Platform Feedback</span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'mentors'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Mentor Verification</span>
          {pendingMentorsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-zinc-950 animate-pulse">
              {pendingMentorsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INSTITUTIONAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <>
          {loadingStats ? (
            <LoadingSpinner size="lg" text="Calculating institutional aggregations..." />
          ) : stats ? (
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
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4">
                    Recent Student Registrations
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                        <tr>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Joined Date</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {stats.recentUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                            <td className="py-3 px-4 text-zinc-400 font-mono">{u.email}</td>
                            <td className="py-3 px-4 text-zinc-400">
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
          ) : null}
        </>
      )}

      {/* TAB 2: STORY MODERATION */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Filter Sub-nav */}
          <div className="flex items-center gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setStoryFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  storyFilter === f
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f} Stories
              </button>
            ))}
          </div>

          {loadingStories ? (
            <LoadingSpinner size="lg" text="Loading stories for moderation..." />
          ) : stories.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-white">No {storyFilter} stories</h3>
              <p className="text-xs text-zinc-400 mt-1">
                All community submissions in this queue are clear.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {story.author?.name}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          ({story.author?.email})
                        </span>
                        <Badge
                          className={`text-[10px] px-2 py-0.5 ${
                            story.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : story.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {story.status}
                        </Badge>
                        {story.featured && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px]">
                            ★ Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Submitted: {new Date(story.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerateStory(story.id, null, !story.featured)}
                        className={`text-xs border-zinc-700 ${
                          story.featured ? 'text-amber-400 border-amber-500/30' : 'text-zinc-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        {story.featured ? 'Unpin' : 'Feature Story'}
                      </Button>

                      {story.status !== 'approved' && (
                        <Button
                          size="sm"
                          disabled={actionLoadingId === story.id}
                          onClick={() => handleModerateStory(story.id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {story.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoadingId === story.id}
                          onClick={() => handleModerateStory(story.id, 'rejected')}
                          className="border-zinc-800 text-rose-400 hover:bg-rose-950/30 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{story.title}</h3>
                    {(story.beforeAfter?.before || story.beforeAfter?.after) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 mb-3 text-xs">
                        {story.beforeAfter.before && (
                          <div>
                            <span className="text-rose-400 font-bold block mb-0.5">Starting:</span>
                            <span className="text-zinc-300">{story.beforeAfter.before}</span>
                          </div>
                        )}
                        {story.beforeAfter.after && (
                          <div>
                            <span className="text-emerald-400 font-bold block mb-0.5">Achieved:</span>
                            <span className="text-emerald-300">{story.beforeAfter.after}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/50">
                      {story.storyText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLATFORM FEEDBACK REVIEW */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Summary Metric Header */}
          {feedbackSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div>
                <span className="text-xs text-zinc-400 font-mono uppercase block mb-1">
                  Overall Average
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-white">
                    {feedbackSummary.averageOverall || '0.0'}
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  {feedbackSummary.totalCount} total submissions
                </p>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase text-purple-400 block mb-0.5">
                  AI Accuracy
                </span>
                <span className="text-xl font-bold text-white">
                  {feedbackSummary.averageFeatures?.aiAccuracy
                    ? `${feedbackSummary.averageFeatures.aiAccuracy} / 5.0`
                    : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase text-emerald-400 block mb-0.5">
                  Roadmap Value
                </span>
                <span className="text-xl font-bold text-white">
                  {feedbackSummary.averageFeatures?.roadmapUsefulness
                    ? `${feedbackSummary.averageFeatures.roadmapUsefulness} / 5.0`
                    : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase text-blue-400 block mb-0.5">
                  UI Usability
                </span>
                <span className="text-xl font-bold text-white">
                  {feedbackSummary.averageFeatures?.uiExperience
                    ? `${feedbackSummary.averageFeatures.uiExperience} / 5.0`
                    : 'N/A'}
                </span>
              </div>
            </div>
          )}

          {loadingFeedback ? (
            <LoadingSpinner size="lg" text="Loading platform feedback entries..." />
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
              <Heart className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-white">No feedback recorded yet</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Student ratings and product feedback will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((item) => (
                <div
                  key={item._id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {item.user?.name || 'Student'}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        ({item.user?.email})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <StarRating rating={item.overallRating} interactive={false} size="sm" />
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Feature Breakdown pills */}
                  {item.featureRatings && (
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      {item.featureRatings.aiAccuracy && (
                        <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
                          AI: {item.featureRatings.aiAccuracy}★
                        </span>
                      )}
                      {item.featureRatings.roadmapUsefulness && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                          Roadmap: {item.featureRatings.roadmapUsefulness}★
                        </span>
                      )}
                      {item.featureRatings.uiExperience && (
                        <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                          UI: {item.featureRatings.uiExperience}★
                        </span>
                      )}
                    </div>
                  )}

                  {item.comment ? (
                    <p className="text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/70 italic">
                      "{item.comment}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-500 italic">No written comment provided.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MENTOR VERIFICATION */}
      {activeTab === 'mentors' && <MentorVerificationSection />}
    </div>
  );
};

export default AdminDashboardPage;
