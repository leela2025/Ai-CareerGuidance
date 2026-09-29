import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Heart,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const MyStoriesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/stories/mine');
      return;
    }
    fetchMyStories();
  }, [isAuthenticated]);

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stories/mine');
      if (res.data?.success) {
        setStories(res.data.stories || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your submitted stories.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved & Public
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 font-medium">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Needs Revision
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" /> Under Review
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your submitted stories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/stories"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Community Stories
          </Link>

          <Link to="/stories/submit">
            <Button className="bg-brand-600 hover:bg-brand-500 text-white text-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Submit New Story
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Submitted Stories
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track the moderation status, engagement, and visibility of your published career
            milestones.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Stories List */}
        {stories.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">You haven't submitted any stories yet</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Share your milestones, learning breakthroughs, or career shifts to inspire thousands of
              learners on the platform.
            </p>
            <Link to="/stories/submit">
              <Button className="bg-brand-600 hover:bg-brand-500 text-white">
                <PlusCircle className="w-4 h-4 mr-2" /> Share Your Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-zinc-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusBadge(story.status)}
                      {story.featured && (
                        <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40 text-[10px] font-mono">
                          <Sparkles className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                      )}
                      {story.lifeStageJourney && (
                        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {story.lifeStageJourney}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {story.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {story.storyText}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(story.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-rose-400/80">
                        <Heart className="w-3 h-3 fill-rose-500/30" />
                        {story.likesCount || 0} Likes
                      </span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/stories/${story.id}`}>
                      <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">
                        View Story <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStoriesPage;
