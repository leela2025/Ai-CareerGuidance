import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const SubmitStoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [beforeDesc, setBeforeDesc] = useState('');
  const [afterDesc, setAfterDesc] = useState('');
  const [lifeStageJourney, setLifeStageJourney] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedStory, setSubmittedStory] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center">
          <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign In to Share Your Story</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Log in to your account so your story can be attributed to your profile and inspire the
            community.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login?redirect=/stories/submit">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">Log In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-zinc-800 text-zinc-300">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const suggestedStages = [
    'school → engineering → software engineer',
    'undergraduate → career-shift → full-stack dev',
    're-entering → upskilling → qa automation',
    'working-professional → career-shift → associate pm',
    'undergraduate → tier-3 college → tech intern',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for your story.');
      return;
    }

    if (!storyText.trim() || storyText.trim().length < 50) {
      setError('Please write at least 50 characters describing your journey.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/stories', {
        title: title.trim(),
        storyText: storyText.trim(),
        lifeStageJourney: lifeStageJourney.trim(),
        beforeAfter: {
          before: beforeDesc.trim(),
          after: afterDesc.trim(),
        },
      });

      if (res.data?.success) {
        setSubmittedStory(res.data.story);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit your story. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-6">
          <Link
            to="/stories"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Success Stories
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Community Empowerment
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Share Your Career Journey
          </h1>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto mt-2">
            Your lived experience can be the deciding breakthrough for a student or career changer.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {submittedStory ? (
          /* Submission Success State */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl backdrop-blur-md animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Story Submitted for Review!</h2>
            <p className="text-zinc-300 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Thanks for sharing — your story will appear publicly once reviewed by our team.
              You can check on its approval status anytime in your story hub.
            </p>

            <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl text-left max-w-md mx-auto text-xs space-y-2 mb-8 text-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-500">Title:</span>
                <span className="text-white font-medium truncate max-w-[240px]">
                  {submittedStory.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Moderation Status:</span>
                <span className="text-amber-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Admin Review
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/stories/mine">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-medium">
                  Track in My Stories
                </Button>
              </Link>
              <Link to="/stories">
                <Button variant="outline" className="border-zinc-800 text-zinc-300">
                  Browse All Stories
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Story Form */
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Story Title *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. From Non-CS Mechanical Graduate to Backend Engineer in 8 Months"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Make it catchy and descriptive of your career progression.
              </p>
            </div>

            {/* Quick Before & After Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Starting Point (Before)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={beforeDesc}
                  onChange={(e) => setBeforeDesc(e.target.value)}
                  placeholder="e.g. Paralyzed by choices with zero coding skills"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Current Milestone (After)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={afterDesc}
                  onChange={(e) => setAfterDesc(e.target.value)}
                  placeholder="e.g. Software Engineer building high-scale APIs"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Life Stage Journey Tag */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Life Stage Journey Path (Optional tag)
              </label>
              <input
                type="text"
                value={lifeStageJourney}
                onChange={(e) => setLifeStageJourney(e.target.value)}
                placeholder="e.g. school → engineering → software developer"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-zinc-500 font-mono">Suggestions:</span>
                {suggestedStages.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLifeStageJourney(st)}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 font-mono transition-colors"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Story Text Narrative */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Full Story & Advice *
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {storyText.length} / 3000
                </span>
              </div>
              <textarea
                required
                rows={8}
                maxLength={3000}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Tell your authentic story: Where were you stuck? What tools or milestones helped? What mistakes did you avoid? What advice would you give someone in your old shoes?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

            {/* Moderation notice */}
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                To maintain a supportive and authentic environment, stories undergo lightweight
                admin moderation before appearing publicly.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/stories">
                <Button type="button" variant="outline" className="border-zinc-800 text-zinc-400">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !title.trim() || storyText.length < 50}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/30"
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Submitting..." />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Submit Story for Review
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

export default SubmitStoryPage;
