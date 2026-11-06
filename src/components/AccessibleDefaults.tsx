import type { FC } from 'react';

export const AccessibleDefaults: FC = () => {
  return (
    <section className="mt-12 sm:mt-14 max-w-4xl">
      {/* Section Title */}
      <h2 className="text-xl sm:text-[22px] font-bold text-primary tracking-tight mb-4">
        Accessible defaults
      </h2>

      {/* Semantic Rule Descriptions */}
      <div className="space-y-1 text-sm sm:text-[14.5px] leading-relaxed text-secondary mb-6">
        <p>
          Primary <span className="font-mono text-primary font-medium">#0E1B16</span> / white · Secondary &amp; muted <span className="font-mono text-primary font-medium">#5B6B65</span> / white
        </p>
        <p>
          Brand <span className="font-mono text-primary font-medium">#166B4B</span> / white · Status text uses 700 shades on 50 surfaces.
        </p>
        <p>
          Amber <span className="font-mono text-primary font-medium">#F2B13C</span> is a chart/accent color, never body text on white.
        </p>
      </div>

      {/* Accessibility Contrast Evaluation Lines */}
      <div className="space-y-3 text-sm sm:text-[14px] text-secondary">
        <p className="flex items-center gap-1.5 flex-wrap">
          <span className="text-primary font-normal">Primary 17.69:1 AA PASS</span>
        </p>
        <p className="flex items-center gap-1.5 flex-wrap">
          <span className="text-primary font-normal">Secondary / muted 5.62:1 AA PASS</span>
        </p>
        <p className="flex items-center gap-1.5 flex-wrap">
          <span className="text-primary font-normal">Brand button 6.48:1 AA PASS</span>
        </p>
        <p className="flex items-center gap-1.5 flex-wrap">
          <span className="text-primary font-normal">
            Amber accent — <span className="text-primary font-normal">FAIL for text 1.89:1</span> Use only decorative accents
          </span>
        </p>
        <p className="flex items-center gap-1.5 flex-wrap">
          <span className="text-primary font-normal">
            Original muted 400 — <span className="text-primary font-normal">FAIL for text 2.49:1</span> Use only decorative accents
          </span>
        </p>
      </div>
    </section>
  );
};
