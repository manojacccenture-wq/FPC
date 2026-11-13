import { useState, type FC } from 'react';
import { 
  Input, 
  Select, 
  DatePicker,
  Textarea, 
  Button, 
  Checkbox, 
  Badge, 
  Alert 
} from '../shared/components';
import { 
  Search, 
  Phone, 
  User, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const FormControlsView: FC = () => {
  // Demo interactive states
  const [farmerName, setFarmerName] = useState('Ramesh Patel');
  const [aadhaar, setAadhaar] = useState('9876 5432 1098');
  const [phone, setPhone] = useState('9876543210');
  const [district, setDistrict] = useState('sambalpur');
  const [crop, setCrop] = useState('paddy');
  const [acreage, setAcreage] = useState('4.5');
  const [remarks, setRemarks] = useState('Organically cultivated without synthetic pesticides.');
  const [harvestDate, setHarvestDate] = useState('19-11-2026');
  const [confirmed, setConfirmed] = useState(true);
  
  // Validation state demo
  const [showErrorDemo, setShowErrorDemo] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="w-full max-w-[1200px] pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#0E1B16] tracking-tight leading-tight mb-1">
          Forms &amp; controls
        </h1>
        <p className="text-xs sm:text-[13px] text-[#5B6B65]">
          Standard controls bind to semantic tokens: S (36px), M (44px), L (52px). Persistent labels and linked validation.
        </p>
      </div>

      {/* =========================================================================
          1. Control Heights & States Matrix
          ========================================================================= */}
      <div className="bg-[#F8FAF9] border border-[#E1E8E6] rounded-[12px] p-6 sm:p-8 mb-12">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E1E8E6]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0E1B16] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166B4B]" />
              Control Heights, Sizes &amp; States
            </h2>
            <p className="text-xs text-[#5B6B65] mt-0.5">
              Standard rhythm: Small 36 px (compact), Medium 44 px (default), Large 52 px (prominent).
            </p>
          </div>
          <div className="text-xs font-mono text-[#5B6B65] bg-white px-3 py-1.5 rounded-full border border-[#E1E8E6]">
            Focus: 2px #166B4B + 2px offset
          </div>
        </div>

        {/* 3 Size Comparisons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* S (36px) */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E1E8E6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#166B4B] uppercase tracking-wider">Size S (36 px)</span>
              <span className="text-[11px] font-mono text-[#5B6B65]">h-9 · 13/18px</span>
            </div>
            <Input
              size="sm"
              label="Produce code"
              placeholder="e.g. WH-2026"
              defaultValue="PADDY-04"
            />
            <Select
              size="sm"
              label="Quality Grade"
              defaultValue="grade-a"
              options={[
                { value: 'grade-a', label: 'Grade A (Export)' },
                { value: 'grade-b', label: 'Grade B (Domestic)' },
                { value: 'grade-c', label: 'Grade C (Processing)' },
              ]}
            />
          </div>

          {/* M (44px) - Default */}
          <div className="bg-white p-4 rounded-[8px] border border-[#166B4B] shadow-xs space-y-3 relative">
            <div className="absolute -top-2.5 right-3 bg-[#166B4B] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Default Standard
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#166B4B] uppercase tracking-wider">Size M (44 px)</span>
              <span className="text-[11px] font-mono text-[#5B6B65]">h-11 · 14/20px</span>
            </div>
            <Input
              size="md"
              label="Farmer registration number"
              placeholder="e.g. FPC-OD-2026-09"
              defaultValue="FPC-OD-2026-881"
              required
            />
            <Select
              size="md"
              label="Warehouse location"
              defaultValue="hub-1"
              options={[
                { value: 'hub-1', label: 'Sambalpur Central Storage' },
                { value: 'hub-2', label: 'Bargarh Agro Terminal' },
                { value: 'hub-3', label: 'Jharsuguda Depot' },
              ]}
            />
          </div>

          {/* L (52px) */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E1E8E6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#166B4B] uppercase tracking-wider">Size L (52 px)</span>
              <span className="text-[11px] font-mono text-[#5B6B65]">h-52 · 16/24px</span>
            </div>
            <Input
              size="lg"
              label="Lot consignment value"
              placeholder="₹ 0.00"
              defaultValue="₹ 2,45,000"
            />
            <Select
              size="lg"
              label="Disbursement mode"
              defaultValue="dbt"
              options={[
                { value: 'dbt', label: 'Direct Benefit Transfer (DBT)' },
                { value: 'neft', label: 'NEFT / RTGS Bank Transfer' },
                { value: 'fpc-wallet', label: 'FPC Credit Account' },
              ]}
            />
          </div>
        </div>

        {/* States Overview: Default, Leading Icon, Error, Disabled */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#E1E8E6]">
          {/* Default */}
          <Input
            size="md"
            label="Default Input"
            placeholder="Type value..."
            helperText="Standard persistent helper"
          />

          {/* With Leading & Trailing Icon */}
          <Input
            size="md"
            label="Search farmers"
            placeholder="Search by name or UID..."
            leadingIcon={<Search className="w-4 h-4" />}
            helperText="Leading icon integration"
          />

          {/* Error State */}
          <Input
            size="md"
            label="Aadhaar number"
            defaultValue="9876-INVALID"
            error="Must be a valid 12-digit number"
            required
          />

          {/* Disabled State */}
          <Input
            size="md"
            label="FPC Member ID"
            defaultValue="FPC-PERM-0042"
            disabled
            helperText="Read-only system assigned ID"
          />
        </div>
      </div>

      {/* =========================================================================
          2. Complete Form Architecture (Foundation 04: Max 1200, Body 800, Rail 280)
          ========================================================================= */}
      <div className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0E1B16]">
              Farmer Member Registration &amp; Produce Declaration
            </h2>
            <p className="text-xs text-[#5B6B65]">
              Demonstrating the Foundation 04 layout contract: 800 px form body paired with a 280 px summary rail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowErrorDemo(!showErrorDemo)}
            className="text-xs font-medium text-[#166B4B] hover:underline cursor-pointer flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {showErrorDemo ? "Clear validation errors" : "Test error validation states"}
          </button>
        </div>

        {isSubmitted && (
          <div className="mb-6">
            <Alert tone="success" variant="card" onClose={() => setIsSubmitted(false)}>
              Farmer registration record submitted successfully. Reference ID: <strong>FPC-OD-2026-9041</strong>
            </Alert>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ==========================================================
              Form Body: Max 800px
              ========================================================== */}
          <div className="w-full lg:max-w-[800px] flex-1 bg-white border border-[#E1E8E6] rounded-[12px] p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Section 1: Farmer Identity */}
            <div>
              <div className="border-b border-[#E1E8E6] pb-3 mb-5">
                <h3 className="text-sm font-bold text-[#0E1B16] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#166B4B]" />
                  1. Farmer Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name (as per Aadhaar)"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  error={showErrorDemo && !farmerName ? "Farmer full name is required" : undefined}
                  placeholder="Enter farmer full name"
                />

                <Input
                  label="Aadhaar / National ID"
                  required
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  error={showErrorDemo ? "Aadhaar verification required" : undefined}
                  placeholder="xxxx xxxx xxxx"
                />

                <Input
                  label="Primary Mobile Number"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leadingIcon={<Phone className="w-4 h-4" />}
                  placeholder="10-digit mobile number"
                  helperText="SMS verification code will be sent to this number"
                />

                <Select
                  label="District / Block"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  options={[
                    { value: 'sambalpur', label: 'Sambalpur - Dhankauda Block' },
                    { value: 'bargarh', label: 'Bargarh - Attabira Block' },
                    { value: 'jharsuguda', label: 'Jharsuguda - Kolabira Block' },
                    { value: 'balangir', label: 'Balangir - Loisingha Block' },
                  ]}
                />
              </div>
            </div>

            {/* Section 2: Crop & Farm Details */}
            <div>
              <div className="border-b border-[#E1E8E6] pb-3 mb-5">
                <h3 className="text-sm font-bold text-[#0E1B16] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#166B4B]" />
                  2. Farm Holding &amp; Seasonal Produce
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <Select
                  label="Primary Crop"
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  options={[
                    { value: 'paddy', label: 'Kharif Paddy (Basmati / Swarna)' },
                    { value: 'wheat', label: 'Rabi Wheat (Sharbati)' },
                    { value: 'mustard', label: 'Mustard Seeds (Oilseed)' },
                    { value: 'millet', label: 'Finger Millet (Ragi)' },
                  ]}
                />

                <Input
                  label="Cultivated Land Area (Acres)"
                  required
                  type="number"
                  step="0.1"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  placeholder="e.g. 5.0"
                  helperText="Total land dedicated for this season"
                />

                <DatePicker
                  label="Expected Harvest Date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  placeholder="dd-mm-yyyy"
                  helperText="Calendar picker with standard FPC tokens"
                />
              </div>

              <Textarea
                label="Farming Practices &amp; Quality Notes"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Mention organic certification, soil health card details, or irrigation methods..."
                showCount
                maxLength={200}
                helperText="Optional notes for the procurement evaluation committee"
              />
            </div>

            {/* Section 3: Declarations */}
            <div className="pt-2 border-t border-[#E1E8E6]">
              <div className="bg-[#F8FAF9] p-4 rounded-[8px] border border-[#E1E8E6] mb-6">
                <Checkbox
                  label="I certify that the above farm details and land holdings are true and verified against revenue records."
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => {
                    setFarmerName('');
                    setAadhaar('');
                    setPhone('');
                    setRemarks('');
                  }}
                >
                  Discard Changes
                </Button>

                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="md">
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsSubmitted(true)}
                  >
                    Submit Registration
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* ==========================================================
              Summary Rail: 280px Fixed Width (Foundation 04 Contract)
              ========================================================== */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            
            {/* Status Card */}
            <div className="bg-white border border-[#E1E8E6] rounded-[10px] p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E1E8E6]">
                <span className="text-xs font-bold text-[#0E1B16] uppercase tracking-wider">Status</span>
                <Badge variant="brand" dot>Active</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5B6B65]">
                  <span>Season</span>
                  <span className="font-semibold text-[#0E1B16]">Kharif 2026</span>
                </div>
                <div className="flex justify-between text-[#5B6B65]">
                  <span>Verification</span>
                  <span className="font-semibold text-[#166B4B] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tier-1 Verified
                  </span>
                </div>
                <div className="flex justify-between text-[#5B6B65]">
                  <span>Quota Allocated</span>
                  <span className="font-semibold text-[#0E1B16]">120 Quintals</span>
                </div>
              </div>
            </div>

            {/* Checklist Card */}
            <div className="bg-white border border-[#E1E8E6] rounded-[10px] p-4 shadow-xs">
              <span className="text-xs font-bold text-[#0E1B16] uppercase tracking-wider block mb-3">
                Onboarding Checklist
              </span>
              <ul className="space-y-2.5 text-xs text-[#5B6B65]">
                <li className="flex items-center gap-2 text-[#0E1B16]">
                  <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#166B4B] flex items-center justify-center text-[10px] font-bold">✓</span>
                  Aadhaar KYC linked
                </li>
                <li className="flex items-center gap-2 text-[#0E1B16]">
                  <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#166B4B] flex items-center justify-center text-[10px] font-bold">✓</span>
                  Bank account DBT enabled
                </li>
                <li className="flex items-center gap-2 text-[#0E1B16]">
                  <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#166B4B] flex items-center justify-center text-[10px] font-bold">✓</span>
                  Plot geolocation tagged
                </li>
                <li className="flex items-center gap-2 text-[#9AA7A3]">
                  <span className="w-4 h-4 rounded-full border border-[#CDD7D4] flex items-center justify-center text-[10px]">4</span>
                  Warehouse inspection pending
                </li>
              </ul>
            </div>

            {/* Support Helpline Box */}
            <div className="bg-[#F8FAF9] border border-[#E1E8E6] rounded-[10px] p-4 text-xs text-[#5B6B65]">
              <span className="font-bold text-[#0E1B16] block mb-1">Need help filing?</span>
              <p className="leading-relaxed mb-3">
                Contact your nearest FPC Block Coordinator or call the toll-free kisan helpline.
              </p>
              <Badge variant="brand" uppercase className="text-[10px]">
                TOLL-FREE 1800-419-0022
              </Badge>
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          Footer: Anatomy & Properties Specification
          ========================================================================= */}
      <div className="pt-6 border-t border-[#E1E8E6] text-xs font-normal text-[#0E1B16] space-y-3.5">
        <div className="font-bold text-[11px] tracking-wider text-[#166B4B] uppercase">
          Anatomy &amp; Properties
        </div>
        <p className="text-[#0E1B16] leading-relaxed">
          Controls: Input / Select / Textarea / Checkbox / Radio / Switch · Size: S (36 px) / M (44 px) / L (52 px)<br />
          Layout: Centered, max 1200 px container · Form body: max 800 px · Summary rail: 280 px fixed width.<br />
          States: Default / Hover / Focus (2px ring + 2px offset) / Error (linked description) / Disabled.
        </p>
        <div className="space-y-1.5 text-[#5B6B65] leading-relaxed pt-1">
          <p><strong className="text-[#0E1B16]">USE</strong> Persistent labels with aria-describedby linked errors and descriptions.</p>
          <p><strong className="text-[#0E1B16]">AVOID</strong> Disappearing placeholder labels and reliance on color alone for error feedback.</p>
          <p><strong className="text-[#0E1B16]">TOKENS</strong> Semantic fills + borders; radius/md (8px); 44 px touch hit target protection.</p>
          <p><strong className="text-[#0E1B16]">ACCESSIBILITY</strong> Logical tab sequence, keyboard enter/space toggles, aria-invalid flags.</p>
        </div>
      </div>
    </div>
  );
};
