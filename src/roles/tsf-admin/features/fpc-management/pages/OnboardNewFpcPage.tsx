import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, MoreHorizontal, HelpCircle, ExternalLink, Copy, Check, Eye, Trash2, AlertTriangle } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  type BadgeVariant,
  Alert,
  Card,
  Table,
  type TableColumn,
  Modal,
} from '../../../../../shared/components';
import { InviteFpcModal, type InviteFpcFormData } from '../components/InviteFpcModal';
import { FpcStatusBadge, type FpcStatus } from '../components/FpcStatusBadge';
import { calculateRegistrationProgress } from '../utils/registrationProgress';
import {
  useCreateFpcInvitationMutation,
  useGetFpcInvitationsQuery,
  useRevokeFpcInvitationMutation,
} from '../../../../../features/onboarding/api/fpcInvitationApi';
import {
  useGetFpcsQuery,
  useDeleteFpcMutation,
} from '../../../../../features/fpc/api/fpcApi';
import { useAppSelector } from '../../../../../app/store/hooks';
import { useNotification } from '../../../../../shared/notifications';
import { resolveErrorMessage } from '../../../../../shared/forms';

interface FpcRecord {
  id: string;
  recordType: 'fpc' | 'invitation';
  fpcId?: string;
  invitationId?: string;
  token?: string;
  cin?: string;
  name: string;
  location: string;
  farmers: number;
  shareholders: string | number;
  status: FpcStatus;
  statusLabel: string;
  badgeVariant?: BadgeVariant;
  progressPercentage: number;
}

/**
 * Exact destructive action styling carried over from the legacy table markup.
 * These two colors are intentional brand values that are not part of the token
 * palette, so they are kept verbatim to preserve the existing appearance.
 */
const DESTRUCTIVE_ACTION_CLASSES =
  'h-7 px-3.5 py-0 rounded-full text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] min-w-0 shadow-2xs';

