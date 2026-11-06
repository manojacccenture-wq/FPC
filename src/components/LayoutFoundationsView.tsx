import type { FC } from 'react';

export const LayoutFoundationsView: FC = () => {
  return (
    <div className="w-full">
      {/* Category Tag */}
      <div className="mb-2.5">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#166B4B] uppercase font-sans">
          04 / FOUNDATIONS
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-[34px] md:text-[38px] font-bold text-primary tracking-tight leading-tight mb-8 sm:mb-10">
        Layout <span className="font-normal mx-0.5 text-primary">·</span> one responsive rhythm
      </h1>

      {/* Responsive Diagrams */}
      <div className="space-y-8 sm:space-y-9 mb-12 sm:mb-14">
        {/* 1. Desktop 1440 · 1200 maximum content · 12 columns */}
        <div>
          <h2 className="text-sm sm:text-[14.5px] font-semibold text-primary mb-3">
            Desktop 1440 <span className="font-normal mx-0.5 text-secondary">·</span> 1200 maximum content <span className="font-normal mx-0.5 text-secondary">·</span> 12 columns
          </h2>
          <div className="w-full bg-[#F5F8F7] p-4 sm:p-5 rounded-[4px]">
            <div className="grid grid-cols-12 gap-2 sm:gap-3.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#E6F8F0] h-16 sm:h-20 rounded-[2px] transition-opacity hover:opacity-80"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2. Breakpoint 768 · 8 columns */}
        <div>
          <h2 className="text-sm sm:text-[14.5px] font-semibold text-primary mb-3">
            Breakpoint 768 <span className="font-normal mx-0.5 text-secondary">·</span> 8 columns
          </h2>
          <div className="w-full sm:w-[70%] bg-[#F5F8F7] p-4 sm:p-5 rounded-[4px]">
            <div className="grid grid-cols-8 gap-2 sm:gap-3.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#E6F8F0] h-16 sm:h-20 rounded-[2px] transition-opacity hover:opacity-80"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Breakpoint 375 · 4 columns */}
        <div>
          <h2 className="text-sm sm:text-[14.5px] font-semibold text-primary mb-3">
            Breakpoint 375 <span className="font-normal mx-0.5 text-secondary">·</span> 4 columns
          </h2>
          <div className="w-full sm:w-[35%] bg-[#F5F8F7] p-4 sm:p-5 rounded-[4px]">
            <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#E6F8F0] h-16 sm:h-20 rounded-[2px] transition-opacity hover:opacity-80"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specification Rules Block */}
      <div className="space-y-1.5 text-sm sm:text-[14px] leading-relaxed text-[#1E2923] max-w-4xl">
        <p>
          Shell: sidebar 280 &rarr; 72 collapsed <span className="text-secondary mx-0.5">·</span> topbar 72 <span className="text-secondary mx-0.5">·</span> content padding 40
        </p>
        <p>
          Forms: centered, max 1200; form body max 800 with 280 summary rail.
        </p>
        <p>
          Mobile: 16 px margins, one-column fields, summary below form, horizontally scrollable tables.
        </p>
      </div>
    </div>
  );
};

export default LayoutFoundationsView;

