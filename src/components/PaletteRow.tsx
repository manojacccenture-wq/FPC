import type { FC } from 'react';
import { ColorSwatch } from './ColorSwatch';

export interface ColorScaleItem {
  step: number;
  hex: string;
}

interface PaletteRowProps {
  scaleName: string;
  colors: ColorScaleItem[];
}

export const PaletteRow: FC<PaletteRowProps> = ({ scaleName, colors }) => {
  return (
    <div className="grid grid-cols-10 gap-3 sm:gap-5 md:gap-6 w-full">
      {colors.map((item) => (
        <ColorSwatch
          key={item.step}
          step={item.step}
          hex={item.hex}
          name={scaleName}
        />
      ))}
    </div>
  );
};
