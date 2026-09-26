import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  ArrowLeft,
  Heart,
  Sparkles,
  Calendar,
  Share2,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/stories/${id}`);
      if (res.data?.success) {
        setStory(res.data.story);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load story details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/stories/${id}`));
      return;
    }

    try {
      setLikeLoading(true);
      const res = await api.patch(`/stories/${id}/like`);
      if (res.data?.success) {
        setStory((prev) => ({
          ...prev,
          likedByCurrentUser: res.data.isLiked,
          likesCount: res.data.likesCount,
        }));
      }
    } catch (err) {
      // Non-blocking
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading story narrative..." />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-zinc-950 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <AlertBanner type="error" message={error || 'Story not found.'} />
          <Link to="/stories" className="mt-6 inline-block">
            <Button variant="outline" className="border-zinc-800 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Success Stories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/stories"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Stories
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="border-zinc-800 text-zinc-400 hover:text-white text-xs"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            {copied ? 'Link Copied!' : 'Share Story'}
          </Button>
        </div>

        {/* Story Content Card */}
        <article className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md mb-8">
          {/* Metadata & Author */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-sm text-purple-300">
                {story.author?.avatar ? (
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  story.author?.name?.slice(0, 2).toUpperCase() || 'ST'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{story.author?.name}</p>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(story.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {story.featured && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Featured
                </Badge>
              )}
              {story.lifeStageJourney && (
                <Badge variant="outline" className="border-zinc-800 text-zinc-300 text-xs font-mono">
                  {story.lifeStageJourney}
                </Badge>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-6 leading-snug">
            {story.title}
          </h1>

          {/* Before & After Transformation Card */}
          {(story.beforeAfter?.before || story.beforeAfter?.after) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 mb-8">
              {story.beforeAfter.before && (
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400 font-mono">
                    Starting Point
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                    {story.beforeAfter.before}
                  </p>
                </div>
              )}
              {story.beforeAfter.after && (
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 font-mono">
                    Where I Am Now
                  </span>
                  <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                    {story.beforeAfter.after}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Full Narrative Text */}
          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
            {story.storyText}
          </div>

          {/* Like Interaction Footer */}
          <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleToggleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                story.likedByCurrentUser
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  : 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  story.likedByCurrentUser ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>{story.likesCount || 0} Likes</span>
            </button>

            <span className="text-xs text-zinc-500 font-mono">
              Published on CareerCompassAI
            </span>
          </div>
        </article>

        {/* Call to Action: Share your story too */}
        <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-zinc-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-xl">
          <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">
            Have you reached a career milestone?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
            Your journey can inspire confused 10th/12th graders, nervous college graduates, or
            mid-career professionals taking their first leap.
          </p>
          <Link to="/stories/submit">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-900/30">
              <PlusCircle className="w-4 h-4 mr-2" /> Share Your Story Too
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;
