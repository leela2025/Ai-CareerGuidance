import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  FolderGit2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  Layers,
  Code,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const ProjectDetailPage = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realityChecking, setRealityChecking] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Interview session state
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startingInterview, setStartingInterview] = useState(false);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      setError('Could not load project details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunRealityCheck = async () => {
    setRealityChecking(true);
    setError('');
    try {
      const res = await api.post(`/projects/${id}/reality-check`);
      if (res.data.success) {
        setProject(res.data.project);
        setSuccessMsg('Reality check audit completed successfully!');
      }
    } catch (err) {
      console.error('Reality check error:', err);
      setError(err.response?.data?.message || 'Failed to complete reality check.');
    } finally {
      setRealityChecking(false);
    }
  };

  const handleStartInterview = async () => {
    setStartingInterview(true);
    setError('');
    try {
      const res = await api.post(`/projects/${id}/interview/start`);
      if (res.data.success) {
        setInterviewQuestions(res.data.questions || []);
        setCurrentIdx(0);
        setAnswers({});
        setIsInterviewing(true);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.response?.data?.message || 'Failed to start interview.');
    } finally {
      setStartingInterview(false);
    }
  };

  const handleSubmitInterview = async () => {
    const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
    if (answeredCount < interviewQuestions.length) {
      setError(`Please provide responses to all ${interviewQuestions.length} interview questions.`);
      return;
    }

    setSubmittingInterview(true);
    setError('');

    const formattedAnswers = interviewQuestions.map((q, idx) => ({
      questionId: q.questionId,
      question: q.question,
      focusArea: q.focusArea,
      answer: answers[q.questionId] || answers[idx] || '',
    }));

    try {
      const res = await api.post(`/projects/${id}/interview/submit`, {
        answers: formattedAnswers,
      });

      if (res.data.success) {
        setProject(res.data.project);
        setIsInterviewing(false);
        setSuccessMsg('Mock interview evaluated successfully!');
      }
    } catch (err) {
      console.error('Failed to evaluate interview answers:', err);
      setError(err.response?.data?.message || 'Failed to submit interview answers.');
    } finally {
      setSubmittingInterview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <LoadingSpinner message="Loading project architecture & reality audits..." size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
        <Link to="/projects" className="text-brand-400 hover:underline text-sm">
          Back to Projects
        </Link>
      </div>
    );
  }

  const reality = project.realityCheckResult;
  const interview = project.interviewResult;
  const hasReality = Boolean(reality?.realismScore);
  const hasInterviewResult = Boolean(interview?.completedAt);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-quick-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {project.claimedComplexity} complexity
            </span>
            <span className="text-xs text-zinc-400">Role: {project.userRole}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {project.title}
          </h1>
        </div>

        <Link
          to="/projects"
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-all self-start sm:self-auto"
        >
          All Projects
        </Link>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Project Overview Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
          Project Architecture & Description:
        </h3>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {project.description}
        </p>

        {project.techStack && project.techStack.length > 0 && (
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            {project.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-brand-300 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: AI REALITY-CHECK AUDIT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Phase 1 • Scope Consistency & Realism
              </div>
              <h2 className="text-xl font-bold text-white">How This Project Reads to a Recruiter</h2>
            </div>
          </div>

          {!hasReality && (
            <button
              onClick={handleRunRealityCheck}
              disabled={realityChecking}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {realityChecking ? (
                <LoadingSpinner message="Auditing scope..." size="sm" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run Reality-Check Audit</span>
                </>
              )}
            </button>
          )}
        </div>

        {hasReality ? (
          <div className="space-y-6 animate-result-reveal">
            {/* Realism Score Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Recruiter Realism Score
                </span>
                <div className="text-xs text-zinc-400">
                  Consistency between claimed complexity and actual implementation
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {reality.realismScore}
                <span className="text-sm text-zinc-500 font-normal">/100</span>
              </div>
            </div>

            {/* Honest Assessment Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Senior Architect Evaluation:
              </h4>
              <p className="text-xs sm:text-sm text-zinc-200 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/80 leading-relaxed">
                {reality.honestAssessment}
              </p>
            </div>

            {/* Consistency Flags */}
            {reality.consistencyFlags?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Consistency Observations:
                </h4>
                <div className="space-y-2">
                  {reality.consistencyFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Framing Improvements */}
            {reality.suggestedFramingImprovements?.length > 0 && (
              <div className="bg-brand-950/30 border border-brand-500/30 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-accent-400 font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> How to Frame This to Maximize Interview Invitations:
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {reality.suggestedFramingImprovements.map((sugg, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-accent-400 font-bold">•</span>
                      <span>{sugg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 py-4">
            Click "Run Reality-Check Audit" above to test whether your architecture claims and complexity level hold up to professional scrutiny.
          </p>
        )}
      </div>

      {/* SECTION 2: TECHNICAL MOCK INTERVIEW */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-300 border border-accent-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-400">
                Phase 2 • Technical Mock Interview
              </div>
              <h2 className="text-xl font-bold text-white">Project-Specific Deep Technical Interview</h2>
            </div>
          </div>

          {!isInterviewing && (
            <button
              onClick={handleStartInterview}
              disabled={startingInterview}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {startingInterview ? (
                <LoadingSpinner message="Generating questions..." size="sm" />
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span>{hasInterviewResult ? 'Retake Mock Interview' : 'Start Mock Interview'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ACTIVE INTERVIEW Q&A RUNNER */}
        {isInterviewing && interviewQuestions.length > 0 && (
          <div className="space-y-6 bg-zinc-950/70 border border-accent-500/30 rounded-2xl p-6 animate-quick-fade">
            {/* Question Tracker */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
              <span className="font-mono text-accent-400 font-bold">
                Question {currentIdx + 1} of {interviewQuestions.length} • {interviewQuestions[currentIdx]?.focusArea}
              </span>
              <span className="text-zinc-500">Live Mock Interview</span>
            </div>

            {/* Current Question */}
            <div className="space-y-3">
              <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {interviewQuestions[currentIdx]?.question}
              </h4>

              <textarea
                rows={5}
                value={answers[interviewQuestions[currentIdx]?.questionId] || ''}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [interviewQuestions[currentIdx]?.questionId]: e.target.value,
                  })
                }
                placeholder="Walk through your technical reasoning, trade-offs, and how you solved this..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-accent-500 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors resize-none"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentIdx < interviewQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitInterview}
                  disabled={submittingInterview}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingInterview ? (
                    <LoadingSpinner message="Auditing interview..." size="sm" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Mock Interview</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED INTERVIEW REPORT */}
        {!isInterviewing && hasInterviewResult && (
          <div className="space-y-6 animate-quick-fade">
            {/* Overall Score & Readiness Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-accent-500/30">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400 font-bold">
                  Technical Readiness Verdict:
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {interview.readinessVerdict}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-accent-300">
                  {interview.overallScore}
                  <span className="text-sm text-zinc-500 font-normal">/100</span>
                </div>
                <div className="text-[11px] text-zinc-500">Overall Interview Depth</div>
              </div>
            </div>

            {/* Per-Question Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Question-by-Question Evaluation:
              </h4>

              {(interview.perQuestionFeedback || []).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{item.question}</span>
                    {item.score && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {item.score}/100
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                    <strong className="text-zinc-300 block mb-0.5">Your Response:</strong>
                    "{item.answer}"
                  </div>

                  <p className="text-xs text-accent-200/90 italic pl-3 border-l-2 border-accent-500/40">
                    "{item.feedback}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isInterviewing && !hasInterviewResult && (
          <p className="text-xs text-zinc-400 py-3">
            Click "Start Mock Interview" to begin a 4-5 question technical interview probing your trade-offs, edge case handling, and debugging decisions on this project.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
