import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Sparkles,
  Heart,
  ArrowRight,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Tag,
  Share2,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const SuccessStoriesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likeLoadingId, setLikeLoadingId] = useState(null);

  const tags = [
    { label: 'All Journeys', value: 'all' },
    { label: 'School to College', value: 'school' },
    { label: 'Undergraduate', value: 'undergraduate' },
    { label: 'Career Switch', value: 'career-shift' },
    { label: 'Workforce Re-Entry', value: 're-entering' },
  ];

  useEffect(() => {
    fetchStories();
  }, [selectedTag, page]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError('');
      const tagQuery = selectedTag !== 'all' ? `&tag=${encodeURIComponent(selectedTag)}` : '';
      const res = await api.get(`/stories?page=${page}&limit=9${tagQuery}`);

      if (res.data?.success) {
        setStories(res.data.stories || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load community success stories.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (storyId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/stories');
      return;
    }

    try {
      setLikeLoadingId(storyId);
      const res = await api.patch(`/stories/${storyId}/like`);
      if (res.data?.success) {
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? {
                  ...s,
                  likedByCurrentUser: res.data.isLiked,
                  likesCount: res.data.likesCount,
                }
              : s
          )
        );
      }
    } catch (err) {
      // Non-critical like error
    } finally {
      setLikeLoadingId(null);
    }
  };

  const handleTagChange = (newTag) => {
    setSelectedTag(newTag);
    setPage(1);
    if (newTag === 'all') {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', newTag);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Glow effect */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Real Journeys. Real Outcomes.
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Community Success Stories
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mt-1 leading-relaxed">
              Read how everyday students, career switchers, and professionals broke through
              uncertainty, unlocked high-growth paths, and reached their milestones.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated && (
              <Link to="/stories/mine">
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs">
                  My Stories
                </Button>
              </Link>
            )}
            <Link to="/stories/submit">
              <Button className="bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-medium text-xs shadow-lg shadow-brand-900/30">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Share Your Story
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
          {tags.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTagChange(t.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedTag === t.value
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Loading inspiring success stories..." />
          </div>
        ) : stories.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">No stories in this category yet</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Be the first to share your career transition, breakthrough moment, or milestone with the
              community!
            </p>
            <Link to="/stories/submit">
              <Button className="bg-brand-600 hover:bg-brand-500 text-white">
                <PlusCircle className="w-4 h-4 mr-2" /> Share Your Story
              </Button>
            </Link>
          </div>
        ) : (
          /* Stories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className={`bg-zinc-900/80 rounded-2xl p-6 border flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-xl backdrop-blur-sm ${
                  story.featured
                    ? 'border-accent-500/50 shadow-accent-500/10 bg-gradient-to-b from-accent-950/20 to-zinc-900/90 ring-1 ring-accent-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Top Badges & Author */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300">
                        {story.author?.avatar ? (
                          <img
                            src={story.author.avatar}
                            alt={story.author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          story.author?.name?.slice(0, 2).toUpperCase() || 'ST'
                        )}
                      </div>
                      <span className="text-xs font-medium text-zinc-300 truncate max-w-[130px]">
                        {story.author?.name}
                      </span>
                    </div>

                    {story.featured && (
                      <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40 text-[10px] px-2 py-0.5 font-mono">
                        <Sparkles className="w-3 h-3 mr-1 text-accent-400" /> Featured Story
                      </Badge>
                    )}
                  </div>

                  {/* Life Stage Journey Pill */}
                  {story.lifeStageJourney && (
                    <div className="mb-2.5">
                      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-md inline-block">
                        {story.lifeStageJourney}
                      </span>
                    </div>
                  )}

                  {/* Story Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2 line-clamp-2">
                    <Link
                      to={`/stories/${story.id}`}
                      className="hover:text-accent-400 transition-colors"
                    >
                      {story.title}
                    </Link>
                  </h3>

                  {/* Before & After Visual Chip */}
                  {(story.beforeAfter?.before || story.beforeAfter?.after) && (
                    <div className="my-3 p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs space-y-1.5">
                      {story.beforeAfter.before && (
                        <div className="flex items-start gap-1.5 text-zinc-400">
                          <span className="text-rose-400 font-bold font-mono shrink-0">From:</span>
                          <span className="line-clamp-1">{story.beforeAfter.before}</span>
                        </div>
                      )}
                      {story.beforeAfter.after && (
                        <div className="flex items-start gap-1.5 text-emerald-300">
                          <span className="text-emerald-400 font-bold font-mono shrink-0">To:</span>
                          <span className="line-clamp-1 font-medium">{story.beforeAfter.after}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Excerpt */}
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                    {story.storyText}
                  </p>
                </div>

                {/* Footer Controls: Likes & Read More */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLike(story.id)}
                    disabled={likeLoadingId === story.id}
                    className={`flex items-center gap-1.5 text-xs transition-colors p-1 rounded-lg ${
                      story.likedByCurrentUser
                        ? 'text-rose-400 hover:text-rose-300'
                        : 'text-zinc-400 hover:text-rose-400'
                    }`}
                    title={story.likedByCurrentUser ? 'Unlike story' : 'Like story'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        story.likedByCurrentUser ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span className="font-mono">{story.likesCount || 0}</span>
                  </button>

                  <Link
                    to={`/stories/${story.id}`}
                    className="inline-flex items-center text-xs font-semibold text-accent-400 hover:text-accent-300 transition-colors"
                  >
                    Read full story <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="border-zinc-800 text-zinc-400"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-xs text-zinc-400 font-mono">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="border-zinc-800 text-zinc-400"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessStoriesPage;
