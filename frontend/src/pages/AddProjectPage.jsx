import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  FolderGit2,
  Sparkles,
  ArrowRight,
  Layers,
  Code,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';

export const AddProjectPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [claimedComplexity, setClaimedComplexity] = useState('intermediate');
  const [techStackInput, setTechStackInput] = useState('');
  const [userRole, setUserRole] = useState('Lead Full Stack Developer');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoadSampleProject = () => {
    setTitle('Distributed Microservices Order Processing Engine');
    setClaimedComplexity('advanced');
    setTechStackInput('Node.js, Express, Redis, RabbitMQ, Docker, MongoDB');
    setUserRole('Backend Architect & Core Contributor');
    setDescription(
      `Engineered a high-throughput asynchronous order processing backend utilizing Node.js microservices.
Key Architecture Decisions:
- Decoupled payment processing, inventory reservation, and notification pipelines using RabbitMQ message queues to handle peak load spikes without dropping transactions.
- Implemented sliding-window rate limiting and session caching via Redis clusters to protect upstream database instances.
- Designed compound indices and optimistic concurrency control in MongoDB to eliminate race conditions during simultaneous inventory stock decrementing.
- Containerized each microservice with Docker and automated health checks in docker-compose for local resilience testing.`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Project title and description are required.');
      return;
    }

    if (description.trim().length < 30) {
      setError('Please provide a substantive technical description (at least 30 characters).');
      return;
    }

    setLoading(true);
    setError('');

    const parsedStack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/projects', {
        title: title.trim(),
        claimedComplexity,
        techStack: parsedStack,
        userRole: userRole.trim() || 'Lead Developer',
        description: description.trim(),
      });

      if (res.data.success && res.data.project?._id) {
        navigate(`/projects/${res.data.project._id}`);
      }
    } catch (err) {
      console.error('Project submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-quick-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-xs font-semibold uppercase mb-2">
            <FolderGit2 className="w-3.5 h-3.5 text-accent-400" />
            Project Reality-Check & Mock Interview
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Submit Project for Scrutiny
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Submit details of your project to test if its architectural scope reads convincingly to recruiters.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleProject}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-all shrink-0"
        >
          Insert Sample Project
        </button>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6"
      >
        {/* Project Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Real-Time Collaborative Workspace, Cloud E-Commerce Engine"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        {/* Claimed Complexity & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Claimed Complexity Level
            </label>
            <select
              value={claimedComplexity}
              onChange={(e) => setClaimedComplexity(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            >
              <option value="beginner">Beginner (CRUD / Single Page App)</option>
              <option value="intermediate">Intermediate (Full-Stack + Auth + Database Indexing)</option>
              <option value="advanced">Advanced (Microservices, Queues, Real-time, or Distributed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Your Engineering Role
            </label>
            <input
              type="text"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              placeholder="e.g. Sole Architect, Backend Lead, Full Stack Developer"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Technologies & Frameworks (Comma Separated)
          </label>
          <input
            type="text"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            placeholder="e.g. React, Node.js, Express, MongoDB, Docker, Redis"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors font-mono"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Architecture & Implementation Description *
            </label>
            <span className="text-[11px] text-zinc-500">{description.length} characters</span>
          </div>
          <textarea
            rows={8}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what the project does, key technical decisions, database modeling, APIs built, and tricky challenges you solved..."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-xs shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner message="Submitting project..." size="sm" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Submit for Reality-Check Audit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectPage;