export const OnboardNewFpcPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Onboarding'>('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeMenuRecord, setActiveMenuRecord] = useState<FpcRecord | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const [fpcToDelete, setFpcToDelete] = useState<FpcRecord | null>(null);

  const navigate = useNavigate();
  const { notify } = useNotification();

  const currentUser = useAppSelector((state) => state.auth.currentUser);

  // RTK Query: Live backend registered FPCs & invitations
  const {
    data: liveFpcs = [],
    isLoading: isLoadingFpcs,
  } = useGetFpcsQuery();

  const {
    data: liveInvitations = [],
    isLoading: isLoadingInvitations,
  } = useGetFpcInvitationsQuery();

  const [createFpcInvitation] = useCreateFpcInvitationMutation();
  const [revokeFpcInvitation] = useRevokeFpcInvitationMutation();
  const [deleteFpc, { isLoading: isDeletingFpc }] = useDeleteFpcMutation();

  // Map live registered FPCs from PostgreSQL backend
  const registeredRecords: FpcRecord[] = liveFpcs.map((fpc) => {
    const progress = calculateRegistrationProgress({
      status: fpc.status,
      isRegisteredFpc: true,
    });
    return {
      id: fpc.code || fpc.cin,
      recordType: 'fpc',
      fpcId: fpc.id,
      cin: fpc.cin,
      name: fpc.name,
      location: fpc.location,
      farmers: fpc.farmersCount,
      shareholders: fpc.shareholdersCount > 0 ? fpc.shareholdersCount : '-',
      status: fpc.status,
      statusLabel: progress.label,
      badgeVariant: progress.badgeVariant,
      progressPercentage: progress.percentage,
    };
  });

  // Map live dispatched invitations from PostgreSQL backend
  const invitationRecords: FpcRecord[] = liveInvitations.map((inv, idx) => {
    const progress = calculateRegistrationProgress({
      status: inv.status,
      isRegisteredFpc: false,
      token: inv.token,
      invitationId: inv.id,
      companyName: inv.companyName,
      email: inv.email,
    });
    return {
      id: `INV-${(inv.state || 'IND').substring(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
      recordType: 'invitation',
      invitationId: inv.id,
      token: inv.token,
      name: inv.companyName,
      location: `${inv.district}, ${inv.state}`,
      farmers: 0,
      shareholders: '-',
      status: inv.status === 'Expired' ? ('Overdue' as const) : ('Onboarding' as const),
      statusLabel: progress.label,
      badgeVariant: progress.badgeVariant,
      progressPercentage: progress.percentage,
    };
  });

  // Complete backend-driven records (Single Source of Truth)
  const allRecords = [...invitationRecords, ...registeredRecords];

  const filteredRecords = allRecords.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    return matchesSearch && r.status === selectedFilter;
  });

  const handleDelete = async (record: FpcRecord) => {
    if (record.invitationId) {
      try {
        await revokeFpcInvitation(record.invitationId).unwrap();
        setInvitationLink(null);
        setInvitationSuccess('Invitation successfully revoked.');
        notify('Invitation successfully revoked.', 'success');
      } catch (err: unknown) {
        notify(
          resolveErrorMessage(err, 'We could not revoke this invitation. Please try again.'),
          'danger',
          'Revoke failed'
        );
      }
    } else if (record.fpcId) {
      setFpcToDelete(record);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, record: FpcRecord) => {
    e.stopPropagation();
    if (activeMenuRecord?.id === record.id) {
      setActiveMenuRecord(null);
      setMenuCoords(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 160;
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (typeof window !== 'undefined' && left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }
    let top = rect.bottom + 4;
    if (typeof window !== 'undefined' && top + 120 > window.innerHeight) {
      top = rect.top - 100;
    }
    setMenuCoords({ top, left });
    setActiveMenuRecord(record);
  };

  const handleConfirmDelete = async () => {
    if (!fpcToDelete?.fpcId) return;
    try {
      await deleteFpc(fpcToDelete.fpcId).unwrap();
      notify(`FPC "${fpcToDelete.name}" successfully deleted.`, 'success');
      setFpcToDelete(null);
    } catch (err: unknown) {
      notify(
        resolveErrorMessage(err, 'We could not delete this FPC. Please try again.'),
        'danger',
        'Delete failed'
      );
    }
  };

  const resolveRegistrationUrl = (link: string | null): string => {
    if (!link) return '';
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const cleanPath = link.startsWith('/') ? link : `/${link}`;
    return `${origin}${cleanPath}`;
  };

  const handleInviteSubmit = async (data: InviteFpcFormData) => {
    const result = await createFpcInvitation(data).unwrap();
    if (result.registrationUrl) {
      try {
        const urlObj = new URL(result.registrationUrl, window.location.origin);
        const rawToken = urlObj.searchParams.get('token');
        if (rawToken && result.id) {
          localStorage.setItem(`fpc_token_map_${result.id}`, rawToken);
          if (result.companyName) {
            localStorage.setItem(`fpc_token_map_${result.companyName.toLowerCase()}`, rawToken);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    setInvitationLink(result.registrationUrl);
    setInvitationSuccess(`Invitation dispatched to ${result.nominatedAdmin} (${result.email})`);
    notify(`Invitation dispatched to ${result.nominatedAdmin} (${result.email})`, 'success');
  };

  const handleDownloadCsv = () => {
    if (filteredRecords.length === 0) {
      notify('No records available to download.', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Location', 'Farmers', 'Shareholders', 'Status'];
    const rows = filteredRecords.map((r) => [
      `"${r.id.replace(/"/g, '""')}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.location.replace(/"/g, '""')}"`,
      r.farmers,
      r.shareholders === '-' ? '0' : r.shareholders,
      `"${r.statusLabel.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fpc_onboarding_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Records exported successfully.', 'success');
  };

  const handleRowClick = (record: FpcRecord) => {
    const targetId = record.invitationId || record.fpcId || record.id;
    navigate(`/admin/onboard/${encodeURIComponent(targetId)}?type=${record.recordType}`, {
      state: { record, type: record.recordType },
    });
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
      widthClassName: 'min-w-[220px]',
      cell: (item) => (
        <FpcStatusBadge
          status={item.status}
          label={item.statusLabel}
          variant={item.badgeVariant}
        />
      ),
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
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(item);
            }}
            className="p-0 h-auto text-xs text-brand hover:underline hover:bg-transparent min-w-0"
          >
            Edit
          </Button>
          {item.recordType === 'invitation' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              className={DESTRUCTIVE_ACTION_CLASSES}
            >
              Revoke
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            iconOnly
            onClick={(e) => handleToggleMenu(e, item)}
            className="p-1 rounded-full text-secondary hover:text-primary hover:bg-neutral-100 transition-colors"
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
        {allRecords.length === 0
          ? 'Showing 0 of 0 records'
          : `Showing 1-${filteredRecords.length} of ${allRecords.length} records`}
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

  const orgName = currentUser?.activeFpcName || 'Tata Steel Foundation';

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
                    const fullUrl = resolveRegistrationUrl(invitationLink);
                    navigator.clipboard.writeText(fullUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
                <a
                  href={resolveRegistrationUrl(invitationLink)}
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
            {filteredRecords.length} records · {orgName}
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
              variant={selectedFilter === 'Active' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('Active')}
              className={`h-10 px-5 font-semibold rounded-control transition-colors ${
                selectedFilter === 'Active'
                  ? 'border-forest-200'
                  : 'text-secondary'
              }`}
            >
              Active
            </Button>

            <Button
              variant={selectedFilter === 'Onboarding' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('Onboarding')}
              className={`h-10 px-5 font-semibold rounded-control transition-colors ${
                selectedFilter === 'Onboarding'
                  ? 'border-forest-200'
                  : 'text-secondary'
              }`}
            >
              Onboarding
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
              onClick={handleDownloadCsv}
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
          getRowKey={(item) => item.invitationId || item.fpcId || item.id}
          ariaLabel="FPC onboarding records"
          isLoading={isLoadingFpcs || isLoadingInvitations}
          emptyState={emptyState}
          footer={paginationFooter}
          onRowClick={handleRowClick}
        />
      </Card>

      {/* Invite FPC Modal: Reusing generic Modal component */}
      <InviteFpcModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmitInvite={handleInviteSubmit}
      />

      {/* Three-Dot Actions Dropdown Menu rendered via Portal */}
      {activeMenuRecord && menuCoords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 select-none"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuRecord(null);
            setMenuCoords(null);
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: menuCoords.top,
              left: menuCoords.left,
              width: 160,
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl border border-default shadow-lg py-1.5 z-50 text-xs animate-in fade-in duration-100"
          >
            <button
              type="button"
              onClick={() => {
                const rec = activeMenuRecord;
                setActiveMenuRecord(null);
                setMenuCoords(null);
                handleRowClick(rec);
              }}
              className="w-full px-3.5 py-2 text-left text-primary hover:bg-neutral-50 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-secondary" />
              <span>View Details</span>
            </button>

            {activeMenuRecord.recordType === 'fpc' && (
              <>
                <div className="border-t border-neutral-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    const rec = activeMenuRecord;
                    setActiveMenuRecord(null);
                    setMenuCoords(null);
                    setFpcToDelete(rec);
                  }}
                  className="w-full px-3.5 py-2 text-left text-danger hover:bg-red-50 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                  <span>Delete FPC</span>
                </button>
              </>
            )}

            {activeMenuRecord.recordType === 'invitation' && (
              <>
                <div className="border-t border-neutral-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    const rec = activeMenuRecord;
                    setActiveMenuRecord(null);
                    setMenuCoords(null);
                    handleDelete(rec);
                  }}
                  className="w-full px-3.5 py-2 text-left text-danger hover:bg-red-50 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                  <span>Revoke Invitation</span>
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Delete FPC Confirmation Modal */}
      <Modal
        isOpen={!!fpcToDelete}
        onClose={() => {
          if (!isDeletingFpc) {
            setFpcToDelete(null);
          }
        }}
        size="sm"
        showCloseButton={!isDeletingFpc}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 text-danger flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-base font-bold text-primary">Delete FPC</span>
          </div>
        }
        description="Are you sure you want to delete this Farmer Producer Company?"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFpcToDelete(null)}
              disabled={isDeletingFpc}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              loading={isDeletingFpc}
              disabled={isDeletingFpc}
              leadingIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Delete FPC
            </Button>
          </div>
        }
      >
        {fpcToDelete && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 border border-default space-y-1.5">
              <div className="font-semibold text-primary text-sm">
                {fpcToDelete.name}
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-default text-[11px]">
                  {fpcToDelete.cin || fpcToDelete.id}
                </span>
                <span>&bull;</span>
                <span>{fpcToDelete.location}</span>
              </div>
            </div>

            <p className="text-secondary leading-relaxed">
              This action will soft-delete the FPC record and remove it from active directory listings and onboarding workflows.
              Historical audit logs, approval records, and statutory financial data will remain archived in accordance with data retention compliance policies.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
