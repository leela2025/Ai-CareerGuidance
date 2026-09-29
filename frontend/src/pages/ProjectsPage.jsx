import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  FolderGit2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Code,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/mine');
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Could not load your submitted projects.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading your project portfolio & reality audits..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-quick-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-xs font-semibold uppercase mb-2">
            <FolderGit2 className="w-3.5 h-3.5 text-accent-400" />
            Project Reality-Check & Mock Interview Layer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portfolio Project Scrutiny
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Sanity-check whether your project scope matches industry expectations, then defend your architecture decisions in realistic mock interviews.
          </p>
        </div>

        <Link
          to="/projects/add"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Project</span>
        </Link>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const hasRealityCheck = Boolean(project.realityCheckResult?.realismScore);
            const hasInterview = Boolean(project.interviewResult?.completedAt);

            return (
              <div
                key={project._id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {project.claimedComplexity} complexity
                    </span>

                    <div className="flex items-center gap-2">
                      {hasRealityCheck && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Realism: {project.realityCheckResult.realismScore}/100
                        </span>
                      )}
                      {hasInterview && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
                          Interview: {project.interviewResult.overallScore}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                      {project.title}
                    </h3>
                    <div className="text-xs text-zinc-400 mt-0.5">Role: {project.userRole}</div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech Stack Pills */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Status & CTA */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-500">
                    {hasInterview
                      ? 'Interview Defended ✓'
                      : hasRealityCheck
                      ? 'Reality Checked • Interview Ready'
                      : 'Audit Pending'}
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-brand-600 text-zinc-200 hover:text-white text-xs font-semibold transition-all group-hover:bg-brand-600"
                  >
                    <span>Inspect & Interview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Projects Submitted Yet</h3>
          <p className="text-xs text-zinc-400">
            Submit a project you've worked on. The AI will first sanity-check whether your claimed complexity is realistic, then conduct a targeted technical mock interview.
          </p>
          <div className="pt-2">
            <Link
              to="/projects/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Your First Project</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
