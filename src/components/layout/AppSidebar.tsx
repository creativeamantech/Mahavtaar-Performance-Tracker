import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VIEWS } from '../../constants/permissions';
import {
  LayoutDashboard, FileText, Building2, Users, Grid3X3,
  Settings, ClipboardList, LogOut, ChevronLeft, ChevronRight,
  Hexagon
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Data',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
      { label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
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
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-out ${collapsed ? 'w-[72px]' : 'w-[260px]'} shadow-xl md:shadow-none`}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center text-accent">
          <Hexagon className="absolute inset-0 h-full w-full fill-accent/20 stroke-accent stroke-[2]" />
          <span className="z-10 font-sans text-sm font-bold text-accent">M</span>
        </div>
        {!collapsed && (
          <span className="truncate font-sans text-sm font-bold tracking-widest text-sidebar-foreground">
            MAHAVTAAR
          </span>
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
                <div className="mb-2 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
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
                    className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-accent-foreground' : 'text-sidebar-foreground/50'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-white/10 p-4 bg-sidebar">
        {!collapsed && user && (
          <div className="mb-4 flex items-center gap-3 rounded-md bg-sidebar-accent/50 p-2 border border-white/5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</div>
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
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive ${collapsed ? 'px-0' : 'px-3'}`}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
