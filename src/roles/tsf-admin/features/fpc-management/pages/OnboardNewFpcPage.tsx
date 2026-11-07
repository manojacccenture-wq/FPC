import React, { useState } from 'react';
import { Search, MoreHorizontal, HelpCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { Button, Input, Badge, Alert, Card } from '../../../../../shared/components';
import { InviteFpcModal, type InviteFpcFormData } from '../components/InviteFpcModal';
import { invitationApi } from '../../../../../features/onboarding/api/invitation.api';

interface FpcRecord {
  id: string;
  name: string;
  location: string;
  farmers: number;
  shareholders: string | number;
  status: 'Active' | 'Onboarding' | 'Overdue' | 'Inactive' | 'Compliance';
  statusLabel: string;
}

const INITIAL_RECORDS: FpcRecord[] = [
  {
    id: 'FPC-ODI-001',
    name: 'Green Valley Farmer Producer Company Ltd.',
    location: 'Keonjhar, Odisha',
    farmers: 100,
    shareholders: 62,
    status: 'Active',
    statusLabel: 'Active'
  },
  {
    id: 'FPC-ODI-002',
    name: 'Kalinganagar Agri Producers Co.',
    location: 'Jajpur, Odisha',
    farmers: 214,
    shareholders: '-',
    status: 'Active',
    statusLabel: 'Active'
  },
  {
    id: 'FPC-JHK-001',
    name: 'Noamundi Millet Growers FPC',
    location: 'West Singhbhum, Jharkhand',
    farmers: 156,
    shareholders: '-',
    status: 'Active',
    statusLabel: 'Active'
  },
  {
    id: 'FPC-JHK-002',
    name: 'Seraikela Vegetable Growers FPC',
    location: 'Seraikela-Kharsawan, Jharkhand',
    farmers: 88,
    shareholders: '-',
    status: 'Onboarding',
    statusLabel: 'Onboarding'
  },
  {
    id: 'FPC-ODI-003',
    name: 'Gonda Tribal Farmers FPC',
    location: 'Keonjhar, Odisha',
    farmers: 132,
    shareholders: '-',
    status: 'Overdue',
    statusLabel: '12 days overdue'
  },
  {
    id: 'FPC-ODI-004',
    name: 'Joda Pulse Producers FPC',
    location: 'Keonjhar, Odisha',
    farmers: 97,
    shareholders: '-',
    status: 'Active',
    statusLabel: 'Active'
  },
  {
    id: 'FPC-JHK-003',
    name: 'Chaibasa Organic FPC',
    location: 'West Singhbhum, Jharkhand',
    farmers: 71,
    shareholders: '-',
    status: 'Inactive',
    statusLabel: 'Inactive'
  },
  {
    id: 'FPC-ODI-005',
    name: 'Barbil Oilseed Growers FPC',
    location: 'Keonjhar, Odisha',
    farmers: 119,
    shareholders: '-',
    status: 'Compliance',
    statusLabel: 'Compliance overdue...'
  }
];

export const OnboardNewFpcPage: React.FC = () => {
  const [records, setRecords] = useState<FpcRecord[]>(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Onboarding'>('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    return matchesSearch && r.status === selectedFilter;
  });

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleInviteSubmit = (data: InviteFpcFormData) => {
    const { link } = invitationApi.createInvitation(data);
    const newId = `FPC-${data.state.substring(0, 3).toUpperCase()}-${String(records.length + 1).padStart(3, '0')}`;
    const newRecord: FpcRecord = {
      id: newId,
      name: data.companyName,
      location: `${data.district}, ${data.state}`,
      farmers: 1,
      shareholders: '-',
      status: 'Onboarding',
      statusLabel: 'Onboarding'
    };
    setRecords(prev => [newRecord, ...prev]);
    setInvitationLink(link);
    setInvitationSuccess(`Invitation dispatched to ${data.nominatedAdmin} (${data.email})`);
  };

  // Reusing shared Badge component for all status representations
  const renderStatusBadge = (status: FpcRecord['status'], label: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="brand" dot className="px-2.5 py-1 text-xs font-medium">{label}</Badge>;
      case 'Onboarding':
        return <Badge variant="info" dot className="px-2.5 py-1 text-xs font-medium">{label}</Badge>;
      case 'Overdue':
        return <Badge variant="warning" dot className="px-2.5 py-1 text-xs font-medium">{label}</Badge>;
      case 'Inactive':
        return <Badge variant="neutral" dot className="px-2.5 py-1 text-xs font-medium">{label}</Badge>;
      case 'Compliance':
        return <Badge variant="danger" dot className="px-2.5 py-1 text-xs font-medium">{label}</Badge>;
      default:
        return <span>{label}</span>;
    }
  };

  return (
    <div className="section-flow text-left">
      {/* 1. Page Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="page-eyebrow mb-1">
            FPC MANAGEMENT
          </div>
          <h1 className="page-title">
            Onboard New FPC
          </h1>
          <p className="page-subtitle mt-1">
            A clearer view of delivery across partner FPCs.
          </p>
        </div>

        {/* Right Actions: Reusing shared Badge & Button */}
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <Badge variant="brand" dot size="md" className="h-8 px-3.5 text-xs font-semibold">
            Online
          </Badge>

          <Button
            variant="outline"
            size="sm"
            leadingIcon={<HelpCircle className="w-3.5 h-3.5 text-secondary" />}
            className="h-8 px-4 bg-white border-default hover:bg-neutral-50 text-primary text-xs font-medium shadow-2xs"
          >
            Help
          </Button>
        </div>
      </div>

      {/* Success Notification: Reusing shared Alert */}
      {invitationSuccess && (
        <Alert
          tone="success"
          variant="card"
          onClose={() => {
            setInvitationSuccess(null);
            setInvitationLink(null);
          }}
          className="text-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <span>{invitationSuccess}</span>
            {invitationLink && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${invitationLink}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="h-7 px-2.5 text-xs bg-white flex items-center gap-1 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
                <a
                  href={invitationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Open Registration Screen <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* 2. Main FPC Onboarding Table Card: Reusing shared Card */}
      <Card className="card-padding space-y-6">
        {/* Card Header & Summary */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
            FPC onboarding
          </h2>
          <p className="text-xs sm:text-[13px] text-secondary mt-1">
            {filteredRecords.length} records · Green Valley FPC
          </p>
        </div>

        {/* Action Controls Bar: Reusing shared Input and Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Reusing shared Input */}
          <div className="w-full md:max-w-xs lg:max-w-sm">
            <Input
              size="sm"
              placeholder="Search records"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leadingIcon={<Search className="w-4 h-4 text-secondary" />}
              className="h-10 text-xs sm:text-sm border-default bg-white"
            />
          </div>

          {/* Reusing shared Button group */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={selectedFilter === 'All' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('All')}
              className={`h-10 px-5 text-xs sm:text-sm font-semibold rounded-control transition-colors ${
                selectedFilter === 'All'
                  ? 'bg-brand-soft text-brand border-forest-200'
                  : 'bg-white text-secondary border-default hover:bg-neutral-50'
              }`}
            >
              All
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              className="h-10 px-5 text-xs sm:text-sm font-semibold rounded-control shadow-xs"
            >
              Invite fpc
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="h-10 px-5 text-xs sm:text-sm font-semibold rounded-control border border-forest-200 shadow-2xs"
            >
              Download
            </Button>
          </div>
        </div>

        {/* Responsive Data Table */}
        <div className="overflow-x-auto rounded-control border border-default">
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-neutral-50 text-secondary font-semibold border-b border-default">
              <tr>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider w-[130px]">ID</th>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider min-w-[260px]">Name</th>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider min-w-[190px]">Location</th>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider w-[100px]">Farmers</th>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider w-[110px]">Shareholders</th>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider w-[160px]">Status</th>
                <th className="table-th-padding font-semibold text-[11px] uppercase tracking-wider w-[160px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default text-primary">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="table-td-padding font-medium text-secondary whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="table-td-padding font-semibold text-primary whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="table-td-padding text-secondary whitespace-nowrap">
                    {item.location}
                  </td>
                  <td className="table-td-padding text-primary whitespace-nowrap">
                    {item.farmers}
                  </td>
                  <td className="table-td-padding text-secondary whitespace-nowrap">
                    {item.shareholders}
                  </td>
                  <td className="table-td-padding whitespace-nowrap">
                    {renderStatusBadge(item.status, item.statusLabel)}
                  </td>
                  <td className="table-td-padding whitespace-nowrap">
                    <div className="flex items-center justify-center table-actions-gap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="p-0 h-auto text-xs text-brand font-semibold hover:underline hover:bg-transparent min-w-0"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-7 px-3.5 py-0 rounded-full text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] min-w-0 shadow-2xs"
                      >
                        Delete
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        iconOnly
                        className="text-secondary hover:text-primary p-1 w-7 h-7 rounded-full"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer Reusing Shared Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-[13px] text-secondary pt-2 px-1">
          <div>
            Showing 1-{filteredRecords.length} of {records.length} records
          </div>
          <div className="flex items-center gap-2 select-none">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-secondary hover:text-primary font-medium h-auto p-1 text-xs sm:text-[13px]"
            >
              &larr; Previous
            </Button>
            <span className="w-7 h-7 rounded-lg bg-brand-soft text-brand font-bold flex items-center justify-center text-xs sm:text-[13px]">
              1
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-secondary hover:text-primary font-medium h-auto p-1 text-xs sm:text-[13px]"
            >
              Next &rarr;
            </Button>
          </div>
        </div>
      </Card>

      {/* Invite FPC Modal: Reusing generic Modal component */}
      <InviteFpcModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmitInvite={handleInviteSubmit}
      />
    </div>
  );
};
