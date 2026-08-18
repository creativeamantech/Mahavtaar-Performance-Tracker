import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="ml-[220px] flex-1 p-6 transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
