import React from "react";

/**
 * SplitText / HeroText component inspired by ReactBits & Aceternity UI.
 * Reliably animates the hero headline with smooth word-level reveals,
 * flawless CSS gradient clipping that never disappears or glitches on WebKit,
 * and a glowing purple-emerald shimmer with zero blue.
 */
export const SplitText = ({
  text = "Your AI-Powered Path to the Right Career",
  className = "",
  highlightWords = ["AI-Powered", "Right", "Career"],
}) => {
  const words = text.split(" ");

  return (
    <span className={`inline-block font-extrabold tracking-tight leading-[1.12] ${className}`}>
      {words.map((word, wordIndex) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, "");
        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <span
            key={wordIndex}
            className="inline-block mr-[0.25em] will-change-transform animate-title-fade"
            style={{
              animationDelay: `${wordIndex * 70}ms`,
              animationFillMode: "both",
            }}
          >
            {isHighlighted ? (
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                  {word}
                </span>
                {/* Subtle radiant glow underline/accent on highlighted words */}
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/0 via-emerald-400/80 to-purple-500/0 rounded-full" />
              </span>
            ) : (
              <span className="text-white drop-shadow-sm">{word}</span>
            )}
          </span>
        );
      })}

      <style>{`
        @keyframes titleFade {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
            filter: blur(0px);
          }
        }
        .animate-title-fade {
          animation: titleFade 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </span>
  );
};

export default SplitText;
