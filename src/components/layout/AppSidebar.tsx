import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VIEWS } from '../../constants/permissions';
import {
  LayoutDashboard, FileText, Database, Building2, Users, Grid3X3,
  Settings, ClipboardList, LogOut, ChevronLeft, ChevronRight,
  Hexagon
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Data',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
      { label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
      { label: 'Data Explorer', icon: Database, path: '/explorer', view: VIEWS.DATA_EXPLORER },
    ]
  },
  {
    title: 'Reports',
    items: [
      { label: 'City Pivot', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
      { label: 'Team Pivot', icon: Users, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
      { label: 'City × Team', icon: Grid3X3, path: '/matrix', view: VIEWS.CITY_TEAM_MATRIX },
    ]
  },
  {
    title: 'Admin',
    items: [
      { label: 'Settings', icon: Settings, path: '/settings', view: VIEWS.SETTINGS },
      { label: 'Audit Log', icon: ClipboardList, path: '/audit', view: VIEWS.AUDIT_LOG },
    ]
  }
];

export function AppSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: { collapsed: boolean, setCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-foreground transition-all duration-300 ease-out ${collapsed ? 'w-[72px]' : 'w-[260px]'} shadow-xl md:shadow-none`}>
      {/* Logo */}
      <div className="px-6 py-8 mb-2 flex items-center gap-3">
        
        {!collapsed ? (
          <div>
            <h1 className="font-sans text-xl font-black text-primary">Mahavtaar CRM</h1>
            <p className="font-sans text-xs text-muted-foreground mt-1">Enterprise Recovery</p>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <h1 className="font-sans text-xl font-black text-primary">M</h1>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV_GROUPS.map((group, idx) => {
          const visibleItems = group.items.filter(item => hasPermission(item.view));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-6">
              {!collapsed && (
                <div className="hidden">
                  {group.title}
                </div>
              )}
              {visibleItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path} title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`mb-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-transform duration-200 ${active ? 'bg-accent text-accent-foreground font-semibold hover:translate-x-1' : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'}`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="mt-auto px-4 py-4 border-t border-border flex flex-col gap-2 bg-card">
        {!collapsed && user && (
          <div className="mb-4 flex items-center gap-3 rounded-md bg-muted/50 p-2 border border-border">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
              <div className="mt-0.5">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  user.role === 'ADMIN' ? 'bg-primary text-primary-foreground' :
                  user.role === 'MANAGER' ? 'bg-info text-info-foreground' :
                  user.role === 'EXECUTIVE' ? 'bg-success text-success-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive ${collapsed ? 'px-0' : 'px-3'}`}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground/70 hover:bg-sidebar-accent hover:text-foreground transition-colors" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
