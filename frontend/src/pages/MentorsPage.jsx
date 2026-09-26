import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Star,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  GraduationCap,
  Clock,
  X,
  Send,
  Building2,
  Compass,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const MentorsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all'); // 'all' | 'expert' | 'peer'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

  // Connection Request Modal
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [targetMentor, setTargetMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const filterTags = [
    'cloud-architecture',
    'system-design',
    'career-switch',
    'mern-stack',
    'artificial-intelligence',
    'dsa-prep',
    'resume-review',
    'off-campus-hiring',
  ];

  useEffect(() => {
    fetchMentors();
  }, [activeTab, selectedTag]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (activeTab !== 'all') params.type = activeTab;
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/mentors', { params });
      if (res.data.success) {
        setMentors(res.data.mentors || []);
      }
    } catch (err) {
      console.error('Failed to fetch mentors:', err);
      setError('Could not retrieve mentors.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  const openConnectModal = (mentor) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setTargetMentor(mentor);
    setRequestMessage(
      `Hi ${mentor.user?.name}! I saw your ${
        mentor.type === 'expert' ? 'expert guidance' : 'peer journey'
      } profile on CareerCompassAI and would love your mentorship on career roadmap and placement preparation.`
    );
    setConnectModalOpen(true);
  };

  const handleSendRequest = async () => {
    if (!targetMentor || !requestMessage.trim()) return;

    try {
      setIsSubmittingRequest(true);
      setError('');
      const res = await api.post('/connections/request', {
        mentorId: targetMentor.id,
        message: requestMessage.trim(),
      });

      if (res.data.success) {
        setConnectModalOpen(false);
        setSuccessMsg(
          `Connection request sent to ${targetMentor.user?.name}! Check your Connections hub for updates.`
        );
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send connection request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-flex">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-accent-400 font-semibold">
              Human Guidance Layer
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mentor Connect & Peer Support
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            AI gives data-driven guidance instantly; our mentors provide the human trust layer.
            Connect with verified industry experts for credible advice, and peer motivators who’ve lived the journey.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/connections"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>My Connections & Chat</span>
          </Link>

          <Link
            to="/mentors/apply"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Become a Mentor</span>
          </Link>
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Directory Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Type Toggle Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSelectedTag('');
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Mentors ({mentors.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('expert');
              setSelectedTag('');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'expert'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Experts</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('peer');
              setSelectedTag('');
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'peer'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
            <span>Peer Stories</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, role, company..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="text-xs">
            Filter
          </Button>
        </form>
      </div>

      {/* Expertise Tag Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs font-mono scrollbar-none">
        <span className="text-zinc-500 shrink-0 uppercase text-[11px] font-semibold">
          Topics:
        </span>
        {filterTags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(isSelected ? '' : tag)}
              className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                isSelected
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <LoadingSpinner text="Searching verified mentors & peer guides..." />
      ) : mentors.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No mentors match your filter</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Try resetting your topic filter or search for broader keywords.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab('all');
              setSelectedTag('');
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const isExpert = mentor.type === 'expert';
            const initials = mentor.user?.name
              ? mentor.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'ME';

            return (
              <div
                key={mentor.id}
                className="rounded-3xl p-6 bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Card Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-accent-500 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                        {mentor.user?.avatar ? (
                          <img
                            src={mentor.user.avatar}
                            alt={mentor.user.name}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                            {mentor.user?.name}
                          </h3>
                          {mentor.verified && isExpert && (
                            <span title="Verified Expert Credential">
                              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        {mentor.companyOrCollege && (
                          <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                            <Building2 className="w-3 h-3 text-zinc-500" />
                            {mentor.companyOrCollege}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                        isExpert
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isExpert ? 'Verified Expert' : 'Peer Story'}
                    </span>
                  </div>

                  {/* Headline */}
                  <h4 className="text-xs font-semibold text-zinc-200 mb-2 leading-relaxed line-clamp-2">
                    {mentor.headline}
                  </h4>

                  {/* Bio */}
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>

                  {/* Tags */}
                  {mentor.expertiseTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {mentor.expertiseTags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-800 text-[11px] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{mentor.rating.toFixed(1)}</span>
                      <span className="text-zinc-500 font-normal">
                        ({mentor.totalReviews})
                      </span>
                    </div>

                    <span className="truncate text-zinc-500">
                      💬 {mentor.totalConversations} guided
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/mentors/${mentor.id}`}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all"
                    >
                      <span>View Profile</span>
                    </Link>

                    <Button
                      size="sm"
                      variant="glow"
                      onClick={() => openConnectModal(mentor)}
                      className="text-xs"
                    >
                      <span>Connect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONNECTION REQUEST MODAL                                                  */}
      {/* ========================================================================= */}
      {connectModalOpen && targetMentor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Request Guidance with {targetMentor.user?.name}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {targetMentor.type === 'expert' ? 'Verified Expert' : 'Peer Motivator'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                <span className="font-semibold text-white block mb-0.5">Mentor Headline:</span>
                <p className="text-zinc-400">{targetMentor.headline}</p>
                <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                  Availability: {targetMentor.availability}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 mb-2 font-semibold">
                  What guidance are you seeking? (Introductory Note)
                </label>
                <textarea
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Explain what specific challenges or decisions you need advice on (e.g. cloud roadmap, transitioning streams, mock resume feedback)..."
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              <p className="text-[11px] text-zinc-500 font-mono">
                🔒 All guidance conversations occur privately inside the CareerCompassAI platform. Personal contact details are never exposed.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  variant="outline"
                  onClick={() => setConnectModalOpen(false)}
                  disabled={isSubmittingRequest}
                >
                  Cancel
                </Button>
                <Button
                  variant="glow"
                  onClick={handleSendRequest}
                  disabled={isSubmittingRequest}
                  className="flex items-center gap-1.5"
                >
                  {isSubmittingRequest ? (
                    'Sending Request...'
                  ) : (
                    <>
                      <span>Send Request</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;
