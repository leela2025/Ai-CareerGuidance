import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Compass,
  GraduationCap,
  Code2,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Check,
  Briefcase,
  Layers,
  Sparkles,
  Split,
  Clock,
  BookOpen,
  Building2,
  UserCheck,
  Shield,
} from 'lucide-react';
import { AlertBanner } from '../components/common/AlertBanner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const OnboardingPage = () => {
  const { profile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Life Stage state
  const [lifeStage, setLifeStage] = useState(profile?.lifeStage || 'undergraduate');
  const [currentStageDetails, setCurrentStageDetails] = useState(
    profile?.currentStageDetails || {
      schoolGrade: 'Class 12',
      schoolBoard: 'CBSE',
      favoriteSubjects: 'Mathematics, Computer Science',
      currentRole: 'Software Engineer',
      yearsOfExperience: '2',
      currentIndustry: 'IT / SaaS',
      switchFrom: 'Non-Tech Operations',
      switchTo: 'Full Stack Engineering',
      gapYears: '2',
    }
  );

  // Constraints state
  const [constraints, setConstraints] = useState(
    profile?.constraints || ['Part-time or Flexible', 'Remote Opportunities Preferred']
  );
  const [constraintInput, setConstraintInput] = useState('');

  // Academic / Foundation state
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'B.Tech / B.E.');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || '2026');

  // Skills state
  const [currentSkills, setCurrentSkills] = useState(
    profile?.currentSkills?.length ? profile.currentSkills : ['JavaScript', 'React', 'HTML5', 'CSS3']
  );
  const [skillInput, setSkillInput] = useState('');

  // Interests state
  const [interests, setInterests] = useState(
    profile?.interests?.length ? profile.interests : ['Full Stack Development', 'Cloud Computing']
  );
  const [interestInput, setInterestInput] = useState('');
  const [resumeText, setResumeText] = useState(profile?.resumeText || '');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Life stage options
  const lifeStageOptions = [
    {
      id: 'school',
      title: 'School Student',
      subtitle: 'Classes 9–12',
      desc: 'Exploring streams (Science, Commerce, Arts), board exams & early STEM',
      icon: BookOpen,
      badge: 'Foundation',
    },
    {
      id: 'undergraduate',
      title: 'Undergraduate',
      subtitle: 'B.Tech, BCA, B.Sc',
      desc: 'Enrolled in college, building core technical projects & placement readiness',
      icon: GraduationCap,
      badge: 'Collegiate',
    },
    {
      id: 'fresher',
      title: 'Fresher / Entry-Level',
      subtitle: 'Recent Graduate',
      desc: 'Seeking first full-time role or software engineering internship',
      icon: UserCheck,
      badge: 'Job Seeker',
    },
    {
      id: 'working-professional',
      title: 'Working Professional',
      subtitle: '1+ Years Experience',
      desc: 'Aiming for promotion, senior architect track, or compensation jump',
      icon: Briefcase,
      badge: 'Acceleration',
    },
    {
      id: 'career-shift',
      title: 'Career Switcher',
      subtitle: 'Domain Transition',
      desc: 'Moving from non-tech or another field into modern software/AI',
      icon: Split,
      badge: 'Pivot',
    },
    {
      id: 're-entering',
      title: 'Workforce Re-Entry',
      subtitle: 'Returning to Tech',
      desc: 'Re-skilling and refreshing modern stacks after a career break',
      icon: Clock,
      badge: 'Refresher',
    },
  ];

  // Suggested popular skills
  const popularSkills = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Express',
    'MongoDB', 'SQL', 'Git', 'Docker', 'AWS', 'Java', 'C++', 'Tailwind CSS'
  ];

  // Suggested popular interests
  const popularInterests = [
    'Full Stack Development', 'AI & Machine Learning', 'Cloud Architecture',
    'DevOps', 'Cybersecurity', 'Mobile App Development', 'Data Engineering'
  ];

  // Preset constraints
  const presetConstraints = [
    'Remote Opportunities Preferred',
    'Part-time or Flexible Study',
    'Budget Conscious (Free Resources Only)',
    'Immediate Placement Needed (< 3 Months)',
    'Open to Relocation',
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

  const toggleConstraint = (item) => {
    if (constraints.includes(item)) {
      setConstraints(constraints.filter((c) => c !== item));
    } else {
      setConstraints([...constraints, item]);
    }
  };

  const handleStageDetailChange = (key, value) => {
    setCurrentStageDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFinish = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Save profile with lifelong stage & constraints
      const response = await api.put('/profile', {
        lifeStage,
        currentStageDetails,
        constraints,
        educationLevel,
        branch,
        graduationYear,
        currentSkills,
        interests,
        resumeText,
      });

      if (response.data.success) {
        updateProfileState(response.data.profile);

        // 2. Initialize lifelong career journey with stage-aware Claude AI prompt
        try {
          await api.post('/journey/start');
        } catch (jErr) {
          console.warn('Initial journey start note:', jErr);
        }

        // Navigate directly to Lifelong Career Navigator
        navigate('/journey');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase mb-3">
          <GitFork className="w-3.5 h-3.5" />
          <span>Lifelong Career Navigator Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Personalize Your Lifelong Journey
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-xl mx-auto leading-relaxed">
          Career navigation is not a single test—it adapts across every phase of your education and career.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { num: 1, label: 'Life Stage' },
            { num: 2, label: 'Academics' },
            { num: 3, label: 'Skills' },
            { num: 4, label: 'Interests & Launch' },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === item.num
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                    : step > item.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {step > item.num ? <Check className="w-4 h-4" /> : item.num}
              </div>
              {item.num < 4 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 ${
                    step > item.num ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Wizard Step Card with Purposeful <300ms Step Transition */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div key={step} className="animate-step-transition">
          {/* ========================================================================= */}
          {/* STEP 1: Life Stage Selection & Specific Details                           */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Split className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">What is your current life stage?</h2>
                <p className="text-xs text-zinc-400">
                  Claude AI tailors all recommendations, tone, and decision branches to your exact life phase.
                </p>
              </div>
            </div>

            {/* Life Stage Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lifeStageOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = lifeStage === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLifeStage(opt.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {opt.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mb-0.5">{opt.title}</h3>
                      <span className="text-[11px] font-mono text-purple-400 block mb-2">
                        {opt.subtitle}
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-end text-xs font-mono">
                      {isSelected ? (
                        <span className="text-purple-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      ) : (
                        <span className="text-zinc-500">Select →</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CONDITIONAL FOLLOW-UP FIELDS ACCORDING TO STAGE */}
            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 mt-4 space-y-4">
              <span className="text-xs font-mono uppercase text-accent-400 tracking-wider font-semibold block">
                Stage Details: {lifeStage.replace('-', ' ')}
              </span>

              {/* School Student specifics */}
              {lifeStage === 'school' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Current Class / Grade
                    </label>
                    <select
                      value={currentStageDetails.schoolGrade || 'Class 12'}
                      onChange={(e) => handleStageDetailChange('schoolGrade', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10 (Board Year)</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12 (Board & Entrance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      School Board
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.schoolBoard || 'CBSE'}
                      onChange={(e) => handleStageDetailChange('schoolBoard', e.target.value)}
                      placeholder="CBSE, ICSE, State Board, IB"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Favorite Subjects
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.favoriteSubjects || 'Math, Physics, CS'}
                      onChange={(e) => handleStageDetailChange('favoriteSubjects', e.target.value)}
                      placeholder="Math, Physics, Computers"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Working Professional specifics */}
              {lifeStage === 'working-professional' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Current Role / Title
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.currentRole || 'Software Engineer'}
                      onChange={(e) => handleStageDetailChange('currentRole', e.target.value)}
                      placeholder="e.g. Junior Backend Dev"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.yearsOfExperience || '2'}
                      onChange={(e) => handleStageDetailChange('yearsOfExperience', e.target.value)}
                      placeholder="e.g. 2.5 Years"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Current Industry
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.currentIndustry || 'FinTech / SaaS'}
                      onChange={(e) => handleStageDetailChange('currentIndustry', e.target.value)}
                      placeholder="FinTech, E-Commerce, Consulting"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Career Shift specifics */}
              {lifeStage === 'career-shift' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Current Domain / Background
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.switchFrom || 'Operations / Non-Tech'}
                      onChange={(e) => handleStageDetailChange('switchFrom', e.target.value)}
                      placeholder="e.g. Mechanical Engineering, Sales, Accounting"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Target Domain in Tech
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.switchTo || 'Full Stack Web Development'}
                      onChange={(e) => handleStageDetailChange('switchTo', e.target.value)}
                      placeholder="e.g. Full Stack, Data Analytics, Cloud"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Re-entering specifics */}
              {lifeStage === 're-entering' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Career Gap Duration
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.gapYears || '2 Years'}
                      onChange={(e) => handleStageDetailChange('gapYears', e.target.value)}
                      placeholder="e.g. 2 Years break"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                      Re-Entry Focus
                    </label>
                    <input
                      type="text"
                      value={currentStageDetails.switchTo || 'Modern React / Cloud Stacks'}
                      onChange={(e) => handleStageDetailChange('switchTo', e.target.value)}
                      placeholder="e.g. Modern Full Stack, QA Automation"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Default Undergraduate / Fresher info */}
              {(lifeStage === 'undergraduate' || lifeStage === 'fresher') && (
                <p className="text-xs text-zinc-400">
                  Your degree, branch, and graduation timeline will be configured in the next step.
                </p>
              )}
            </div>

            {/* REAL WORLD CONSTRAINTS (Optional chips) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Real-World Constraints (Keeps Recommendations Realistic)
              </label>
              <div className="flex flex-wrap gap-2">
                {presetConstraints.map((c) => {
                  const active = constraints.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConstraint(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        active
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
              >
                <span>Continue to Academic Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Academic Background                                               */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Academic Foundation</h2>
                <p className="text-xs text-zinc-400">Specify your educational degree and branch of study</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Degree / Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                >
                  <option value="B.Tech / B.E.">B.Tech / B.E. (Bachelor of Technology/Engineering)</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="B.Sc Computer Science">B.Sc Computer Science / IT</option>
                  <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                  <option value="Senior Secondary (Class 12)">Senior Secondary (Class 12 / High School)</option>
                  <option value="Diploma in Engineering">Diploma in Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                >
                  <option value="2024">2024 (Graduated)</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026 (Final Year)</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Branch / Department / Specialization
                </label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering, AI & Data Science"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Current Technical Skills                                          */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="p-2.5 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Technical Skills</h2>
                <p className="text-xs text-zinc-400">Add programming languages, frameworks, and developer tools you know</p>
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
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
                  className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Selected Skills Tags */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Selected Skills ({currentSkills.length})
              </label>
              {currentSkills.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No skills selected yet. Choose from below or add custom skills.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-brand-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 1-Click Popular Suggestions */}
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                1-Click Quick Add:
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-zinc-800/40 text-zinc-600 border border-zinc-800 cursor-default'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-brand-500/50 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
              >
                <span>Continue to Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Career Interests & Launch Journey                                 */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Interests & Target Goals</h2>
                <p className="text-xs text-zinc-400">Tell us what technology domains excite you most</p>
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
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
                  placeholder="e.g. Distributed Systems, FinTech Engineering"
                  className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Selected Interests */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Selected Interests ({interests.length})
              </label>
              {interests.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No interests selected yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-purple-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Interests */}
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                1-Click Quick Add:
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-zinc-800/40 text-zinc-600 border border-zinc-800 cursor-default'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-purple-500/50 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Resume Text */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Paste Resume Text (Optional)
              </label>
              <textarea
                rows={4}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste plain text from your resume, projects, or LinkedIn summary here for deeper AI personalization..."
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none font-mono text-xs"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/25 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Launching Lifelong Navigator...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Career Navigator</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
