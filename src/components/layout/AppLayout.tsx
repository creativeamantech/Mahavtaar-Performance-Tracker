import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <AppSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen}
         setMobileOpen={setMobileOpen}
      />
      
      <main className={`flex-1 transition-all duration-300 ease-out ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center lg:hidden">
            <button 
              onClick={() => setMobileOpen(true)}
              className="mr-3 rounded-md p-2 text-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-sans text-sm font-bold tracking-widest text-primary">MAHAVTAAR</span>
          </div>
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
