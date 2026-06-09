import Menu from '@/components/layout/navbar';
import React from 'react';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="min-h-screen">
        <Menu />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
