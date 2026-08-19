import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/use-media-query';

export function AppLayout({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(!isDesktop);
  
  useEffect(() => {
    setCollapsed(!isDesktop);
  }, [isDesktop]);

  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />
      </div>
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-out md:ml-[72px] ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <MobileHeader />
        <DesktopHeader />
        <main className="mobile-main-content flex-1 pb-16 md:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out fill-mode-both">
          <div className="mx-auto max-w-[1600px] p-4 sm:p-5 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
