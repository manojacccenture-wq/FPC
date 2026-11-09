import React, { useState } from 'react';
import { Search, Building2, MapPin, Users } from 'lucide-react';
import { Badge, Card, Input, Button } from '../../../../../shared/components';

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

const DEMO_DIRECTORIES: FpcDirectoryItem[] = [
  {
    id: 'FPC-MH-001',
    cin: 'U01100MH2026PTC123456',
    name: 'Sahyadri Agro Producer Company Limited',
    state: 'Maharashtra',
    district: 'Nashik',
    farmersCount: 1420,
    incorporationYear: 2026,
    status: 'Approved',
  },
  {
    id: 'FPC-ODI-001',
    cin: 'U01111OD2025PTC034567',
    name: 'Green Valley Farmer Producer Company Ltd.',
    state: 'Odisha',
    district: 'Keonjhar',
    farmersCount: 840,
    incorporationYear: 2025,
    status: 'Approved',
  },
  {
    id: 'FPC-ODI-002',
    cin: 'U01122OD2024PTC045678',
    name: 'Kalinganagar Agri Producers Co.',
    state: 'Odisha',
    district: 'Jajpur',
    farmersCount: 1120,
    incorporationYear: 2024,
    status: 'Approved',
  },
  {
    id: 'FPC-JHK-001',
    cin: 'U01133JH2025PTC056789',
    name: 'Noamundi Millet Growers FPC',
    state: 'Jharkhand',
    district: 'West Singhbhum',
    farmersCount: 650,
    incorporationYear: 2025,
    status: 'Approved',
  },
  {
    id: 'FPC-JHK-002',
    cin: 'U01144JH2025PTC067890',
    name: 'Seraikela Vegetable Growers FPC',
    state: 'Jharkhand',
    district: 'Seraikela-Kharsawan',
    farmersCount: 490,
    incorporationYear: 2025,
    status: 'Review',
  },
];

export const AllFpcsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');

  const filteredItems = DEMO_DIRECTORIES.filter((fpc) => {
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
            {['All', 'Odisha', 'Jharkhand', 'Maharashtra'].map((st) => (
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
      </Card>
    </div>
  );
};
