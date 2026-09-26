import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, X } from 'lucide-react';

export const SkillDependencyModal = ({
  isOpen,
  onClose,
  targetSkill,
  missingPrerequisites = [],
  riskExplanation,
  onConfirmOverride,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const primaryMissing = missingPrerequisites[0] || '';

  const handleVerifyPrereq = () => {
    onClose();
    if (primaryMissing) {
      navigate(`/skills/${encodeURIComponent(primaryMissing)}/verify`);
    } else {
      navigate(`/skills/${encodeURIComponent(targetSkill)}/verify`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-quick-fade">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 text-left space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
              Foundational Prerequisite Gap Detected
            </div>
            <h3 className="text-xl font-extrabold text-white leading-snug">
              Before marking <span className="text-brand-300">"{targetSkill}"</span> complete
            </h3>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-3 text-sm text-zinc-300 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
          <p className="leading-relaxed">
            You haven't confirmed mastery of{' '}
            <span className="font-semibold text-amber-300">
              {missingPrerequisites.join(', ')}
            </span>
            . Building on an unverified foundation often causes subtle bugs and confusion later.
          </p>
          {riskExplanation && (
            <p className="text-xs text-zinc-400 italic border-l-2 border-amber-500/60 pl-3">
              "{riskExplanation}"
            </p>
          )}
        </div>

        {/* Action Options */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleVerifyPrereq}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Verify {primaryMissing ? `"${primaryMissing}"` : 'Prerequisite'} First</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all border border-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmOverride();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-200 text-xs font-semibold transition-all border border-zinc-800"
              title="Respects your autonomy and marks completed while logging the foundational gap"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDependencyModal;
