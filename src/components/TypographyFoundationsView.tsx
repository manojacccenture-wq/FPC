import type { FC } from 'react';

export const TypographyFoundationsView: FC = () => {
  return (
    <div className="w-full">
      {/* Category Tag */}
      <div className="mb-2.5">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#166B4B] uppercase font-sans">
          02 / FOUNDATIONS
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-[34px] md:text-[38px] font-bold text-primary tracking-tight leading-tight mb-8 sm:mb-10">
        Typography <span className="font-normal mx-0.5 text-primary">·</span> bilingual by design
      </h1>

      {/* Typography Specimen Scale */}
      <div className="space-y-4 sm:space-y-4.5 mb-10 sm:mb-12">
        {/* display 40/48 */}
        <div className="text-[40px] leading-[48px] font-bold text-primary tracking-tight">
          display 40/48 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* h1 32/40 */}
        <div className="text-[32px] leading-[40px] font-bold text-primary tracking-tight">
          h1 32/40 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* h2 24/32 */}
        <div className="text-[24px] leading-[32px] font-semibold text-primary tracking-tight">
          h2 24/32 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* h3 20/28 */}
        <div className="text-[20px] leading-[28px] font-semibold text-primary">
          h3 20/28 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* h4 16/24 */}
        <div className="text-[16px] leading-[24px] font-semibold text-primary">
          h4 16/24 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* body-l 16/24 */}
        <div className="text-[16px] leading-[24px] font-normal text-primary">
          body-l 16/24 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* body-m 14/20 */}
        <div className="text-[14px] leading-[20px] font-normal text-primary">
          body-m 14/20 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* body-s 13/18 */}
        <div className="text-[13px] leading-[18px] font-normal text-primary">
          body-s 13/18 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* caption 12/16 */}
        <div className="text-[12px] leading-[16px] font-normal text-primary">
          caption 12/16 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* EYEBROW 12/16 */}
        <div className="text-[12px] leading-[16px] font-semibold uppercase tracking-[0.08em] text-primary">
          EYEBROW 12/16 <span className="font-normal mx-1">·</span> GROWING STRONGER, TOGETHER
        </div>

        {/* label 14/20 */}
        <div className="text-[14px] leading-[20px] font-medium text-primary">
          label 14/20 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* numeric 32/36 */}
        <div className="text-[32px] leading-[36px] font-bold text-primary tabular-nums">
          numeric 32/36 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* button-l 16/24 */}
        <div className="text-[16px] leading-[24px] font-medium text-primary">
          button-l 16/24 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* button-m 14/20 */}
        <div className="text-[14px] leading-[20px] font-medium text-primary">
          button-m 14/20 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>

        {/* button-s 13/18 */}
        <div className="text-[13px] leading-[18px] font-medium text-primary">
          button-s 13/18 <span className="font-normal mx-1">·</span> Growing stronger, together
        </div>
      </div>

      {/* Production Usage & Fallback Notes */}
      <div className="space-y-1 text-xs sm:text-[13px] leading-relaxed text-[#5B6B65] mb-6">
        <p>Use sentence-case labels. Eyebrow is reserved for workflow context.</p>
        <p>Fallback: Plus Jakarta Sans, Noto Sans Devanagari, Noto Sans Oriya, Noto Sans Tamil, sans-serif. Preserve 30% expansion space.</p>
      </div>

      {/* Bilingual / Multilingual Specimens */}
      <div className="space-y-3 pt-2 text-primary font-normal">
        {/* Hindi (Devanagari) */}
        <p className="text-[16px] sm:text-[17px] leading-relaxed tracking-normal font-sans" lang="hi">
          किसान उत्पादक कंपनी <span className="font-normal mx-1 text-secondary">·</span> स्वागत है
        </p>

        {/* Odia (Oriya) */}
        <p className="text-[16px] sm:text-[17px] leading-relaxed tracking-normal font-sans" lang="or">
          କୃଷକ ଉତ୍ପାଦକ କମ୍ପାନୀ <span className="font-normal mx-1 text-secondary">·</span> ସ୍ୱାଗତ
        </p>
      </div>
    </div>
  );
};

export default TypographyFoundationsView;

