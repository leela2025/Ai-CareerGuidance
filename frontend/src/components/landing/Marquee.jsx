import React from 'react';

export const Marquee = ({
  items = [],
  speed = 35,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div
        className={`flex w-max items-center gap-6 py-2 will-change-transform ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `marqueeScroll ${speed}s linear infinite ${
            direction === 'right' ? 'reverse' : 'normal'
          }`,
        }}
      >
        {/* Render items twice for infinite loop */}
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 text-sm font-medium shadow-md shadow-zinc-950/40 hover:border-brand-500/40 hover:bg-zinc-800/90 transition-all hover:scale-105 select-none"
          >
            {item.icon && <span className="text-brand-400">{item.icon}</span>}
            <span>{item.name}</span>
            {item.tag && (
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-300 border border-accent-500/20">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
