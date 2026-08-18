import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '../../contexts/AuthContext';
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
      />
      
      <main className={`flex-1 transition-all duration-300 ease-out ${collapsed ? 'lg:pl-[64px]' : 'lg:pl-[240px]'}`}>
        <div className="p-4 lg:p-8">
          <div className="mb-4 flex items-center lg:hidden">
            <button 
              onClick={() => setMobileOpen(true)}
              className="mr-3 rounded-md p-2 hover:bg-surface-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-heading text-sm font-bold tracking-widest text-primary">MAHAVTAAR</span>
          </div>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
