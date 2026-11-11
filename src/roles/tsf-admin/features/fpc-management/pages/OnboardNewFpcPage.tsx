import React, { useState } from 'react';
import { Search, MoreHorizontal, HelpCircle, ExternalLink, Copy, Check } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Alert,
  Card,
  Table,
  type TableColumn,
} from '../../../../../shared/components';
import { InviteFpcModal, type InviteFpcFormData } from '../components/InviteFpcModal';
import { FpcStatusBadge, type FpcStatus } from '../components/FpcStatusBadge';
import {
  useCreateFpcInvitationMutation,
  useGetFpcInvitationsQuery,
  useRevokeFpcInvitationMutation,
} from '../../../../../features/onboarding/api/fpcInvitationApi';
import { useAppSelector } from '../../../../../app/store/hooks';
import { useNotification } from '../../../../../shared/notifications';
import { resolveErrorMessage } from '../../../../../shared/forms';

interface FpcRecord {
  id: string;
  invitationId?: string;
  name: string;
  location: string;
  farmers: number;
  shareholders: string | number;
  status: FpcStatus;
  statusLabel: string;
}

/**
 * Exact destructive action styling carried over from the legacy table markup.
 * These two colors are intentional brand values that are not part of the token
 * palette, so they are kept verbatim to preserve the existing appearance.
 */
const DESTRUCTIVE_ACTION_CLASSES =
  'h-7 px-3.5 py-0 rounded-full text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] min-w-0 shadow-2xs';

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

  const { notify } = useNotification();

  // RTK Query: Live backend invitation queries and mutations
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { data: liveInvitations = [] } = useGetFpcInvitationsQuery();
  const [createFpcInvitation] = useCreateFpcInvitationMutation();
  const [revokeFpcInvitation] = useRevokeFpcInvitationMutation();

  // Merge live PostgreSQL invitations with records list
  const invitationRecords: FpcRecord[] = liveInvitations.map((inv, idx) => ({
    id: `INV-${(inv.state || 'IND').substring(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
    invitationId: inv.id,
    name: inv.companyName,
    location: `${inv.district}, ${inv.state}`,
    farmers: 0,
    shareholders: '-',
    status: 'Onboarding' as const,
    statusLabel: `Invited (${inv.status})`
  }));

  const allRecords = [...invitationRecords, ...records];

  const filteredRecords = allRecords.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    return matchesSearch && r.status === selectedFilter;
  });

  const handleDelete = async (id: string, invitationId?: string) => {
    if (invitationId) {
      try {
        await revokeFpcInvitation(invitationId).unwrap();
        setInvitationSuccess('Invitation successfully revoked.');
      } catch (err: unknown) {
        notify(
          resolveErrorMessage(err, 'We could not revoke this invitation. Please try again.'),
          'danger',
          'Revoke failed'
        );
      }
    } else {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleInviteSubmit = async (data: InviteFpcFormData) => {
    const result = await createFpcInvitation(data).unwrap();
    setInvitationLink(result.registrationUrl);
    setInvitationSuccess(`Invitation dispatched to ${result.nominatedAdmin} (${result.email})`);
  };

  // Shared Table empty-state content (presentation only; filtering stays on this page)
  const emptyState = (
    <>
      <p className="font-medium">No FPC records found</p>
      <small className="text-secondary mt-1 block">
        {searchQuery ? `No results matching "${searchQuery}"` : 'No records match the current filter.'}
      </small>
      {(searchQuery || selectedFilter !== 'All') && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setSearchQuery('');
            setSelectedFilter('All');
          }}
          className="mt-3 text-xs"
        >
          Reset Filters
        </Button>
      )}
    </>
  );

  // Column definitions: data presentation config only, no table markup.
  const fpcColumns: TableColumn<FpcRecord>[] = [
    {
      id: 'id',
      header: 'ID',
      widthClassName: 'w-[130px]',
      tone: 'medium',
      cell: (item) => item.id,
    },
    {
      id: 'name',
      header: 'Name',
      widthClassName: 'min-w-[260px]',
      tone: 'strong',
      cell: (item) => item.name,
    },
    {
      id: 'location',
      header: 'Location',
      widthClassName: 'min-w-[190px]',
      tone: 'secondary',
      cell: (item) => item.location,
    },
    {
      id: 'farmers',
      header: 'Farmers',
      widthClassName: 'w-[100px]',
      cell: (item) => item.farmers,
    },
    {
      id: 'shareholders',
      header: 'Shareholders',
      widthClassName: 'w-[110px]',
      tone: 'secondary',
      cell: (item) => item.shareholders,
    },
    {
      id: 'status',
      header: 'Status',
      widthClassName: 'w-[160px]',
      cell: (item) => <FpcStatusBadge status={item.status} label={item.statusLabel} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      widthClassName: 'w-[160px]',
      align: 'center',
      cell: (item) => (
        <div className="flex items-center justify-center table-actions-gap">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="p-0 h-auto text-xs text-brand hover:underline hover:bg-transparent min-w-0"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(item.id, item.invitationId)}
            className={DESTRUCTIVE_ACTION_CLASSES}
          >
            {item.invitationId ? 'Revoke' : 'Delete'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            iconOnly
            className="p-1 rounded-full"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const paginationFooter = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-secondary pt-2 px-1">
      <div>
        Showing 1-{filteredRecords.length} of {allRecords.length} records
      </div>
      <div className="flex items-center gap-2 select-none">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="font-medium h-auto p-1"
        >
          &larr; Previous
        </Button>
        <span className="w-7 h-7 rounded-lg bg-brand-soft text-brand font-bold flex items-center justify-center">
          1
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="font-medium h-auto p-1"
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );

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
            className="h-8 px-4 text-xs font-medium"
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
                  className="text-xs flex items-center gap-1"
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
          <h3 className="text-primary tracking-tight">
            FPC onboarding
          </h3>
          <p className="text-secondary mt-1">
            {filteredRecords.length} records · {currentUser?.activeFpcName || 'TSF Programme'}
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
              className="h-10"
            />
          </div>

          {/* Reusing shared Button group */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={selectedFilter === 'All' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('All')}
              className={`h-10 px-5 font-semibold rounded-control transition-colors ${
                selectedFilter === 'All'
                  ? 'border-forest-200'
                  : 'text-secondary'
              }`}
            >
              All
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite fpc
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="h-10 px-5 border-forest-200"
            >
              Download
            </Button>
          </div>
        </div>

        {/* Responsive Data Table: Reusing centralized shared Table */}
        <Table
          data={filteredRecords}
          columns={fpcColumns}
          getRowKey={(item) => item.id}
          ariaLabel="FPC onboarding records"
          emptyState={emptyState}
          footer={paginationFooter}
        />
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
