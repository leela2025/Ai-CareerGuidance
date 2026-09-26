import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  ArrowLeft,
  Star,
  Check,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Users,
  AlertCircle,
  Wifi,
  WifiOff,
  Smile,
  X,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

// Resolve socket origin matching axios baseURL
const resolveSocketUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0' ||
      window.location.hostname === '';
    if (isLocal) {
      return envUrl ? envUrl.replace(/\/api$/, '') : 'http://localhost:5000';
    }
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/api$/, '');
    }
    return 'https://ai-careerguidance-1-p8g9.onrender.com';
  }
  return 'http://localhost:5000';
};

export const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Real-time states
  const [socketConnected, setSocketConnected] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Feedback modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // 1. Initial conversation data fetch
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/messages/${conversationId}`));
      return;
    }
    fetchConversation();
  }, [conversationId, isAuthenticated]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/conversations/${conversationId}`);
      if (res.data?.success) {
        setConversation(res.data.conversation);
        setMessages(res.data.conversation.messages || []);
        if (res.data.mentor) {
          setMentorData(res.data.mentor);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load conversation history.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Setup Socket.IO connection & event handlers
  useEffect(() => {
    if (!token || !conversationId) return;

    const socketUrl = resolveSocketUrl();
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join-conversation', conversationId);
      socket.emit('mark-read', { conversationId });
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
    });

    // Incoming new message
    socket.on('new-message', (data) => {
      if (data.conversationId === conversationId && data.message) {
        setMessages((prev) => {
          // Avoid duplicate messages
          const exists = prev.some((m) => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });

        // If message is from other user, emit mark-read
        const senderId =
          typeof data.message.sender === 'object'
            ? data.message.sender?._id
            : data.message.sender;
        if (senderId !== user?._id) {
          socket.emit('mark-read', { conversationId });
        }
      }
    });

    // Typing broadcast
    socket.on('user-typing', (data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setOtherUserTyping(data.isTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    });

    // Messages marked read
    socket.on('messages-read', (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, read: true }))
        );
      }
    });

    socket.on('error-message', (msg) => {
      console.warn('Socket error message:', msg);
    });

    return () => {
      socket.emit('leave-conversation', conversationId);
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, token, user?._id]);

  // 3. REST Polling Fallback (every 4 seconds if socket disconnected)
  useEffect(() => {
    if (socketConnected) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}`);
        if (res.data?.success && res.data.conversation?.messages) {
          setMessages(res.data.conversation.messages);
        }
      } catch (err) {
        // Silent polling error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [socketConnected, conversationId]);

  // 4. Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // 5. Handle Typing Input Change
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('typing', {
        conversationId,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  // 6. Send message handler (Socket + REST fallback)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInputText('');

    // Stop typing indicator
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('typing', { conversationId, isTyping: false });
    }

    try {
      if (socketRef.current && socketConnected) {
        // Emit via socket
        socketRef.current.emit('send-message', {
          conversationId,
          text: trimmed,
        });
      } else {
        // Send via REST fallback
        const res = await api.post(`/conversations/${conversationId}/messages`, {
          text: trimmed,
        });
        if (res.data?.success && res.data.message) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send message. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  // 7. Submit Feedback handler
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!mentorData?.id && !mentorData?._id) return;

    try {
      setFeedbackSubmitting(true);
      const mentorId = mentorData.id || mentorData._id;
      const res = await api.post(`/mentors/${mentorId}/feedback`, {
        conversationId,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      });

      if (res.data?.success) {
        setFeedbackSuccess('Thank you! Your rating and feedback have been recorded.');
        setTimeout(() => {
          setFeedbackModalOpen(false);
          setFeedbackSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit feedback.'
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to conversation..." />
      </div>
    );
  }

  // Find the other participant
  const otherParticipant = conversation?.participants?.find(
    (p) => (p._id || p.id) !== user?._id
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Conversation Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 sm:px-6 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/connections"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Back to Connections"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Other User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold overflow-hidden">
                {otherParticipant?.avatar ? (
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  otherParticipant?.name?.slice(0, 2).toUpperCase() || 'CC'
                )}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-zinc-900 ${
                  socketConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={socketConnected ? 'Real-Time Connected' : 'Polling Fallback Active'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  {otherParticipant?.name || 'Guidance Partner'}
                </h2>
                {mentorData && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${
                      mentorData.type === 'expert'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        : 'border-purple-500/40 text-purple-300 bg-purple-500/10'
                    }`}
                  >
                    {mentorData.type === 'expert' ? 'Expert' : 'Peer'}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                {otherUserTyping ? (
                  <span className="text-purple-400 font-medium animate-pulse">Typing...</span>
                ) : socketConnected ? (
                  <span className="text-emerald-400 flex items-center">
                    <Wifi className="w-3 h-3 mr-1" /> Live Chat
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Polling Mode
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {mentorData && !user?.isMentor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackModalOpen(true)}
                className="border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 text-xs"
              >
                <Star className="w-3.5 h-3.5 mr-1.5 text-amber-400 fill-amber-400" />
                Rate Mentor
              </Button>
            )}

            {mentorData && (mentorData.id || mentorData._id) && (
              <Link to={`/mentors/${mentorData.id || mentorData._id}`}>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
                  View Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto w-full px-4 pt-3">
          <AlertBanner type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Chat Intro Banner */}
        <div className="text-center py-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 max-w-xl mx-auto mb-4">
          <HeartHandshake className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-zinc-300 font-medium">
            This is a secure 1-on-1 mentorship channel.
          </p>
          <p className="text-[11px] text-zinc-500">
            Messages are private between you and {otherParticipant?.name || 'your mentor'}.
          </p>
        </div>

        {/* Messages List */}
        {messages.map((msg, index) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
          const isMe = senderId === user?._id;
          const isGuidanceRequest = msg.text.startsWith('Guidance Request:');

          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
            >
              {isGuidanceRequest ? (
                // Highlighted system guidance request badge
                <div className="max-w-md w-full bg-purple-950/30 border border-purple-800/40 rounded-2xl p-4 my-2 text-zinc-200">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Initial Guidance Request
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 italic whitespace-pre-wrap">
                    {msg.text.replace('Guidance Request:', '').trim()}
                  </p>
                  <p className="text-[10px] text-zinc-500 text-right mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ) : (
                // Regular Chat Bubble
                <div
                  className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-purple-200/80' : 'text-zinc-500'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && (
                      <span>
                        {msg.read ? (
                          <CheckCheck className="w-3 h-3 text-emerald-300" title="Read" />
                        ) : (
                          <Check className="w-3 h-3 text-purple-300" title="Delivered" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {otherUserTyping && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs bg-zinc-900/60 border border-zinc-800 rounded-2xl px-3 py-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>{otherParticipant?.name || 'Mentor'} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="bg-zinc-900/90 border-t border-zinc-800 p-3 sm:p-4 sticky bottom-0 z-20 backdrop-blur-md">
        <form
          onSubmit={handleSendMessage}
          className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message ${otherParticipant?.name || 'mentor'}...`}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 h-auto font-medium shadow-md shadow-purple-900/30"
          >
            {isSending ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Rating & Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setFeedbackModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Rate Your Experience</h3>
                <p className="text-xs text-zinc-400">
                  How helpful was guidance from {otherParticipant?.name}?
                </p>
              </div>
            </div>

            {feedbackSuccess ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-emerald-400">{feedbackSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback}>
                {/* Star rating selector */}
                <div className="mb-5 text-center">
                  <p className="text-xs text-zinc-400 mb-2">Select rating (1 to 5 stars)</p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= feedbackRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-700 hover:text-zinc-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Leave a review or comment (optional):
                  </label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="e.g. Invaluable interview insights and practical advice on cloud portfolio building..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold"
                  >
                    {feedbackSubmitting ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      'Submit Rating'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
