import React from 'react';

export const FarmerLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F8F7] text-[#0E1B16]">
      <header className="h-16 bg-white border-b border-[#E1E8E6] px-6 flex items-center justify-between">
        <span className="text-xs font-bold text-[#166B4B] uppercase">Kisan Sahayak / Farmer Portal</span>
      </header>
      <main className="p-6 max-w-[800px] mx-auto">{children}</main>
    </div>
  );
};

