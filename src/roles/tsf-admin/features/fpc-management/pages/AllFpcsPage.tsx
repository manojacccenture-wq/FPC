import React, { useState } from 'react';
import { Search, Building2, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { Badge, Card, Input, Button } from '../../../../../shared/components';
import { useGetFpcsQuery } from '../../../../../features/fpc/api/fpcApi';

interface FpcDirectoryItem {
  id: string;
  cin: string;
  name: string;
  state: string;
  district: string;
  farmersCount: number;
  incorporationYear: number;
  status: 'Approved' | 'Review' | 'Audited';
}

export const AllFpcsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');

  const { data: liveFpcs = [], isLoading } = useGetFpcsQuery();

  const directoryItems: FpcDirectoryItem[] = liveFpcs.map((fpc) => ({
    id: fpc.id,
    cin: fpc.cin,
    name: fpc.name,
    state: fpc.state,
    district: fpc.district,
    farmersCount: fpc.farmersCount,
    incorporationYear: fpc.createdAtUtc ? new Date(fpc.createdAtUtc).getFullYear() : new Date().getFullYear(),
    status: fpc.status === 'Active' ? 'Approved' : 'Review',
  }));

  const availableStates = ['All', ...Array.from(new Set(liveFpcs.map((f) => f.state).filter(Boolean)))];

  const filteredItems = directoryItems.filter((fpc) => {
    const matchesSearch =
      fpc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fpc.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fpc.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'All' || fpc.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="section-flow text-left">
      <div>
        <div className="page-eyebrow mb-1">
          FPC MANAGEMENT
        </div>
        <h1 className="page-title">
          All Partner FPCs
        </h1>
        <p className="page-subtitle mt-1">
          Complete directory of affiliated Farmer Producer Companies across operational districts.
        </p>
      </div>

      {/* Directory Index Summary Card */}
      <Card className="card-padding">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-primary">Directory Index</h2>
            <p className="text-xs text-secondary mt-0.5">
              {filteredItems.length} Enterprises in Network
            </p>
          </div>
          <Badge variant="brand" dot>Active Sync</Badge>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-4">
          <div className="w-full sm:max-w-xs">
            <Input
              size="sm"
              placeholder="Search by company or district"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leadingIcon={<Search className="w-4 h-4 text-secondary" />}
              className="h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {availableStates.map((st) => (
              <Button
                key={st}
                size="xs"
                variant={selectedState === st ? 'secondary' : 'outline'}
                onClick={() => setSelectedState(st)}
                className={`text-xs h-7 px-3 rounded-full ${
                  selectedState === st ? 'bg-brand-soft text-brand font-semibold' : ''
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* Directory Items Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-secondary">
            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading enterprise directory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 text-center text-secondary">
            <CheckCircle2 className="w-8 h-8 text-neutral-400 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-primary">No directory entries found</p>
            <p className="text-xs text-secondary mt-1">
              {searchQuery ? `No results matching "${searchQuery}"` : 'No enterprises recorded in this region.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {filteredItems.map((fpc) => (
              <div
                key={fpc.id}
                className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-brand/40 bg-white transition-all space-y-2 text-left shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary line-clamp-1">
                        {fpc.name}
                      </h4>
                      <code className="text-neutral-400 block">
                        {fpc.cin}
                      </code>
                    </div>
                  </div>
                  <Badge
                    variant={fpc.status === 'Approved' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {fpc.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-secondary pt-1 border-t border-neutral-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{fpc.district}, {fpc.state}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-primary">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{fpc.farmersCount} Farmers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
