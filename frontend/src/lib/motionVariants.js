/**
 * Shared Motion Variants & Animation Utilities
 * Adheres to Purposeful Animation principles:
 * - quickFade (150-200ms, opacity only) as default for repeat visits
 * - fadeInUp / resultReveal reserved only for one-time or purposeful state changes
 * - respects prefers-reduced-motion
 * - sessionStorage-based first-visit entrance tracking
 */

// Helper to determine if a heavy entrance animation should play or default to quickFade
export const shouldAnimateFirstVisit = (pageKey) => {
  if (typeof window === 'undefined') return false;
  try {
    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    const sessionKey = `cc_animated_${pageKey}`;
    const alreadyVisited = sessionStorage.getItem(sessionKey);
    if (!alreadyVisited) {
      sessionStorage.setItem(sessionKey, 'true');
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// Motion Variants Definition
export const motionVariants = {
  // Lightweight default: 150-200ms, opacity only. Perfect for repeat visits & frequent navigation.
  quickFade: {
    className: 'animate-quick-fade',
    duration: 180,
    style: {
      animation: 'quickFade 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    },
  },

  // Purposeful entrance for one-time exploratory pages or modals
  fadeInUp: {
    className: 'animate-fade-in-up',
    duration: 280,
    style: {
      animation: 'fadeInUp 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    },
  },

  // Step transition for Onboarding (fast, under 300ms)
  stepTransition: {
    className: 'animate-step-transition',
    duration: 250,
    style: {
      animation: 'stepTransition 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    },
  },

  // Purposeful reveal for AI generation results and ATS scores
  resultReveal: {
    className: 'animate-result-reveal',
    duration: 350,
    style: {
      animation: 'resultReveal 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    },
  },

  // Container-level entrance (animates container once, avoids individual item delays)
  containerFade: {
    className: 'animate-container-fade',
    duration: 200,
  },

  // Instant fallback for reduced-motion or repeated fast loads
  instant: {
    className: '',
    duration: 0,
    style: {
      opacity: 1,
      transform: 'none',
    },
  },
};

export default motionVariants;
