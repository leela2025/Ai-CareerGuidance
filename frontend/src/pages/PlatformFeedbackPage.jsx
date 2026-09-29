import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Sparkles,
  Map,
  Layers,
  Send,
  CheckCircle2,
  ArrowRight,
  Heart,
  Star,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { StarRating } from '../components/common/StarRating';

export const PlatformFeedbackPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [overallRating, setOverallRating] = useState(5);
  const [featureRatings, setFeatureRatings] = useState({
    aiAccuracy: 5,
    roadmapUsefulness: 5,
    uiExperience: 5,
  });
  const [comment, setComment] = useState('');
  const [isPreviousSubmission, setIsPreviousSubmission] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/feedback');
      return;
    }
    fetchExistingFeedback();
  }, [isAuthenticated]);

  const fetchExistingFeedback = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/feedback/platform/mine');
      if (res.data?.success && res.data.feedback) {
        const f = res.data.feedback;
        setOverallRating(f.overallRating || 5);
        setFeatureRatings({
          aiAccuracy: f.featureRatings?.aiAccuracy || 5,
          roadmapUsefulness: f.featureRatings?.roadmapUsefulness || 5,
          uiExperience: f.featureRatings?.uiExperience || 5,
        });
        setComment(f.comment || '');
        setIsPreviousSubmission(true);
      }
    } catch (err) {
      // Non-blocking: If no existing feedback, just keep default state
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      setError('Please provide an overall rating between 1 and 5 stars.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/feedback/platform', {
        overallRating,
        featureRatings,
        comment: comment.trim(),
      });

      if (res.data?.success) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading feedback settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-xs font-medium mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> Platform Feedback & Experience
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Help Us Shape CareerCompassAI
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto mt-2">
            Your honest feedback directly informs our AI algorithms, roadmap milestones, and community
            features.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {successData ? (
          /* Thank You Success Card */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl backdrop-blur-md animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Thank You for Your Feedback!</h2>
            <p className="text-zinc-300 text-sm max-w-md mx-auto mb-6">
              {successData.message}
            </p>

            <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl max-w-sm mx-auto mb-8 text-xs text-zinc-400 flex items-center justify-center gap-2">
              <span>Your overall rating:</span>
              <div className="flex items-center text-amber-400">
                {[...Array(overallRating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/stories">
                <Button className="bg-brand-600 hover:bg-brand-500 text-white font-medium">
                  <BookOpen className="w-4 h-4 mr-2" /> Explore Success Stories
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6"
          >
            {isPreviousSubmission && (
              <div className="p-3 rounded-xl bg-accent-950/30 border border-accent-800/40 text-xs text-accent-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-400 shrink-0" />
                <span>
                  You previously reviewed CareerCompassAI. Submitting this form will update your
                  existing feedback.
                </span>
              </div>
            )}

            {/* 1. Overall Rating (Primary) */}
            <div className="pb-6 border-b border-zinc-800/80">
              <label className="block text-sm font-semibold text-white mb-1">
                Overall Platform Experience *
              </label>
              <p className="text-xs text-zinc-400 mb-3">
                How would you rate your overall experience with CareerCompassAI?
              </p>
              <StarRating
                rating={overallRating}
                onRatingChange={setOverallRating}
                size="lg"
                showLabel={true}
              />
            </div>

            {/* 2. Feature Specific Ratings (Secondary rows) */}
            <div className="space-y-4 pb-6 border-b border-zinc-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Feature-Specific Ratings (Optional)
              </h3>

              {/* Row A: AI Accuracy */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">AI Recommendation Accuracy</p>
                    <p className="text-[11px] text-zinc-500">Relevance of career paths & suggestions</p>
                  </div>
                </div>
                <StarRating
                  rating={featureRatings.aiAccuracy}
                  onRatingChange={(val) =>
                    setFeatureRatings((prev) => ({ ...prev, aiAccuracy: val }))
                  }
                  size="sm"
                />
              </div>

              {/* Row B: Roadmap Usefulness */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Roadmap & Milestone Usefulness</p>
                    <p className="text-[11px] text-zinc-500">Clarity of weekly goals and skills</p>
                  </div>
                </div>
                <StarRating
                  rating={featureRatings.roadmapUsefulness}
                  onRatingChange={(val) =>
                    setFeatureRatings((prev) => ({ ...prev, roadmapUsefulness: val }))
                  }
                  size="sm"
                />
              </div>

              {/* Row C: UI / Platform Experience */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">UI & Platform Usability</p>
                    <p className="text-[11px] text-zinc-500">Design responsiveness & aesthetics</p>
                  </div>
                </div>
                <StarRating
                  rating={featureRatings.uiExperience}
                  onRatingChange={(val) =>
                    setFeatureRatings((prev) => ({ ...prev, uiExperience: val }))
                  }
                  size="sm"
                />
              </div>
            </div>

            {/* 3. Free Text Comment */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  What did you find most helpful, or where can we improve? (Optional)
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {comment.length} / 2000
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. The milestone checkpoints helped me prepare for off-campus interviews. I'd love to see more system design practice questions in the roadmap..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Your comments are reviewed directly by our product & engineering team.
              </p>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/dashboard">
                <Button type="button" variant="outline" className="border-zinc-800 text-zinc-400">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-brand-900/30"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" text="Submitting..." />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isPreviousSubmission ? 'Update Feedback' : 'Submit Feedback'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PlatformFeedbackPage;
