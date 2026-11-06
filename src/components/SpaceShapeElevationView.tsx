import type { FC } from 'react';

interface SpaceScaleItem {
  token: string;
  pixels: number;
}

const spaceItems: SpaceScaleItem[] = [
  { token: 'space/2', pixels: 2 },
  { token: 'space/4', pixels: 4 },
  { token: 'space/8', pixels: 8 },
  { token: 'space/12', pixels: 12 },
  { token: 'space/16', pixels: 16 },
  { token: 'space/20', pixels: 20 },
  { token: 'space/24', pixels: 24 },
  { token: 'space/32', pixels: 32 },
  { token: 'space/40', pixels: 40 },
  { token: 'space/48', pixels: 48 },
  { token: 'space/64', pixels: 64 },
];

export const SpaceShapeElevationView: FC = () => {
  return (
    <div className="w-full">
      {/* Category Tag */}
      <div className="mb-2.5">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#166B4B] uppercase font-sans">
          03 / FOUNDATIONS
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-[34px] md:text-[38px] font-bold text-primary tracking-tight leading-tight mb-8">
        Space, shape &amp; elevation
      </h1>

      {/* Spacing Bars Visualizer */}
      <div className="space-y-[18px] sm:space-y-[19px] mb-12 sm:mb-14">
        {spaceItems.map((item) => (
          <div key={item.token} className="flex items-center gap-3.5 group">
            {/* Dark Brand Green Rectangle Bar */}
            <div
              className="bg-[#166B4B] rounded-[2px] transition-transform duration-100 group-hover:scale-y-125 origin-center shrink-0"
              style={{
                width: `${item.pixels}px`,
                height: '11px',
              }}
            />
            {/* Label */}
            <span className="text-sm font-normal text-[#1E2923] tracking-normal font-sans">
              {item.token} <span className="text-[#5B6B65] font-light">·</span> {item.pixels} px
            </span>
          </div>
        ))}
      </div>

      {/* Specification Text Block */}
      <div className="space-y-1.5 text-sm sm:text-[14.5px] leading-relaxed text-[#1E2923] mb-6">
        <p>Controls S 36 / M 44 / L 52</p>
        <p>Radius xs 6 / sm 8 / md 12 / lg 16 / xl 24 / full 999</p>
        <p>Elevation e0 flat / e1 card / e2 popover / e3 modal</p>
        <p>Focus 2 px brand-600 outline + 2 px white offset</p>
      </div>

      {/* Production Note */}
      <p className="text-sm sm:text-[13.5px] leading-relaxed text-secondary max-w-3xl">
        Compact controls remain at least 44 px hit areas in production; visual height may be 36 px. Prefer comfortable density on touch devices.
      </p>
    </div>
  );
};

export default SpaceShapeElevationView;

