import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code,
  FileCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lightbulb,
  BookOpen,
  History,
  Layers,
  Check,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const SkillVerificationPage = () => {
  const { skillName } = useParams();
  const decodedSkillName = decodeURIComponent(skillName || '');
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form answer state
  const [quizAnswers, setQuizAnswers] = useState({}); // { [questionIndex]: selectedOptionOrText }
  const [practicalSolution, setPracticalSolution] = useState('');

  // Evaluation results state
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [mistakeAnalysis, setMistakeAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    startNewAssessment();
    loadHistory();
  }, [decodedSkillName]);

  const loadHistory = async () => {
    try {
      const res = await api.get(`/skills/${encodeURIComponent(decodedSkillName)}/assessment-history`);
      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load assessment history:', err);
    }
  };

  const startNewAssessment = async () => {
    try {
      setLoading(true);
      setError('');
      setEvaluationResult(null);
      setMistakeAnalysis(null);
      setQuizAnswers({});
      setPracticalSolution('');

      const res = await api.post(`/skills/${encodeURIComponent(decodedSkillName)}/start-assessment`, {
        difficultyLevel: 'intermediate',
      });

      if (res.data.success) {
        setAssessment(res.data);
      }
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setError(err.response?.data?.message || 'Could not initialize skill assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!assessment) return;

    setError('');
    setSubmitting(true);

    let answersPayload = null;

    if (assessment.assessmentType === 'quiz') {
      const questions = assessment.questions || [];
      const answersList = questions.map((q, idx) => ({
        questionIndex: idx,
        question: q.question,
        type: q.type,
        selectedAnswer: q.type === 'mcq' ? quizAnswers[idx] || '' : undefined,
        textAnswer: q.type === 'short-answer' ? quizAnswers[idx] || '' : undefined,
      }));

      // Validation check
      const answeredCount = answersList.filter((a) => a.selectedAnswer || a.textAnswer).length;
      if (answeredCount < questions.length) {
        setError(`Please answer all ${questions.length} questions before submitting.`);
        setSubmitting(false);
        return;
      }
      answersPayload = answersList;
    } else {
      if (!practicalSolution.trim() || practicalSolution.trim().length < 20) {
        setError('Please provide a substantive technical solution (at least 20 characters) for evaluation.');
        setSubmitting(false);
        return;
      }
      answersPayload = {
        solutionText: practicalSolution.trim(),
        submittedAt: new Date(),
      };
    }

    try {
      const res = await api.post(`/skills/${encodeURIComponent(decodedSkillName)}/submit-assessment`, {
        assessmentId: assessment.assessmentId,
        answers: answersPayload,
      });

      if (res.data.success) {
        setEvaluationResult(res.data.assessment);
        if (res.data.mistakeAnalysis) {
          setMistakeAnalysis(res.data.mistakeAnalysis);
        }
        setSuccessMsg(res.data.message);
        loadHistory();
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Evaluation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner message={`Generating honest technical assessment for "${decodedSkillName}"...`} size="lg" />
      </div>
    );
  }

  const isQuiz = assessment?.assessmentType === 'quiz';
  const questions = assessment?.questions || [];
  const task = assessment?.practicalTask;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-quick-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            Prove-It Skill Verification Layer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verify: <span className="text-brand-300">{decodedSkillName}</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {isQuiz
              ? 'Rigorous conceptual challenge testing mental models, edge cases, and runtime behavior. Score >= 70 to earn Verified status.'
              : 'Practical implementation challenge. Articulate your architecture and code with production-grade edge case handling.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/roadmap"
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all border border-zinc-700"
          >
            Back to Roadmap
          </Link>
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* ASSESSMENT FORM OR RESULTS VIEW */}
      {!evaluationResult ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-bold">
              Assessment Mode: {isQuiz ? 'Conceptual Scenario Quiz' : 'Hands-on Practical Task'}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Attempt #{assessment?.attemptNumber || 1}
            </span>
          </div>

          {/* QUIZ QUESTIONS */}
          {isQuiz ? (
            <div className="space-y-8">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 border border-brand-500/30">
                      {qIdx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-2 pt-2 sm:pl-10">
                      {q.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                            quizAnswers[qIdx] === option
                              ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qIdx}`}
                            value={option}
                            checked={quizAnswers[qIdx] === option}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: option })}
                            className="mt-0.5 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="leading-snug">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'short-answer' && (
                    <div className="pt-2 sm:pl-10">
                      <textarea
                        rows={3}
                        value={quizAnswers[qIdx] || ''}
                        onChange={(e) => setQuizAnswers({ ...quizAnswers, [qIdx]: e.target.value })}
                        placeholder="Articulate your technical reasoning, mental model, or edge cases..."
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* PRACTICAL TASK */
            <div className="space-y-6">
              {task && (
                <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {task.taskDescription}
                  </div>

                  {task.evaluationCriteria && task.evaluationCriteria.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800">
                      <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-2">
                        Evaluation Criteria Rubric:
                      </div>
                      <ul className="space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                        {task.evaluationCriteria.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Your Implementation & Architectural Rationale
                </label>
                <textarea
                  rows={12}
                  value={practicalSolution}
                  onChange={(e) => setPracticalSolution(e.target.value)}
                  placeholder="Paste your code snippet or describe your architectural implementation in detail..."
                  className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl font-mono text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Submission CTA */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-400">
              Evaluated honestly by AI. Pass threshold is strictly 70/100 points.
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <LoadingSpinner message="Auditing submission honestly..." size="sm" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit for Honest Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* EVALUATION RESULTS VIEW */
        <div className="space-y-6 animate-result-reveal">
          <div
            className={`border rounded-3xl p-6 sm:p-8 space-y-6 ${
              evaluationResult.status === 'passed'
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-950/30'
                : 'bg-zinc-900 border-rose-500/40 shadow-xl shadow-rose-950/30'
            }`}
          >
            {/* Verdict Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                    evaluationResult.status === 'passed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {evaluationResult.status === 'passed' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Evaluation Verdict
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {evaluationResult.status === 'passed'
                      ? 'Skill Verified ✓ Mastery Confirmed'
                      : 'Needs Foundational Review'}
                  </h2>
                </div>
              </div>

              {/* Score Display */}
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {evaluationResult.score}
                  <span className="text-base text-zinc-500 font-normal">/100</span>
                </div>
                <div className="text-xs text-zinc-400">Pass Threshold: 70</div>
              </div>
            </div>

            {/* Specific Feedback */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-brand-400" /> Honest Evaluation Feedback
              </div>
              <ul className="space-y-2">
                {(evaluationResult.aiEvaluation?.specificFeedback || []).map((fb, idx) => (
                  <li
                    key={idx}
                    className="text-xs sm:text-sm text-zinc-200 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{fb}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Identified Gaps */}
            {evaluationResult.aiEvaluation?.gapsIdentified?.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Conceptual Gaps Identified
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {evaluationResult.aiEvaluation.gapsIdentified.map((gap, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"
                    >
                      {gap}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/roadmap"
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
              >
                Back to Roadmap
              </Link>

              <button
                onClick={startNewAssessment}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{evaluationResult.status === 'passed' ? 'Retest Assessment' : 'Retry Assessment'}</span>
              </button>
            </div>
          </div>

          {/* FEATURE 3: LEARNING MISTAKE DETECTOR */}
          {/* "Here's what's really going on" - AHA Moment */}
          {mistakeAnalysis && (
            <div className="bg-gradient-to-r from-brand-950/60 via-zinc-900 to-accent-950/40 border border-brand-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl shadow-brand-950/40 animate-quick-fade">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-500/20 text-accent-300 border border-accent-500/40 shrink-0">
                  <Lightbulb className="w-6 h-6 text-accent-300 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-400">
                    Learning Mistake Diagnostic • The "Aha!" Insight
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Here's what's really going on</h3>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-950/70 border border-accent-500/20 rounded-2xl p-5">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                    Root-Cause Misconception:
                  </div>
                  <p className="text-sm font-semibold text-accent-200 leading-relaxed">
                    {mistakeAnalysis.rootCauseMisconception}
                  </p>
                </div>

                {mistakeAnalysis.targetedExplanation && (
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                      Intuitive Clarification:
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {mistakeAnalysis.targetedExplanation}
                    </p>
                  </div>
                )}

                {mistakeAnalysis.suggestedMicroResource && (
                  <div className="pt-3 border-t border-zinc-800 flex items-start gap-2.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white mb-0.5">Recommended 10-Minute Fix:</strong>
                      {mistakeAnalysis.suggestedMicroResource}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Past Attempts History */}
          {history.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Past Attempt History ({history.length})
              </div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={h._id || i}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">Attempt #{h.attemptNumber}</span>
                      <span className="text-zinc-500 ml-2">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          h.status === 'passed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {h.score}/100 • {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillVerificationPage;
