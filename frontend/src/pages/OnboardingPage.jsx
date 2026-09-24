import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  GraduationCap,
  Code2,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { AlertBanner } from '../components/common/AlertBanner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const OnboardingPage = () => {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'B.Tech / B.E.');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || '2026');

  const [currentSkills, setCurrentSkills] = useState(profile?.currentSkills || ['JavaScript', 'React', 'HTML5', 'CSS3']);
  const [skillInput, setSkillInput] = useState('');

  const [interests, setInterests] = useState(profile?.interests || ['Full Stack Development', 'Cloud Computing']);
  const [interestInput, setInterestInput] = useState('');
  const [resumeText, setResumeText] = useState(profile?.resumeText || '');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggested popular skills for quick 1-click addition
  const popularSkills = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Express',
    'MongoDB', 'SQL', 'Git', 'Docker', 'AWS', 'Java', 'C++', 'Tailwind CSS'
  ];

  // Suggested popular interests
  const popularInterests = [
    'Full Stack Development', 'AI & Machine Learning', 'Cloud Architecture',
    'DevOps', 'Cybersecurity', 'Mobile App Development', 'Data Engineering'
  ];

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills([...currentSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (interestToAdd) => {
    const trimmed = (interestToAdd || interestInput).trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  const handleFinish = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.put('/profile', {
        educationLevel,
        branch,
        graduationYear,
        currentSkills,
        interests,
        resumeText,
      });

      if (response.data.success) {
        updateProfileState(response.data.profile);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Student Onboarding</h1>
        <p className="text-sm text-slate-400 mt-1">
          Set up your academic and technical profile so Claude AI can recommend the most accurate career paths.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === num
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                    : step > num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              {num < 3 && <div className={`w-12 h-0.5 ${step > num ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Wizard Step Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* STEP 1: Academic Background */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Academic Details</h2>
                <p className="text-xs text-slate-400">Specify your university degree and branch of study</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Degree / Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                >
                  <option value="B.Tech / B.E.">B.Tech / B.E. (Bachelor of Technology/Engineering)</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="B.Sc Computer Science">B.Sc Computer Science / IT</option>
                  <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                  <option value="Diploma in Engineering">Diploma in Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026 (Final Year)</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Branch / Department / Specialization
                </label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering, AI & Data Science"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Current Technical Skills */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Technical Skills</h2>
                <p className="text-xs text-slate-400">Add programming languages, frameworks, and developer tools you know</p>
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Add Custom Skill
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Next.js, Redux, PostgreSQL"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Selected Skills Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Selected Skills ({currentSkills.length}):
              </label>
              <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                {currentSkills.length > 0 ? (
                  currentSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-950/80 border border-brand-800 text-brand-200 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills selected yet. Click pills below or type above.</span>
                )}
              </div>
            </div>

            {/* Popular Skills Pills */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick-Add Popular Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularSkills.map((skill) => {
                  const isSelected = currentSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      + {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
              >
                <span>Continue to Interests</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Career Ambitions & Resume Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Career Interests & Ambition</h2>
                <p className="text-xs text-slate-400">Tell Claude AI which tech domains excite you most</p>
              </div>
            </div>

            {/* Interests Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Add Career Interest
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="e.g. Distributed Systems, Generative AI"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Selected Interests */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Selected Interests ({interests.length}):
              </label>
              <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-950/80 border border-accent-800 text-accent-200 text-xs font-medium"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick-add interests */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Popular Domains:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularInterests.map((interest) => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddInterest(interest)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      + {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Resume Text Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Paste Resume Text (Optional)
              </label>
              <textarea
                rows={3}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste key sections from your resume (skills, projects, education) for deeper AI analysis..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoadingSpinner message="Saving Profile..." size="sm" />
                ) : (
                  <>
                    <span>Complete Onboarding</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
