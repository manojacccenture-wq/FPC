import { useState, type FC } from 'react';
import { Plus, ArrowRight, Download, Sparkles, RefreshCw } from 'lucide-react';
import { Button, type ButtonVariant, type ButtonSize } from '../shared/components/Button';

export const ButtonShowcaseView: FC = () => {
  // Playground interactive state
  const [playVariant, setPlayVariant] = useState<ButtonVariant>('primary');
  const [playSize, setPlaySize] = useState<ButtonSize>('md');
  const [playLoading, setPlayLoading] = useState(false);
  const [playDisabled, setPlayDisabled] = useState(false);
  const [playLeadingIcon, setPlayLeadingIcon] = useState(false);
  const [playTrailingIcon, setPlayTrailingIcon] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="w-full max-w-[960px] pb-16">
      {/* Title & Description */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#0E1B16] tracking-tight leading-tight mb-1">
          Button
        </h1>
        <p className="text-xs sm:text-[13px] text-[#5B6B65]">
          One primary action per region. Interactive states preserve a consistent footprint.
        </p>
      </div>

      {/* =========================================================================
          Exact 4-Column Design System Matrix (Matching Reference Image)
          ========================================================================= */}
      <div className="space-y-3.5 mb-10">

        {/* --- Primary Buttons --- */}
        {/* Row 1: S Primary (Default, Hover, Focus, Pressed) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="primary" size="sm" state="default" className="w-full">Continue</Button>
          <Button variant="primary" size="sm" state="hover" className="w-full">Continue</Button>
          <Button variant="primary" size="sm" state="focus" className="w-full">Continue</Button>
          <Button variant="primary" size="sm" state="pressed" className="w-full">Continue</Button>
        </div>

        {/* Row 2: S Primary (Disabled, Loading) + M Primary (Default, Hover) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="primary" size="sm" state="disabled" className="w-full">Continue</Button>
          <Button variant="primary" size="sm" state="loading" className="w-full">Continue</Button>
          <Button variant="primary" size="md" state="default" className="w-full">Continue</Button>
          <Button variant="primary" size="md" state="hover" className="w-full">Continue</Button>
        </div>

        {/* Row 3: M Primary (Focus, Pressed, Disabled, Loading) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="primary" size="md" state="focus" className="w-full">Continue</Button>
          <Button variant="primary" size="md" state="pressed" className="w-full">Continue</Button>
          <Button variant="primary" size="md" state="disabled" className="w-full">Continue</Button>
          <Button variant="primary" size="md" state="loading" className="w-full">Continue</Button>
        </div>

        {/* Row 4: L Primary (Default, Hover, Focus, Pressed) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="primary" size="lg" state="default" className="w-full">Continue</Button>
          <Button variant="primary" size="lg" state="hover" className="w-full">Continue</Button>
          <Button variant="primary" size="lg" state="focus" className="w-full">Continue</Button>
          <Button variant="primary" size="lg" state="pressed" className="w-full">Continue</Button>
        </div>

        {/* Row 5: L Primary (Disabled, Loading) + S Secondary (Default, Hover) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="primary" size="lg" state="disabled" className="w-full">Continue</Button>
          <Button variant="primary" size="lg" state="loading" className="w-full">Continue</Button>
          <Button variant="secondary" size="sm" state="default" className="w-full">Continue</Button>
          <Button variant="secondary" size="sm" state="hover" className="w-full">Continue</Button>
        </div>

        {/* --- Secondary Buttons --- */}
        {/* Row 6: S Secondary (Focus, Pressed, Disabled, Loading) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="secondary" size="sm" state="focus" className="w-full">Continue</Button>
          <Button variant="secondary" size="sm" state="pressed" className="w-full">Continue</Button>
          <Button variant="secondary" size="sm" state="disabled" className="w-full">Continue</Button>
          <Button variant="secondary" size="sm" state="loading" className="w-full">Continue</Button>
        </div>

        {/* Row 7: M Secondary (Default, Hover, Focus, Pressed) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="secondary" size="md" state="default" className="w-full">Continue</Button>
          <Button variant="secondary" size="md" state="hover" className="w-full">Continue</Button>
          <Button variant="secondary" size="md" state="focus" className="w-full">Continue</Button>
          <Button variant="secondary" size="md" state="pressed" className="w-full">Continue</Button>
        </div>

        {/* Row 8: M Secondary (Disabled, Loading) + L Secondary (Default, Hover) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="secondary" size="md" state="disabled" className="w-full">Continue</Button>
          <Button variant="secondary" size="md" state="loading" className="w-full">Continue</Button>
          <Button variant="secondary" size="lg" state="default" className="w-full">Continue</Button>
          <Button variant="secondary" size="lg" state="hover" className="w-full">Continue</Button>
        </div>

        {/* Row 9: L Secondary (Focus, Pressed, Disabled, Loading) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="secondary" size="lg" state="focus" className="w-full">Continue</Button>
          <Button variant="secondary" size="lg" state="pressed" className="w-full">Continue</Button>
          <Button variant="secondary" size="lg" state="disabled" className="w-full">Continue</Button>
          <Button variant="secondary" size="lg" state="loading" className="w-full">Continue</Button>
        </div>

        {/* --- Ghost / Outline Buttons --- */}
        {/* Row 10: S Ghost (Default, Hover, Focus, Pressed) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="ghost" size="sm" state="default" className="w-full">Continue</Button>
          <Button variant="ghost" size="sm" state="hover" className="w-full">Continue</Button>
          <Button variant="ghost" size="sm" state="focus" className="w-full">Continue</Button>
          <Button variant="ghost" size="sm" state="pressed" className="w-full">Continue</Button>
        </div>

        {/* Row 11: S Ghost (Disabled, Loading) + M Ghost (Default, Hover) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="ghost" size="sm" state="disabled" className="w-full">Continue</Button>
          <Button variant="ghost" size="sm" state="loading" className="w-full">Continue</Button>
          <Button variant="ghost" size="md" state="default" className="w-full">Continue</Button>
          <Button variant="ghost" size="md" state="hover" className="w-full">Continue</Button>
        </div>

        {/* Row 12: M Ghost (Focus, Pressed, Disabled, Loading) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="ghost" size="md" state="focus" className="w-full">Continue</Button>
          <Button variant="ghost" size="md" state="pressed" className="w-full">Continue</Button>
          <Button variant="ghost" size="md" state="disabled" className="w-full">Continue</Button>
          <Button variant="ghost" size="md" state="loading" className="w-full">Continue</Button>
        </div>

        {/* Row 13: L Ghost (Default, Hover, Focus, Pressed) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="ghost" size="lg" state="default" className="w-full">Continue</Button>
          <Button variant="ghost" size="lg" state="hover" className="w-full">Continue</Button>
          <Button variant="ghost" size="lg" state="focus" className="w-full">Continue</Button>
          <Button variant="ghost" size="lg" state="pressed" className="w-full">Continue</Button>
        </div>

        {/* Row 14: L Ghost (Disabled, Loading) + S Destructive (Default, Hover) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="ghost" size="lg" state="disabled" className="w-full">Continue</Button>
          <Button variant="ghost" size="lg" state="loading" className="w-full">Continue</Button>
          <Button variant="destructive" size="sm" state="default" className="w-full">Continue</Button>
          <Button variant="destructive" size="sm" state="hover" className="w-full">Continue</Button>
        </div>

        {/* --- Destructive Buttons --- */}
        {/* Row 15: S Destructive (Focus, Pressed, Disabled, Loading) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="destructive" size="sm" state="focus" className="w-full">Continue</Button>
          <Button variant="destructive" size="sm" state="pressed" className="w-full">Continue</Button>
          <Button variant="destructive" size="sm" state="disabled" className="w-full">Continue</Button>
          <Button variant="destructive" size="sm" state="loading" className="w-full">Continue</Button>
        </div>

        {/* Row 16: M Destructive (Default, Hover, Focus, Pressed) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="destructive" size="md" state="default" className="w-full">Continue</Button>
          <Button variant="destructive" size="md" state="hover" className="w-full">Continue</Button>
          <Button variant="destructive" size="md" state="focus" className="w-full">Continue</Button>
          <Button variant="destructive" size="md" state="pressed" className="w-full">Continue</Button>
        </div>

        {/* Row 17: M Destructive (Disabled, Loading) + L Destructive (Default, Hover) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="destructive" size="md" state="disabled" className="w-full">Continue</Button>
          <Button variant="destructive" size="md" state="loading" className="w-full">Continue</Button>
          <Button variant="destructive" size="lg" state="default" className="w-full">Continue</Button>
          <Button variant="destructive" size="lg" state="hover" className="w-full">Continue</Button>
        </div>

        {/* Row 18: L Destructive (Focus, Pressed, Disabled, Loading) */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 items-center">
          <Button variant="destructive" size="lg" state="focus" className="w-full">Continue</Button>
          <Button variant="destructive" size="lg" state="pressed" className="w-full">Continue</Button>
          <Button variant="destructive" size="lg" state="disabled" className="w-full">Continue</Button>
          <Button variant="destructive" size="lg" state="loading" className="w-full">Continue</Button>
        </div>

        {/* --- Icon-Only Buttons --- */}
        {/* Row 19: S and M Icon-only buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
          {/* S size icon-only */}
          <Button iconOnly size="sm" variant="ghost" state="default"><Plus className="w-4 h-4 text-[#166B4B]" /></Button>
          <Button iconOnly size="sm" variant="ghost" state="focus"><Plus className="w-4 h-4 text-[#166B4B]" /></Button>
          <Button iconOnly size="sm" variant="ghost" state="hover"><Plus className="w-4 h-4 text-[#166B4B]" /></Button>
          <Button iconOnly size="sm" variant="ghost" state="disabled"><Plus className="w-4 h-4 text-[#9AA7A3]" /></Button>
          <Button iconOnly size="sm" variant="ghost" state="loading" />

          {/* M size icon-only */}
          <Button iconOnly size="md" variant="ghost" state="default"><Plus className="w-5 h-5 text-[#166B4B]" /></Button>
          <Button iconOnly size="md" variant="ghost" state="focus"><Plus className="w-5 h-5 text-[#166B4B]" /></Button>
          <Button iconOnly size="md" variant="ghost" state="hover"><Plus className="w-5 h-5 text-[#166B4B]" /></Button>
          <Button iconOnly size="md" variant="ghost" state="disabled"><Plus className="w-5 h-5 text-[#9AA7A3]" /></Button>
          <Button iconOnly size="md" variant="ghost" state="loading" />
          <Button iconOnly size="md" variant="ghost" state="default"><Plus className="w-5 h-5 text-[#166B4B]" /></Button>
        </div>

        {/* Row 20: L Icon-only buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
          <Button iconOnly size="lg" variant="ghost" state="default"><Plus className="w-6 h-6 text-[#166B4B]" /></Button>
          <Button iconOnly size="lg" variant="ghost" state="focus"><Plus className="w-6 h-6 text-[#166B4B]" /></Button>
          <Button iconOnly size="lg" variant="ghost" state="hover"><Plus className="w-6 h-6 text-[#166B4B]" /></Button>
          <Button iconOnly size="lg" variant="ghost" state="disabled"><Plus className="w-6 h-6 text-[#9AA7A3]" /></Button>
          <Button iconOnly size="lg" variant="ghost" state="loading" />
        </div>
      </div>

      {/* =========================================================================
          Footer: Anatomy & Properties / Token Specs (Exact Match)
          ========================================================================= */}
      <div className="pt-6 border-t border-[#E1E8E6] text-xs font-normal text-[#0E1B16] space-y-3.5 mb-14">
        <div className="font-bold text-[11px] tracking-wider text-[#166B4B] uppercase">
          Anatomy &amp; Properties
        </div>
        <p className="text-[#0E1B16] leading-relaxed">
          Kind: Primary / Secondary / Ghost / Destructive / Icon-only · Size: S / M / L · State: Default / Hover / Focus / Pressed / Disabled / Loading<br />
          Label: text · Leading icon: boolean · Icon: instance-swap · Trailing icon: boolean · Trailing icon glyph: instance-swap<br />
          Icon-only always shows its icon; loading always shows its progress glyph.
        </p>
        <div className="space-y-1.5 text-[#5B6B65] leading-relaxed pt-1">
          <p><strong className="text-[#0E1B16]">USE</strong> Verb-first labels. Default M is 44 px. S requires a larger invisible hit area.</p>
          <p><strong className="text-[#0E1B16]">AVOID</strong> Relying on color alone or hiding labels.</p>
          <p><strong className="text-[#0E1B16]">TOKENS</strong> Semantic fills + text; space/8, space/16; radius/md.</p>
          <p><strong className="text-[#0E1B16]">ACCESSIBILITY</strong> Persistent names, logical focus order, 44 px hit target.</p>
        </div>
      </div>

      {/* =========================================================================
          Interactive Playground & Real-world Usage Section
          ========================================================================= */}
      <div className="bg-[#F8FAF9] border border-[#E1E8E6] rounded-[12px] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E1E8E6]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0E1B16] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166B4B]" />
              Live Interactive Playground
            </h2>
            <p className="text-xs text-[#5B6B65] mt-0.5">
              Interact, test keyboard tab-focus, click triggers, and customize button configurations in real-time.
            </p>
          </div>
          <div className="text-xs font-medium text-[#5B6B65] bg-white px-3 py-1.5 rounded-full border border-[#E1E8E6] shadow-xs">
            Clicks: <span className="text-[#166B4B] font-bold">{clickCount}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-xs">
          {/* Variant Selector */}
          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">Variant</label>
            <select
              value={playVariant}
              onChange={(e) => setPlayVariant(e.target.value as ButtonVariant)}
              className="w-full bg-white border border-[#CDD7D4] rounded-[6px] px-2.5 py-1.5 text-xs text-[#0E1B16] focus:outline-none focus:border-[#166B4B]"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
              <option value="destructive">Destructive</option>
            </select>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">Size</label>
            <div className="flex rounded-[6px] border border-[#CDD7D4] overflow-hidden bg-white">
              {(['sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlaySize(s)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors uppercase ${
                    playSize === s
                      ? 'bg-[#166B4B] text-white font-bold'
                      : 'text-[#5B6B65] hover:bg-[#F5F8F7]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* State Switches */}
          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">States</label>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#5B6B65] hover:text-[#0E1B16]">
                <input
                  type="checkbox"
                  checked={playLoading}
                  onChange={(e) => setPlayLoading(e.target.checked)}
                  className="rounded text-[#166B4B] focus:ring-[#166B4B]"
                />
                Loading
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#5B6B65] hover:text-[#0E1B16]">
                <input
                  type="checkbox"
                  checked={playDisabled}
                  onChange={(e) => setPlayDisabled(e.target.checked)}
                  className="rounded text-[#166B4B] focus:ring-[#166B4B]"
                />
                Disabled
              </label>
            </div>
          </div>

          {/* Icon Toggles */}
          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">Icons</label>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#5B6B65] hover:text-[#0E1B16]">
                <input
                  type="checkbox"
                  checked={playLeadingIcon}
                  onChange={(e) => setPlayLeadingIcon(e.target.checked)}
                  className="rounded text-[#166B4B] focus:ring-[#166B4B]"
                />
                Leading
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#5B6B65] hover:text-[#0E1B16]">
                <input
                  type="checkbox"
                  checked={playTrailingIcon}
                  onChange={(e) => setPlayTrailingIcon(e.target.checked)}
                  className="rounded text-[#166B4B] focus:ring-[#166B4B]"
                />
                Trailing
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview Stage */}
        <div className="bg-white border border-[#E1E8E6] rounded-[8px] p-8 flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[140px]">
          <Button
            variant={playVariant}
            size={playSize}
            loading={playLoading}
            disabled={playDisabled}
            leadingIcon={playLeadingIcon ? <Download className="w-4 h-4" /> : undefined}
            trailingIcon={playTrailingIcon ? <ArrowRight className="w-4 h-4" /> : undefined}
            onClick={() => setClickCount(c => c + 1)}
          >
            Submit Application
          </Button>

          <Button
            variant={playVariant}
            size={playSize}
            iconOnly
            loading={playLoading}
            disabled={playDisabled}
            onClick={() => setClickCount(c => c + 1)}
            aria-label="Add item"
          >
            <Plus className="w-4 h-4" />
          </Button>

          <button
            type="button"
            onClick={() => {
              setPlayVariant('primary');
              setPlaySize('md');
              setPlayLoading(false);
              setPlayDisabled(false);
              setPlayLeadingIcon(false);
              setPlayTrailingIcon(false);
              setClickCount(0);
            }}
            className="text-xs text-[#5B6B65] hover:text-[#166B4B] flex items-center gap-1 cursor-pointer ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Real-world Use Case Previews */}
        <div className="mt-8 pt-6 border-t border-[#E1E8E6]">
          <h3 className="text-xs font-bold text-[#0E1B16] uppercase tracking-wider mb-4">
            Farmer Portal Workflow Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Form actions bar */}
            <div className="bg-white p-4 rounded-[8px] border border-[#E1E8E6]">
              <span className="text-[11px] font-semibold text-[#5B6B65] uppercase block mb-3">Modal Footer</span>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save changes</Button>
              </div>
            </div>

            {/* Critical confirmation */}
            <div className="bg-white p-4 rounded-[8px] border border-[#E1E8E6]">
              <span className="text-[11px] font-semibold text-[#5B6B65] uppercase block mb-3">Destructive Modal</span>
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm">Keep crop record</Button>
                <Button variant="destructive" size="sm">Delete record</Button>
              </div>
            </div>

            {/* Stepper controls */}
            <div className="bg-white p-4 rounded-[8px] border border-[#E1E8E6]">
              <span className="text-[11px] font-semibold text-[#5B6B65] uppercase block mb-3">Onboarding Step</span>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm">Back</Button>
                <Button variant="primary" size="sm" trailingIcon={<ArrowRight className="w-3.5 h-3.5" />}>Continue</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
