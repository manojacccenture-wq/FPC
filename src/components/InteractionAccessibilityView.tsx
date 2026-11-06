import type { FC } from 'react';

const accessibilityRules = [
  'Logical reading and focus order follows the visual layout.',
  'Minimum target 44 × 44 px; visible focus on every control.',
  'Labels are always persistent; errors are linked descriptions.',
  'Status uses words + icons, never color alone.',
  'Dialogs trap focus and restore it to their trigger.',
  'Async updates use polite live regions; destructive errors use assertive alerts.',
  'Tables use header cells, sorting announcements and named row actions.',
  'Chart summaries provide the same information as the visual.',
];

export const InteractionAccessibilityView: FC = () => {
  return (
    <div className="w-full max-w-4xl">
      {/* Category Tag */}
      <div className="mb-2.5">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#166B4B] uppercase font-sans">
          05 / FOUNDATIONS
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-[34px] md:text-[38px] font-bold text-primary tracking-tight leading-tight mb-8 sm:mb-10">
        Interaction &amp; accessibility
      </h1>

      {/* Motion Section */}
      <section className="mb-8 sm:mb-10">
        <h2 className="text-base sm:text-[17px] font-bold text-primary tracking-tight mb-2">
          Motion is documented, not animated
        </h2>
        <div className="space-y-1 text-sm sm:text-[14.5px] leading-relaxed text-[#5B6B65]">
          <p>
            Fast 120 ms <span className="font-normal mx-0.5 text-[#5B6B65]">·</span> Base 200 ms <span className="font-normal mx-0.5 text-[#5B6B65]">·</span> Slow 320 ms
          </p>
          <p>
            Enter: ease-out <span className="font-normal mx-0.5 text-[#5B6B65]">·</span> Exit: ease-in <span className="font-normal mx-0.5 text-[#5B6B65]">·</span> Respect reduced-motion preferences.
          </p>
        </div>
      </section>

      {/* Keyboard & Screen-reader Contract Section */}
      <section>
        <h2 className="text-base sm:text-[17px] font-bold text-primary tracking-tight mb-3">
          Keyboard &amp; screen-reader contract
        </h2>
        <ul className="space-y-2 text-sm sm:text-[14.5px] leading-relaxed text-[#1E2923] list-none pl-0">
          {accessibilityRules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary font-bold select-none">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default InteractionAccessibilityView;

