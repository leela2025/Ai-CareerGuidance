import React, { useState } from 'react';
import api from '../../api/axios';
import {
  ShieldAlert,
  ShieldCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  FileText,
  Edit3,
} from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertBanner } from '../common/AlertBanner';

export const ResumeDefenseTest = ({ resumeFeedback, onDefenseUpdated }) => {
  const [isActive, setIsActive] = useState(false);
  const [questions, setQuestions] = useState(resumeFeedback?.defenseResult?.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [defenseResult, setDefenseResult] = useState(resumeFeedback?.defenseResult?.completedAt ? resumeFeedback.defenseResult : null);

  const startDefense = async () => {
    if (!resumeFeedback?._id) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/resume/${resumeFeedback._id}/defense/start`);
      if (res.data.success) {
        setQuestions(res.data.questions || []);
        setCurrentIdx(0);
        setAnswers({});
        setDefenseResult(null);
        setIsActive(true);
      }
    } catch (err) {
      console.error('Failed to start resume defense:', err);
      setError(err.response?.data?.message || 'Failed to initialize resume defense session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!resumeFeedback?._id) return;

    // Check if at least one question has been answered
    const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
    if (answeredCount < questions.length) {
      setError(`Please provide answers to all ${questions.length} questions before submitting.`);
      return;
    }

    setSubmitting(true);
    setError('');

    const formattedAnswers = questions.map((q, idx) => ({
      questionId: q.questionId,
      question: q.question,
      answer: answers[q.questionId] || answers[idx] || '',
    }));

    try {
      const res = await api.post(`/resume/${resumeFeedback._id}/defense/submit`, {
        answers: formattedAnswers,
      });

      if (res.data.success) {
        setDefenseResult(res.data.defenseResult);
        setIsActive(false);
        if (onDefenseUpdated) {
          onDefenseUpdated(res.data.defenseResult);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate defense answers:', err);
      setError(err.response?.data?.message || 'Failed to evaluate defense answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'convincing':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'Convincing & Grounded',
        };
      case 'vague':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'Vague • Needs Specifics',
        };
      default:
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: 'Concerning • Lacks Depth',
        };
    }
  };

  return (
    <div className="space-y-6">
      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* STATE 1: INITIAL CTA CARD (If not currently running active test) */}
      {!isActive && !defenseResult && (
        <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex">
                <ShieldAlert className="w-4 h-4 text-purple-300" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                Reality-Check Scrutiny • Beyond Keyword Scoring
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Can you defend every line on this resume?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              ATS keyword matching gets your resume viewed, but technical interviewers probe metrics and architecture claims to test authentic depth. Take the Resume Defense Test to pressure-test your bullets before real interviews.
            </p>
          </div>

          <button
            onClick={startDefense}
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner message="Selecting claims..." size="sm" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Take Resume Defense Test</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* STATE 2: SEQUENTIAL Q&A FLOW */}
      {isActive && questions.length > 0 && (
        <div className="bg-zinc-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-purple-950/30 animate-quick-fade">
          {/* Header with Progress Tracker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                Resume Defense Test • Question {currentIdx + 1} of {questions.length}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Technical Hiring Manager Follow-Up
              </h3>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentIdx
                      ? 'w-7 bg-purple-500'
                      : answers[questions[i]?.questionId]?.trim()
                      ? 'bg-emerald-500'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Question & Quote Box */}
          <div className="space-y-4">
            {/* The exact claim extracted from resume */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Targeted Resume Claim:
              </span>
              <p className="text-sm font-semibold text-purple-200 italic">
                "{questions[currentIdx]?.relatedClaim}"
              </p>
            </div>

            {/* The interviewer's pointed question */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Interviewer Probe:
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {questions[currentIdx]?.question}
              </h4>
            </div>

            {/* Answer Text Area */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Your Technical Defense & Explanation
              </label>
              <textarea
                rows={5}
                value={answers[questions[currentIdx]?.questionId] || ''}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [questions[currentIdx]?.questionId]: e.target.value,
                  })
                }
                placeholder="Walk through how you measured metrics, architectural decisions, and trade-offs in detail..."
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <LoadingSpinner message="Auditing answers..." size="sm" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Defense for Evaluation</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: CREDIBILITY REPORT */}
      {defenseResult && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-quick-fade">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                  Resume Defense Audit Report
                </div>
                <h3 className="text-2xl font-black text-white">Credibility & Depth Evaluation</h3>
              </div>
            </div>

            {/* Credibility Score */}
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {defenseResult.overallCredibilityScore}
                <span className="text-base text-zinc-500 font-normal">/100</span>
              </div>
              <div className="text-xs text-zinc-400">Overall Defense Credibility</div>
            </div>
          </div>

          {/* Per-Question Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Line-by-Line Claim Scrutiny:
            </h4>

            {(defenseResult.perQuestionFeedback || []).map((item, idx) => {
              const badge = getVerdictBadge(item.verdict);
              return (
                <div
                  key={idx}
                  className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{item.question}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                    <strong className="text-zinc-300 block mb-1">Your Defense Answer:</strong>
                    "{item.answer}"
                  </div>

                  <div className="text-xs text-purple-200/90 italic pl-3 border-l-2 border-purple-500/50">
                    "{item.feedback}"
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Edits */}
          {defenseResult.recommendedResumeEdits?.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" /> Recommended Resume Bullet Edits:
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {defenseResult.recommendedResumeEdits.map((edit, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{edit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Retake CTA */}
          <div className="flex justify-end pt-2">
            <button
              onClick={startDefense}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Resume Defense Test</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeDefenseTest;
