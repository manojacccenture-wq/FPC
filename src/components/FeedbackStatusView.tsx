import { useState, type FC } from 'react';
import { Alert, type AlertTone, type AlertVariant, type AlertSize } from '../shared/components/Alert';
import { Badge } from '../shared/components/Badge';
import { Sparkles, Bell } from 'lucide-react';

export const FeedbackStatusView: FC = () => {
  // Interactive playground state
  const [activeTone, setActiveTone] = useState<AlertTone>('success');
  const [activeVariant, setActiveVariant] = useState<AlertVariant>('bordered');
  const [activeSize, setActiveSize] = useState<AlertSize>('md');
  const [customText, setCustomText] = useState('Payment receipt uploaded successfully.');
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <div className="w-full max-w-[960px] pb-16">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#0E1B16] tracking-tight leading-tight mb-1">
          Feedback &amp; status
        </h1>
        <p className="text-xs sm:text-[13px] text-[#5B6B65]">
          Status is expressed with a label, icon and supporting copy.
        </p>
      </div>

      {/* Main Single-Column Stack matching Reference Image */}
      <div className="w-full max-w-[420px] space-y-2.5 mb-8">
        
        {/* =========================================================================
            Group 1: Compact Soft Alerts (h=34px, subtle / border-transparent)
            ========================================================================= */}
        <Alert tone="info" variant="soft" size="sm">
          Your changes are saved automatically
        </Alert>

        <Alert tone="success" variant="soft" size="sm">
          Your changes are saved automatically
        </Alert>

        <Alert tone="warning" variant="soft" size="sm">
          Your changes are saved automatically
        </Alert>

        <Alert tone="danger" variant="soft" size="sm">
          Your changes are saved automatically
        </Alert>

        <Alert tone="demo" variant="soft" size="sm">
          Your changes are saved automatically
        </Alert>

        {/* =========================================================================
            Group 2: Compact Bordered Alerts (h=34px with 1px tone border)
            ========================================================================= */}
        <div className="pt-1.5 space-y-2.5">
          <Alert tone="info" variant="bordered" size="sm">
            Your changes are saved automatically
          </Alert>

          <Alert tone="success" variant="bordered" size="sm">
            Your changes are saved automatically
          </Alert>

          <Alert tone="warning" variant="bordered" size="sm">
            Your changes are saved automatically
          </Alert>

          <Alert tone="danger" variant="bordered" size="sm">
            Your changes are saved automatically
          </Alert>

          <Alert tone="demo" variant="bordered" size="sm">
            Your changes are saved automatically
          </Alert>
        </div>

        {/* =========================================================================
            Group 3: Medium / Card Alerts (h=48px, generous padding & clear icons)
            ========================================================================= */}
        <div className="pt-2 space-y-3">
          <Alert tone="info" variant="bordered" size="lg">
            Your changes are saved automatically
          </Alert>

          <Alert tone="success" variant="bordered" size="lg">
            Your changes are saved automatically
          </Alert>

          <Alert tone="warning" variant="bordered" size="lg">
            Your changes are saved automatically
          </Alert>

          <Alert tone="danger" variant="bordered" size="lg">
            Your changes are saved automatically
          </Alert>

          <Alert tone="demo" variant="bordered" size="lg">
            Your changes are saved automatically
          </Alert>
        </div>

        {/* =========================================================================
            Group 4: Badges / Tags / Status Pills (Exact Match)
            ========================================================================= */}
        <div className="pt-4 flex flex-col items-start gap-2.5">
          <div>
            <Badge variant="brand">Online</Badge>
          </div>

          <div>
            <Badge variant="brand">Active</Badge>
          </div>

          <div>
            <Badge variant="brand">Pending</Badge>
          </div>

          <div>
            <Badge variant="brand">Self-Registration</Badge>
          </div>

          <div>
            <Badge variant="brand">Draft</Badge>
          </div>

          <div>
            <Badge variant="count">7</Badge>
          </div>

          <div>
            <Badge variant="brand" uppercase>DEMO MODE</Badge>
          </div>

          <div>
            <Badge variant="brand" uppercase>
              WORKFLOW STEP 1 OF 6 • TSF ADMIN LOGIN
            </Badge>
          </div>
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
          Tone: Info / Success / Warning / Danger / Demo · Label: text<br />
          Badges: Online, Active, Pending, Self-Registration, Draft, count, environment, workflow.
        </p>
        <div className="space-y-1.5 text-[#5B6B65] leading-relaxed pt-1">
          <p><strong className="text-[#0E1B16]">USE</strong> Use alerts for persistent feedback and toasts for non-blocking updates. role=status; danger role=alert.</p>
          <p><strong className="text-[#0E1B16]">AVOID</strong> Relying on color alone or hiding labels.</p>
          <p><strong className="text-[#0E1B16]">TOKENS</strong> Semantic fills + text; space/8, space/16; radius/md.</p>
          <p><strong className="text-[#0E1B16]">ACCESSIBILITY</strong> Persistent names, logical focus order, 44 px hit target.</p>
        </div>
      </div>

      {/* =========================================================================
          Interactive Playground & Real-World Use Cases
          ========================================================================= */}
      <div className="bg-[#F8FAF9] border border-[#E1E8E6] rounded-[12px] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E1E8E6]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0E1B16] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166B4B]" />
              Live Feedback &amp; Badge Playground
            </h2>
            <p className="text-xs text-[#5B6B65] mt-0.5">
              Test dynamic status banners, dismissible actions, aria-live semantics, and status pill styles.
            </p>
          </div>
          <div className="text-xs font-medium text-[#5B6B65] bg-white px-3 py-1.5 rounded-full border border-[#E1E8E6] shadow-xs flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#166B4B]" />
            Accessible Live Region
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs">
          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">Tone</label>
            <select
              value={activeTone}
              onChange={(e) => setActiveTone(e.target.value as AlertTone)}
              className="w-full bg-white border border-[#CDD7D4] rounded-[6px] px-2.5 py-1.5 text-xs text-[#0E1B16] focus:outline-none focus:border-[#166B4B]"
            >
              <option value="info">Info (Blue)</option>
              <option value="success">Success (Green)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="danger">Danger (Red)</option>
              <option value="demo">Demo (Brand)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">Size / Height</label>
            <div className="flex rounded-[6px] border border-[#CDD7D4] overflow-hidden bg-white">
              {(['sm', 'md', 'lg'] as AlertSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveSize(s)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors uppercase ${
                    activeSize === s
                      ? 'bg-[#166B4B] text-white font-bold'
                      : 'text-[#5B6B65] hover:bg-[#F5F8F7]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0E1B16] mb-1.5">Variant</label>
            <div className="flex rounded-[6px] border border-[#CDD7D4] overflow-hidden bg-white">
              {(['soft', 'bordered', 'card'] as AlertVariant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setActiveVariant(v)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors capitalize ${
                    activeVariant === v
                      ? 'bg-[#166B4B] text-white font-bold'
                      : 'text-[#5B6B65] hover:bg-[#F5F8F7]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label className="block font-semibold text-[#0E1B16] text-xs mb-1.5">Custom Alert Message</label>
          <input
            type="text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setIsDismissed(false);
            }}
            placeholder="Type a feedback notification..."
            className="w-full bg-white border border-[#CDD7D4] rounded-[6px] px-3 py-2 text-xs text-[#0E1B16] focus:outline-none focus:border-[#166B4B]"
          />
        </div>

        {/* Live Preview Display */}
        <div className="bg-white border border-[#E1E8E6] rounded-[8px] p-6 mb-8 flex flex-col items-center justify-center min-h-[100px]">
          {!isDismissed ? (
            <div className="w-full max-w-[500px]">
              <Alert
                tone={activeTone}
                variant={activeVariant}
                size={activeSize}
                onClose={() => setIsDismissed(true)}
              >
                {customText || "Notification message"}
              </Alert>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xs text-[#5B6B65] block mb-2">Alert was dismissed</span>
              <button
                type="button"
                onClick={() => setIsDismissed(false)}
                className="text-xs text-[#166B4B] font-semibold hover:underline cursor-pointer"
              >
                Restore Alert
              </button>
            </div>
          )}
        </div>

        {/* Status Badges Matrix in Table Context */}
        <div className="border-t border-[#E1E8E6] pt-6">
          <h3 className="text-xs font-bold text-[#0E1B16] uppercase tracking-wider mb-4">
            Production Table Status Badges
          </h3>
          <div className="bg-white rounded-[8px] border border-[#E1E8E6] overflow-hidden text-xs">
            <div className="grid grid-cols-4 px-4 py-2.5 bg-[#F8FAF9] border-b border-[#E1E8E6] font-semibold text-[#5B6B65]">
              <span>Farmer Name</span>
              <span>Crop / Produce</span>
              <span>Application Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-[#E1E8E6]">
              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-medium text-[#0E1B16]">Ramesh Patel</span>
                <span className="text-[#5B6B65]">Organic Wheat</span>
                <div>
                  <Badge variant="brand" dot>Online</Badge>
                </div>
                <div className="text-right text-[#166B4B] font-medium hover:underline cursor-pointer">View</div>
              </div>

              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-medium text-[#0E1B16]">Sunita Devi</span>
                <span className="text-[#5B6B65]">Basmati Paddy</span>
                <div>
                  <Badge variant="brand" dot>Active</Badge>
                </div>
                <div className="text-right text-[#166B4B] font-medium hover:underline cursor-pointer">View</div>
              </div>

              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-medium text-[#0E1B16]">Anil Kumar</span>
                <span className="text-[#5B6B65]">Mustard Seeds</span>
                <div>
                  <Badge variant="warning" dot>Pending</Badge>
                </div>
                <div className="text-right text-[#166B4B] font-medium hover:underline cursor-pointer">Review</div>
              </div>

              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-medium text-[#0E1B16]">Gopal Sahu</span>
                <span className="text-[#5B6B65]">Finger Millet</span>
                <div>
                  <Badge variant="neutral">Draft</Badge>
                </div>
                <div className="text-right text-[#166B4B] font-medium hover:underline cursor-pointer">Edit</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
