import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CheckCircle2,
  Sparkles,
  Star,
  MessageSquare,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Clock,
  Building2,
  Calendar,
  HeartHandshake,
  Send,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const MentorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Request guidance modal
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchMentorProfile();
  }, [id]);

  const fetchMentorProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/mentors/${id}`);
      if (res.data?.success) {
        setMentor(res.data.mentor);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load mentor profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/mentors/${id}`));
      return;
    }

    if (!requestMessage.trim()) return;

    try {
      setIsSubmittingRequest(true);
      const res = await api.post('/connections/request', {
        mentorId: mentor.id,
        message: requestMessage.trim(),
      });

      if (res.data?.success) {
        setSuccessMsg(
          'Connection request sent successfully! You can track its status in your Connections hub.'
        );
        setConnectModalOpen(false);
        setRequestMessage('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send connection request. Please try again.'
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading mentor profile..." />
      </div>
    );
  }

  if (error && !mentor) {
    return (
      <div className="min-h-screen bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AlertBanner type="error" message={error} />
          <div className="mt-6 text-center">
            <Link to="/mentors">
              <Button variant="outline" className="border-zinc-800 text-zinc-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Mentor Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSelf = user?._id && mentor?.user?.id === user._id;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/mentors"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Mentors
          </Link>
          <Link to="/connections">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-accent-400" /> My Connections
            </Button>
          </Link>
        </div>

        {successMsg && (
          <div className="mb-6">
            <AlertBanner
              type="success"
              message={successMsg}
              onClose={() => setSuccessMsg('')}
            />
          </div>
        )}

        {/* Profile Card Hero */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Avatar / Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-brand-600 via-accent-500 to-brand-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  {mentor.user?.avatar ? (
                    <img
                      src={mentor.user.avatar}
                      alt={mentor.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold bg-gradient-to-br from-accent-400 to-brand-400 bg-clip-text text-transparent">
                      {mentor.user?.name?.slice(0, 2).toUpperCase() || 'ME'}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2">
                {mentor.type === 'expert' ? (
                  mentor.verified ? (
                    <span
                      title="Verified Expert Counsellor"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 shadow-md ring-4 ring-zinc-900"
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span
                      title="Expert (Pending Verification)"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-zinc-950 shadow-md ring-4 ring-zinc-900"
                    >
                      <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                    </span>
                  )
                ) : (
                  <span
                    title="Peer Motivator"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white shadow-md ring-4 ring-zinc-900"
                  >
                    <HeartHandshake className="w-5 h-5" />
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {mentor.user?.name}
                </h1>

                {mentor.type === 'expert' ? (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    {mentor.verified ? 'Verified Expert' : 'Expert (Review)'}
                  </Badge>
                ) : (
                  <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40 font-medium">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Peer Motivator
                  </Badge>
                )}
              </div>

              <p className="text-zinc-300 text-base sm:text-lg font-medium mb-3">
                {mentor.headline}
              </p>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-zinc-400 mb-4">
                {mentor.companyOrCollege && (
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1 text-zinc-500" />
                    <span>{mentor.companyOrCollege}</span>
                  </div>
                )}
                {mentor.yearsOfExperience !== undefined && mentor.yearsOfExperience > 0 && (
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1 text-zinc-500" />
                    <span>{mentor.yearsOfExperience} yrs experience</span>
                  </div>
                )}
                {mentor.availability && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-emerald-400" />
                    <span>{mentor.availability}</span>
                  </div>
                )}
              </div>

              {/* Rating & Stats banner */}
              <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1.5" />
                  <span className="font-semibold text-white text-base">
                    {mentor.rating ? mentor.rating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-zinc-400 text-xs ml-1">
                    ({mentor.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
                <div className="text-xs sm:text-sm text-zinc-300">
                  <span className="font-semibold text-white">{mentor.totalConversations || 0}</span>{' '}
                  1-on-1 Guidance Sessions
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="w-full md:w-auto flex md:flex-col justify-end gap-3 mt-2 md:mt-0">
              {isSelf ? (
                <div className="bg-accent-950/30 border border-accent-800/40 rounded-xl p-3 text-center text-xs text-accent-300">
                  <UserCheck className="w-5 h-5 mx-auto mb-1 text-accent-400" />
                  This is your mentor profile
                </div>
              ) : (
                <Button
                  onClick={() => setConnectModalOpen(true)}
                  className="w-full md:w-48 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-lg shadow-brand-900/30 font-medium py-2.5 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Request to Connect
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Story & Expertise Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                {mentor.type === 'expert' ? (
                  <>
                    <Briefcase className="w-5 h-5 mr-2 text-emerald-400" /> Professional Background & Philosophy
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-5 h-5 mr-2 text-accent-400" /> My Journey & Story
                  </>
                )}
              </h2>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {mentor.bio}
              </p>
            </div>

            {/* Tags Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-accent-400" /> Areas of Expertise & Support
              </h2>
              <div className="flex flex-wrap gap-2">
                {mentor.expertiseTags?.map((tag) => (
                  <Link
                    key={tag}
                    to={`/mentors?tag=${encodeURIComponent(tag)}`}
                    className="inline-block"
                  >
                    <Badge
                      variant="outline"
                      className="bg-zinc-950/80 text-zinc-300 hover:text-white hover:border-accent-500/50 transition-colors border-zinc-800 text-xs px-3 py-1.5"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" /> Learner Reviews
                </h2>
                <span className="text-xs text-zinc-400">
                  {reviews.length} feedback {reviews.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
                  <Star className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">No reviews yet for this mentor.</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Connect and have a conversation to be among the first to rate!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/70"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center text-xs font-semibold text-accent-200">
                            {rev.user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{rev.user?.name}</p>
                            <p className="text-[11px] text-zinc-500">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-zinc-300 text-xs sm:text-sm mt-2 italic">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Context Card */}
          <div className="space-y-6">
            {/* Why Human Guidance Box */}
            <div className="bg-gradient-to-br from-brand-950/40 via-zinc-900/60 to-zinc-900 border border-brand-900/30 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                <HeartHandshake className="w-4 h-4 mr-2 text-accent-400" /> The Human Trust Layer
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                While CareerCompassAI generates roadmap milestones and market data, conversations with
                mentors offer empathy, tactical interview secrets, and lived experience that algorithms
                cannot replace.
              </p>
              <div className="space-y-2.5 text-xs text-zinc-400">
                <div className="flex items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Real-time private messaging on the platform</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Your email & contact details remain private</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Honest peer guidance or verified expert counsel</span>
                </div>
              </div>
            </div>

            {/* Quick Connect CTA Card */}
            {!isSelf && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Ready to discuss your career path?
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Send a brief note introducing your situation, questions, or roadblock.
                </p>
                <Button
                  onClick={() => setConnectModalOpen(true)}
                  className="w-full bg-brand-600 hover:bg-brand-600 text-white font-medium"
                >
                  <Send className="w-3.5 h-3.5 mr-2" /> Message {mentor.user?.name}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Request Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setConnectModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center text-accent-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Connect with {mentor.user?.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  {mentor.type === 'expert' ? 'Verified Expert' : 'Peer Motivator'} • {mentor.headline}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendConnectionRequest}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Introduce yourself and what you're seeking guidance on:
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="e.g. Hi! I'm currently preparing for a switch into cloud architecture. I saw your journey from civil engineering and would love your guidance on resume prioritization..."
                  rows={4}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Be specific about your questions so the mentor can prepare helpful advice.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConnectModalOpen(false)}
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRequest || !requestMessage.trim()}
                  className="bg-brand-600 hover:bg-brand-600 text-white"
                >
                  {isSubmittingRequest ? (
                    <LoadingSpinner size="sm" text="Sending..." />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfilePage;
