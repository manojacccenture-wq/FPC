import type { FC } from 'react';
import { Checkbox } from '../shared/components/Checkbox';
import { Radio } from '../shared/components/Radio';
import { Switch } from '../shared/components/Switch';
import { FileUpload } from '../shared/components/FileUpload';

export const SelectionUploadView: FC = () => {
  return (
    <div className="w-full max-w-[960px]">
      {/* Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[28px] font-bold text-primary tracking-tight leading-tight mb-1">
          Selection &amp; upload
        </h1>
        <p className="text-xs sm:text-[13px] text-secondary">
          Selection controls provide explicit text, not color-only feedback.
        </p>
      </div>

      {/* Two Column Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mb-14">
        
        {/* ==========================================================
            1. CHECKBOXES ("I confirm these details")
            ========================================================== */}

        {/* Row 1 */}
        <div>
          <Checkbox label="I confirm these details" checked={false} />
        </div>
        <div>
          <Checkbox label="I confirm these details" checked={true} />
        </div>

        {/* Row 2 */}
        <div>
          <Checkbox label="I confirm these details" card checked={false} containerClassName="border-[#166B4B]" />
        </div>
        <div>
          <Checkbox label="I confirm these details" disabled checked={false} />
        </div>

        {/* Row 3 */}
        <div>
          <Checkbox label="I confirm these details" card checked={false} containerClassName="border-[#A61A24]" />
        </div>
        <div>
          <Checkbox label="I confirm these details" disabled checked={false} />
        </div>

        {/* Row 4 */}
        <div>
          <Checkbox label="I confirm these details" checked={true} />
        </div>
        <div>
          <Checkbox label="I confirm these details" checked="mixed" />
        </div>

        {/* Row 5 */}
        <div>
          <Checkbox label="I confirm these details" card checked={false} containerClassName="bg-[#F5F8F7] border-transparent" />
        </div>
        <div>
          <Checkbox label="I confirm these details" card checked={true} containerClassName="bg-[#EDF8F3] border-transparent" />
        </div>

        {/* Row 6 */}
        <div>
          <Checkbox label="I confirm these details" card checked="mixed" containerClassName="bg-[#F5F8F7] border-transparent" />
        </div>
        <div>
          <Checkbox label="I confirm these details" card checked={true} containerClassName="bg-[#EDF8F3] border-[#166B4B]" />
        </div>

        {/* Row 7 */}
        <div>
          <Checkbox label="I confirm these details" card checked="mixed" containerClassName="border-[#166B4B]" />
        </div>
        <div>
          <Checkbox label="I confirm these details" card checked={false} containerClassName="bg-[#EDF8F3] border-transparent" />
        </div>

        {/* Row 8 */}
        <div>
          <Checkbox label="I confirm these details" card checked={true} containerClassName="bg-[#EDF8F3] border-transparent" />
        </div>
        <div>
          <Checkbox label="I confirm these details" card checked="mixed" containerClassName="bg-[#EDF8F3] border-transparent" />
        </div>

        {/* Row 9 */}
        <div>
          <Checkbox label="I confirm these details" card checked={true} containerClassName="border-[#BCE5D3] bg-[#EDF8F3]" />
        </div>
        <div>
          <Checkbox label="I confirm these details" card checked="mixed" containerClassName="border-[#BCE5D3] bg-[#EDF8F3]" />
        </div>

        {/* Row 10 */}
        <div>
          <Checkbox label="I confirm these details" card checked={true} containerClassName="border-[#166B4B]" />
        </div>
        <div>
          <Checkbox label="I confirm these details" card checked="mixed" containerClassName="border-[#A61A24]" />
        </div>

        {/* Row 11 */}
        <div>
          <Checkbox label="I confirm these details" checked={true} />
        </div>
        <div>
          <Checkbox label="I confirm these details" checked="mixed" />
        </div>


        {/* ==========================================================
            2. RADIOS ("Use registered address")
            ========================================================== */}

        {/* Row 12 */}
        <div className="pt-2">
          <Radio label="Use registered address" checked={false} name="demo-radio-1" />
        </div>
        <div className="pt-2">
          <Radio label="Use registered address" checked={true} name="demo-radio-2" />
        </div>

        {/* Row 13 */}
        <div>
          <Radio label="Use registered address" card checked={false} containerClassName="border-[#166B4B]" name="demo-radio-3" />
        </div>
        <div>
          <Radio label="Use registered address" disabled checked={true} name="demo-radio-4" />
        </div>

        {/* Row 14 */}
        <div>
          <Radio label="Use registered address" card checked={false} containerClassName="border-[#A61A24]" name="demo-radio-5" />
        </div>
        <div>
          <Radio label="Use registered address" disabled checked={false} name="demo-radio-6" />
        </div>

        {/* Row 15 */}
        <div>
          <Radio label="Use registered address" checked={true} name="demo-radio-7" />
        </div>
        <div>
          <Radio label="Use registered address" card checked={false} containerClassName="bg-[#F5F8F7] border-transparent" name="demo-radio-8" />
        </div>

        {/* Row 16 */}
        <div>
          <Radio label="Use registered address" card checked={true} containerClassName="bg-[#F5F8F7] border-transparent" name="demo-radio-9" />
        </div>
        <div>
          <Radio label="Use registered address" card checked={true} containerClassName="bg-[#EDF8F3] border-[#166B4B]" name="demo-radio-10" />
        </div>

        {/* Row 17 */}
        <div>
          <Radio label="Use registered address" card checked={false} containerClassName="bg-[#EDF8F3] border-transparent" name="demo-radio-11" />
        </div>
        <div>
          <Radio label="Use registered address" card checked={true} containerClassName="bg-[#EDF8F3] border-transparent" name="demo-radio-12" />
        </div>

        {/* Row 18 */}
        <div>
          <Radio label="Use registered address" card checked={true} containerClassName="border-[#166B4B] ring-2 ring-[#166B4B] ring-offset-2" name="demo-radio-13" />
        </div>
        <div>
          <Radio label="Use registered address" card checked={true} containerClassName="border-[#A61A24]" name="demo-radio-14" />
        </div>

        {/* Row 19 */}
        <div>
          <Radio label="Use registered address" checked={true} name="demo-radio-15" />
        </div>
        <div />


        {/* ==========================================================
            3. SWITCHES (Sync paused / Connected · Sync enabled)
            ========================================================== */}

        {/* Row 20 */}
        <div className="pt-2">
          <Switch checked={false} offLabel="Sync paused" label="Connected · Sync enabled" />
        </div>
        <div className="pt-2">
          <Switch checked={true} offLabel="Sync paused" label="Connected · Sync enabled" />
        </div>

        {/* Row 21 */}
        <div>
          <Switch card checked={false} offLabel="Sync paused" containerClassName="border-[#166B4B]" />
        </div>
        <div>
          <Switch disabled checked={false} offLabel="Sync paused" />
        </div>

        {/* Row 22 */}
        <div>
          <Switch card checked={false} offLabel="Sync paused" containerClassName="border-[#A61A24]" />
        </div>
        <div>
          <Switch loading checked={false} offLabel="Connecting..." />
        </div>

        {/* Row 23 */}
        <div>
          <Switch checked={true} label="Connected · Sync enabled" />
        </div>
        <div>
          <Switch card checked={false} offLabel="Sync paused" containerClassName="bg-[#F5F8F7] border-transparent" />
        </div>

        {/* Row 24 */}
        <div>
          <Switch card checked={true} label="Connected · Sync enabled" containerClassName="bg-[#F5F8F7] border-transparent" />
        </div>
        <div>
          <Switch card checked={true} label="Connected · Sync enabled" containerClassName="bg-[#EDF8F3] border-[#166B4B]" />
        </div>

        {/* Row 25 */}
        <div>
          <Switch card checked={false} offLabel="Sync paused" containerClassName="bg-[#EDF8F3] border-transparent" />
        </div>
        <div>
          <Switch card checked={true} label="Connected · Sync enabled" containerClassName="bg-[#EDF8F3] border-transparent" />
        </div>

        {/* Row 26 */}
        <div>
          <Switch disabled checked={true} label="Connected · Sync enabled" />
        </div>
        <div>
          <Switch card checked={true} label="Connected · Sync enabled" containerClassName="border-[#A61A24]" />
        </div>

        {/* Row 27 */}
        <div>
          <Switch loading checked={true} label="Connecting..." />
        </div>
        <div />


        {/* ==========================================================
            4. FILE UPLOADS (4 rows × 2 cols)
            ========================================================== */}

        {/* Row 28 */}
        <div className="pt-4">
          <FileUpload state="idle" />
        </div>
        <div className="pt-4">
          <FileUpload state="ready" fileName="company-logo.png" />
        </div>

        {/* Row 29 */}
        <div>
          <FileUpload state="idle" className="border-[#166B4B]" />
        </div>
        <div>
          <FileUpload state="disabled" />
        </div>

        {/* Row 30 */}
        <div>
          <FileUpload
            state="failed"
            errorMessage="The upload could not be completed. Check your connection and retry."
          />
        </div>
        <div>
          <FileUpload state="uploading" progress={64} />
        </div>

        {/* Row 31 */}
        <div>
          <FileUpload state="idle" highlightMint />
        </div>
        <div>
          <FileUpload state="idle" highlightMint />
        </div>

      </div>

      {/* Anatomy & Properties Footer */}
      <section className="pt-6 border-t border-[#E1E8E6] text-xs sm:text-[13px] leading-relaxed text-[#1E2923]">
        <h2 className="text-xs font-bold tracking-wider text-[#166B4B] uppercase font-sans mb-3">
          ANATOMY &amp; PROPERTIES
        </h2>
        <div className="space-y-1.5 text-[#5B6B65]">
          <p>
            <span className="text-[#0E1B16] font-medium">Checkbox:</span> Off / On / Mixed <span className="mx-1">·</span> <span className="text-[#0E1B16] font-medium">Radio and Switch:</span> Off / On
          </p>
          <p>
            <span className="text-[#0E1B16] font-medium">States:</span> Default / Hover / Focus / Pressed / Disabled / Error / Loading
          </p>
          <p>
            Legacy Selected state remains available. Visual control shapes differ by function, with a 44 px hit target.
          </p>
          <p>
            <span className="text-[#0E1B16] font-medium">USE:</span> Checkbox for multiple values; radio for one; switch updates immediately. Upload: PDF/PNG/JPG, max 15 MB — confirm policy.
          </p>
          <p>
            <span className="text-[#0E1B16] font-medium">AVOID:</span> Relying on color alone; omitting labels.
          </p>
          <p>
            <span className="text-[#0E1B16] font-medium">TOKENS:</span> Semantic 700 on text; space/8; space/16; radius/md.
          </p>
          <p>
            <span className="text-[#0E1B16] font-medium">ACCESSIBILITY:</span> Persistent names; logical focus order; 44 px hit target.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SelectionUploadView;

