import type { FC } from 'react';
import { PaletteRow, type ColorScaleItem } from './PaletteRow';
import { AccessibleDefaults } from './AccessibleDefaults';

const forestScale: ColorScaleItem[] = [
  { step: 50, hex: '#EDF8F3' },
  { step: 100, hex: '#DCF2E9' },
  { step: 200, hex: '#BCE5D3' },
  { step: 300, hex: '#8DD2B2' },
  { step: 400, hex: '#54B189' },
  { step: 500, hex: '#298A63' },
  { step: 600, hex: '#166B4B' },
  { step: 700, hex: '#0E593E' },
  { step: 800, hex: '#0C4A33' },
  { step: 900, hex: '#093A2A' },
];

const emeraldScale: ColorScaleItem[] = [
  { step: 50, hex: '#F0FBF6' },
  { step: 100, hex: '#E6F8F0' },
  { step: 200, hex: '#A9E3C7' },
  { step: 300, hex: '#83D5B1' },
  { step: 400, hex: '#57C298' },
  { step: 500, hex: '#30A97A' },
  { step: 600, hex: '#208660' },
  { step: 700, hex: '#196C4E' },
  { step: 800, hex: '#12553F' },
  { step: 900, hex: '#0B4030' },
];

const amberScale: ColorScaleItem[] = [
  { step: 50, hex: '#FFF9EB' },
  { step: 100, hex: '#FDF1D5' },
  { step: 200, hex: '#FADFA4' },
  { step: 300, hex: '#F7CE72' },
  { step: 400, hex: '#F4BE50' },
  { step: 500, hex: '#F2B13C' },
  { step: 600, hex: '#B8770F' },
  { step: 700, hex: '#8E5909' },
  { step: 800, hex: '#72480C' },
  { step: 900, hex: '#5F3B0D' },
];

const neutralScale: ColorScaleItem[] = [
  { step: 50, hex: '#F5F7F7' },
  { step: 100, hex: '#EEF2F1' },
  { step: 200, hex: '#E1E8E6' },
  { step: 300, hex: '#B9C6C0' },
  { step: 400, hex: '#9AA7A3' },
  { step: 500, hex: '#75847D' },
  { step: 600, hex: '#5B6B65' },
  { step: 700, hex: '#3B4D43' },
  { step: 800, hex: '#22342A' },
  { step: 900, hex: '#0E1B16' },
];

export const ColorFoundationsView: FC = () => {
  return (
    <div className="w-full">
      {/* Header Tag */}
      <div className="mb-2.5">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#166B4B] uppercase font-sans">
          01 / FOUNDATIONS
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-[34px] md:text-[38px] font-bold text-primary tracking-tight leading-tight mb-2">
        Color <span className="font-normal mx-0.5 text-primary">·</span> purpose before pigment
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-[15px] text-secondary leading-relaxed mb-9 sm:mb-11">
        Components bind to semantic roles; primitives are reference values only.
      </p>

      {/* Color Palette Grid: 4 Rows */}
      <div className="space-y-6 sm:space-y-8">
        <PaletteRow scaleName="Forest" colors={forestScale} />
        <PaletteRow scaleName="Emerald" colors={emeraldScale} />
        <PaletteRow scaleName="Amber" colors={amberScale} />
        <PaletteRow scaleName="Neutral" colors={neutralScale} />
      </div>

      {/* Accessible Defaults Section */}
      <AccessibleDefaults />
    </div>
  );
};

export default ColorFoundationsView;

