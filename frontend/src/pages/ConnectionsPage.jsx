import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  Users,
  Send,
  Inbox,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const ConnectionsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('sent'); // 'sent' | 'incoming'
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/connections');
      return;
    }
    fetchConnections();
  }, [isAuthenticated]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/connections/mine');
      if (res.data?.success) {
        setSentRequests(res.data.sentRequests || []);
        setIncomingRequests(res.data.incomingRequests || []);
        // If user has incoming requests and no sent ones, switch default tab
        if (res.data.incomingRequests?.length > 0 && res.data.sentRequests?.length === 0) {
          setActiveTab('incoming');
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load connections. Please refresh.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      setActionLoadingId(requestId);
      const res = await api.patch(`/connections/${requestId}/respond`, { status });
      if (res.data?.success) {
        // Update local state
        setIncomingRequests((prev) =>
          prev.map((req) =>
            req._id === requestId
              ? {
                  ...req,
                  status,
                  conversation: res.data.conversationId || req.conversation,
                  respondedAt: new Date(),
                }
              : req
          )
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to ${status} connection request.`
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 font-medium">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Declined
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" /> Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading connection requests..." />
      </div>
    );
  }

  const incomingPendingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-accent-400" /> Mentorship Connections
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage your 1-on-1 mentorship requests, status updates, and active chat rooms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/mentors">
              <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
                <Users className="w-4 h-4 mr-2 text-accent-400" /> Explore Mentors
              </Button>
            </Link>
            {!user?.isMentor && (
              <Link to="/mentors/apply">
                <Button className="bg-brand-600 hover:bg-brand-500 text-white">
                  <Sparkles className="w-4 h-4 mr-2" /> Become a Mentor
                </Button>
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 pb-3 px-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'sent'
                ? 'border-accent-500 text-accent-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent Guidance Requests</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-300">
              {sentRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 pb-3 px-4 font-medium text-sm transition-all border-b-2 relative ${
              activeTab === 'incoming'
                ? 'border-accent-500 text-accent-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Incoming Inquiries</span>
            {incomingPendingCount > 0 ? (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-accent-500 text-[#0F2A1D] font-bold">
                {incomingPendingCount} new
              </span>
            ) : (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-300">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* SENT REQUESTS TAB */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No connection requests yet</h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
                  Browse our directory of verified experts and peer motivators who can guide you
                  through interviews, degree choices, or career transitions.
                </p>
                <Link to="/mentors">
                  <Button className="bg-brand-600 hover:bg-brand-500 text-white">
                    <Users className="w-4 h-4 mr-2" /> Find a Mentor
                  </Button>
                </Link>
              </div>
            ) : (
              sentRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-zinc-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Mentor Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-accent-400 font-bold overflow-hidden">
                        {req.mentorUser?.avatar ? (
                          <img
                            src={req.mentorUser.avatar}
                            alt={req.mentorUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          req.mentorUser?.name?.slice(0, 2).toUpperCase() || 'ME'
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-white">
                            {req.mentorUser?.name || 'Mentor'}
                          </h3>
                          {req.mentor?.type === 'expert' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] px-2 py-0.5">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Expert
                            </Badge>
                          ) : (
                            <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/30 text-[11px] px-2 py-0.5">
                              <Sparkles className="w-3 h-3 mr-1" /> Peer Motivator
                            </Badge>
                          )}
                          {renderStatusBadge(req.status)}
                        </div>

                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                          {req.mentor?.headline}
                        </p>

                        <div className="mt-3 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 text-xs text-zinc-300">
                          <span className="text-zinc-500 font-medium block mb-1">Your message:</span>
                          "{req.message}"
                        </div>

                        <p className="text-[11px] text-zinc-500 mt-2">
                          Sent on{' '}
                          {new Date(req.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                      {req.status === 'accepted' && (
                        <Link to={`/messages/${req.conversation}`}>
                          <Button className="bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-md">
                            <MessageSquare className="w-4 h-4 mr-2" /> Open Chat
                          </Button>
                        </Link>
                      )}

                      {req.mentor?._id && (
                        <Link to={`/mentors/${req.mentor._id}`}>
                          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                            View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* INCOMING REQUESTS TAB */}
        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8">
                <Inbox className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No incoming requests yet</h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto">
                  {user?.isMentor
                    ? 'When learners view your mentor profile and ask for advice, their connection requests will appear here.'
                    : 'You are currently registered as a learner. Apply as a peer or expert mentor to receive connection requests.'}
                </p>
                {!user?.isMentor && (
                  <Link to="/mentors/apply" className="mt-4 inline-block">
                    <Button className="bg-brand-600 hover:bg-brand-500 text-white">
                      <Sparkles className="w-4 h-4 mr-2" /> Apply as a Mentor
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-zinc-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Learner Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-brand-900/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0 text-accent-300 font-bold overflow-hidden">
                        {req.user?.avatar ? (
                          <img
                            src={req.user.avatar}
                            alt={req.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          req.user?.name?.slice(0, 2).toUpperCase() || 'ST'
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-white">{req.user?.name}</h3>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[11px]">
                            Learner
                          </Badge>
                          {renderStatusBadge(req.status)}
                        </div>

                        <div className="mt-3 p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 text-xs text-zinc-300">
                          <span className="text-zinc-500 font-medium block mb-1">Inquiry note:</span>
                          "{req.message}"
                        </div>

                        <p className="text-[11px] text-zinc-500 mt-2">
                          Received on{' '}
                          {new Date(req.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            disabled={actionLoadingId === req._id}
                            onClick={() => handleRespond(req._id, 'declined')}
                            variant="outline"
                            className="border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" /> Decline
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoadingId === req._id}
                            onClick={() => handleRespond(req._id, 'accepted')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                          >
                            {actionLoadingId === req._id ? (
                              <LoadingSpinner size="sm" text="" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept & Chat
                              </>
                            )}
                          </Button>
                        </>
                      ) : req.status === 'accepted' ? (
                        <Link to={`/messages/${req.conversation}`}>
                          <Button className="bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-md">
                            <MessageSquare className="w-4 h-4 mr-2" /> Open Conversation
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">Request {req.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;
