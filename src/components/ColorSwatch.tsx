import { useState, type FC } from 'react';

interface ColorSwatchProps {
  step: number;
  hex: string;
  name?: string;
}

export const ColorSwatch: FC<ColorSwatchProps> = ({ step, hex, name }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center group relative">
      {/* Swatch Box */}
      <button
        type="button"
        onClick={handleCopy}
        title={`Click to copy ${hex} (${name ? `${name} ` : ''}${step})`}
        aria-label={`Copy color ${hex}`}
        className="w-full h-11 sm:h-12 rounded-[4px] cursor-pointer transition-all duration-150 hover:scale-[1.04] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 relative overflow-hidden"
        style={{
          backgroundColor: hex,
          border: step <= 100 ? '1px solid rgba(14, 27, 22, 0.08)' : 'none',
        }}
      >
        {/* Subtle Copied Toast Indicator */}
        {copied && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[10px] font-medium tracking-wide">
            COPIED
          </span>
        )}
      </button>

      {/* Step Number Label */}
      <span className="mt-2 text-xs font-normal text-primary">
        {step}
      </span>

      {/* Floating Tooltip with Hex Code on Hover */}
      <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-20 shadow-md">
        {hex}
      </div>
    </div>
  );
};
