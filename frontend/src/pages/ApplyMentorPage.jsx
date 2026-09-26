import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Building2,
  HeartHandshake,
  Tag,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const ApplyMentorPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('peer'); // 'peer' | 'expert'
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [companyOrCollege, setCompanyOrCollege] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(2);
  const [availability, setAvailability] = useState('Weekday evenings');
  const [tagInput, setTagInput] = useState('career-switch, resume-review');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
          <HeartHandshake className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Join as a Mentor</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Please log in or create an account to share your journey and guide the next generation.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login?redirect=/mentors/apply">
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!headline.trim() || !bio.trim()) {
      setError('Please provide a headline and your journey / background bio.');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    try {
      setLoading(true);
      const res = await api.post('/mentors/apply', {
        type,
        headline: headline.trim(),
        bio: bio.trim(),
        companyOrCollege: companyOrCollege.trim(),
        yearsOfExperience: Number(yearsOfExperience) || 0,
        availability: availability.trim(),
        expertiseTags: tags,
      });

      if (res.data?.success) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit mentor application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Empower Fellow Learners
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Apply to Become a Mentor
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mt-2">
            Share your lived experience or certified expertise. Help students navigate choices,
            conquer imposter syndrome, and break into rewarding careers.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {successData ? (
          /* Application Submitted Success View */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {successData.mentor?.type === 'expert'
                ? 'Expert Application Under Review'
                : 'Welcome to the Mentor Community!'}
            </h2>

            <p className="text-zinc-300 text-sm max-w-md mx-auto mb-6">
              {successData.message}
            </p>

            <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl text-left max-w-md mx-auto text-xs space-y-2 mb-8 text-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-500">Mentor Type:</span>
                <span className="text-white font-medium capitalize">
                  {successData.mentor?.type === 'expert' ? 'Verified Expert' : 'Peer Motivator'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Verification Status:</span>
                <span className={successData.mentor?.verified ? 'text-emerald-400' : 'text-amber-400'}>
                  {successData.mentor?.verified ? 'Verified Active' : 'Pending Admin Review'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Headline:</span>
                <span className="text-zinc-200">{successData.mentor?.headline}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/mentors">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                  Browse Mentor Directory
                </Button>
              </Link>
              <Link to="/connections">
                <Button variant="outline" className="border-zinc-800 text-zinc-300">
                  Go to Connections Hub
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-6"
          >
            {/* Step 1: Select Type */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Choose Your Mentorship Role
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Peer Motivator Option */}
                <div
                  onClick={() => setType('peer')}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                    type === 'peer'
                      ? 'border-purple-500 bg-purple-950/20'
                      : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-xs">
                      Instant Approval
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Peer Motivator</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    You've walked a similar path (e.g. non-CS to tech, campus to corporate).
                    Share relatable, motivational support and honest peer advice.
                  </p>
                </div>

                {/* Verified Expert Option */}
                <div
                  onClick={() => setType('expert')}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                    type === 'expert'
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
                      Admin Verified
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Verified Expert</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Certified career counsellor, senior engineering lead, or industry veteran.
                    Provides structured, credible counsel and portfolio reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Headline / One-Line Summary *
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={
                  type === 'expert'
                    ? 'e.g. Senior Cloud Architect & AWS Community Builder | 9+ Yrs Exp'
                    : 'e.g. Switched from Civil Engg to Frontend Dev at a Series-B Startup'
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Visible on mentor directory cards. Keep it concise and inspiring.
              </p>
            </div>

            {/* Bio / Journey Story */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {type === 'expert' ? 'Professional Bio & Guidance Philosophy *' : 'Your Journey & Story *'}
              </label>
              <textarea
                required
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  type === 'expert'
                    ? 'Highlight your professional background, certifications, and how you mentor candidates through technical roadmaps and salary negotiations...'
                    : 'Describe your starting point, mistakes you made, how you self-studied, and what motivated you to succeed. Peer stories give immense courage to newcomers...'
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Two-column Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Current Company or Institution
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={companyOrCollege}
                    onChange={(e) => setCompanyOrCollege(e.target.value)}
                    placeholder="e.g. Microsoft / IIT Bombay"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Years of Professional Experience
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Availability & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  General Availability
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Weekday evenings / Weekends"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Expertise Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. cloud, system-design, resume-review"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                Your email and personal phone number will <strong>never</strong> be displayed publicly.
                All initial interactions occur through CareerCompassAI's real-time messaging system.
              </span>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/mentors">
                <Button type="button" variant="outline" className="border-zinc-800 text-zinc-400">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/30"
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Submitting..." />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Submit Application
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

export default ApplyMentorPage;
