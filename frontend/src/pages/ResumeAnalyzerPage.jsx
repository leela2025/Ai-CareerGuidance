import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  FileText,
  Sparkles,
  Award,
  History,
  CheckCircle,
  Copy,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ScoreGauge } from '../components/resume/ScoreGauge';
import { FeedbackList } from '../components/resume/FeedbackList';
import { ResumeDefenseTest } from '../components/resume/ResumeDefenseTest';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const ResumeAnalyzerPage = () => {
  const { profile } = useAuth();

  const [resumeText, setResumeText] = useState(profile?.resumeText || '');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sample student resume for 1-click viva testing
  const sampleStudentResume = `ALEX CHEN
San Francisco, CA • alex.chen@university.edu • github.com/alexchen • linkedin.com/in/alexchen

EDUCATION
B.Tech in Computer Science & Engineering | University Institute of Technology (2022 - 2026)
GPA: 3.8 / 4.0 | Relevant Coursework: Data Structures, Algorithms, Database Systems, Web Architecture

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Mongoose
Developer Tools: Git, GitHub, Docker, Postman, MongoDB Atlas, Linux

TECHNICAL PROJECTS
1. Cloud-Based E-Commerce Platform (React, Node.js, MongoDB, Stripe)
- Engineered a full-stack responsive web application handling secure product checkouts and order processing.
- Built RESTful API endpoints in Express with JWT authentication and bcrypt password encryption.
- Reduced database read latency by 35% by implementing compound indexing in MongoDB Atlas.

2. Real-Time Collaborative Workspace (React, WebSockets, Redis)
- Developed an interactive canvas allowing 20+ simultaneous users to collaborate in real-time.
- Containerized frontend and backend microservices using Docker Compose for local development.`;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await api.get('/resume/history');
      if (res.data.success && res.data.history.length > 0) {
        setHistory(res.data.history);
        setActiveFeedback(res.data.history[0]);
      }
    } catch (err) {
      console.error('Failed to load resume history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnalyzeResume = async (e) => {
    if (e) e.preventDefault();
    if (!resumeText.trim() || resumeText.trim().length < 30) {
      setError('Please enter or paste at least 30 characters of your resume.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsAnalyzing(true);

    try {
      const res = await api.post('/resume/analyze', {
        resumeText: resumeText.trim(),
        targetRole: targetRole.trim() || 'Software Engineer',
      });

      if (res.data.success) {
        const feedback = res.data.feedback;
        setActiveFeedback(feedback);
        setHistory([feedback, ...history]);
        setSuccessMsg('Resume analysis completed successfully with Claude AI!');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Resume evaluation failed. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setResumeText(sampleStudentResume);
    setTargetRole('Full Stack Software Engineer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            ATS Keyword & Rigour Analyzer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Resume Analyzer & Feedback
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Evaluate your resume against real-world engineering recruiter criteria and ATS algorithms using Claude Sonnet 4.6.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all shrink-0"
        >
          <Copy className="w-4 h-4 text-accent-400" />
          <span>Insert Demo Resume</span>
        </button>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Resume Input */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            Resume Content
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Position / Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Cloud Engineer, ML Engineer"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Paste Resume Text
              </label>
              <span className="text-[11px] text-slate-500">
                {resumeText.length} characters
              </span>
            </div>
            <textarea
              rows={14}
              required
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your plain text resume here (Education, Skills, Experience, Projects)..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none font-mono"
            />
          </div>

          <button
            onClick={handleAnalyzeResume}
            disabled={isAnalyzing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <LoadingSpinner message="Auditing resume via Claude AI..." size="sm" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Resume Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Pane: AI Score & Report */}
        <div className="lg:col-span-7 space-y-6">
          {activeFeedback ? (
            <div className="space-y-6 animate-result-reveal">
              {/* Score Gauge */}
              <ScoreGauge
                score={activeFeedback.aiScore}
                targetRole={activeFeedback.targetRole}
              />

              {/* Categorized Feedback */}
              <FeedbackList
                strengths={activeFeedback.strengths}
                improvements={activeFeedback.improvements}
                summary={activeFeedback.summary}
              />

              {/* Feature 4: Resume Defense Test */}
              <ResumeDefenseTest
                resumeFeedback={activeFeedback}
                onDefenseUpdated={(newDefense) => {
                  setActiveFeedback({ ...activeFeedback, defenseResult: newDefense });
                }}
              />

              {/* Past Evaluations History */}
              {history.length > 1 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <History className="w-4 h-4" /> Past Evaluation History
                  </div>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <button
                        key={item._id || idx}
                        onClick={() => setActiveFeedback(item)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          activeFeedback._id === item._id
                            ? 'bg-brand-950/40 border-brand-500/50 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{item.targetRole}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm font-extrabold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                          {item.aiScore}/100
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[450px] bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No Evaluation Report Yet</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Paste your resume on the left or click "Insert Demo Resume" and run the analyzer to see an ATS compatibility score, strengths, and missing keywords.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
