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

export function AppSidebar({ collapsed, setCollapsed, mobileOpen }: { collapsed: boolean, setCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void, mobileOpen: boolean }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[rgba(255,255,255,0.06)] bg-surface-1 transition-all duration-300 ease-out 
      ${collapsed ? 'w-[64px]' : 'w-[240px]'}
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      shadow-[4px_0_24px_rgba(0,0,0,0.5)] lg:shadow-none
      `}
    >
      {/* 1px Amber Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary to-transparent" />
      
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[rgba(255,255,255,0.04)] px-4 mt-[1px]">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center text-primary">
          <Hexagon className="absolute inset-0 h-full w-full fill-primary/10 stroke-primary stroke-[1.5]" />
          <span className="z-10 font-heading text-sm font-bold text-primary">M</span>
        </div>
        {!collapsed && (
          <span className="truncate font-heading text-xs font-bold uppercase tracking-[0.15em] text-primary">
            Mahavtaar
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {NAV_GROUPS.map((group, idx) => {
          const visibleItems = group.items.filter(item => hasPermission(item.view));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <div className="mx-4 mb-2 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                  {group.title}
                </div>
              )}
              {visibleItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mx-3 mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-xs transition-all duration-200 ${
                      active
                        ? 'bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-primary' : ''}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
              
              {/* Separator between groups */}
              {idx < NAV_GROUPS.length - 1 && (
                <div className="mx-4 mt-4 h-[1px] bg-[rgba(255,255,255,0.04)]" />
              )}
            </div>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-[rgba(255,255,255,0.04)] p-3 bg-surface-0/50 backdrop-blur-sm">
        {!collapsed && user && (
          <div className="mb-3 flex items-center gap-3 rounded-md bg-white/[0.02] border border-white/[0.02] p-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-data text-xs font-bold text-foreground">{user.name}</div>
              <div className="mt-0.5">
                <span className={`inline-flex items-center rounded-sm px-1.5 py-[1px] font-data text-[8px] font-bold uppercase tracking-wider ${
                  user.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/20' :
                  user.role === 'MANAGER' ? 'bg-info/20 text-info border border-info/20' :
                  user.role === 'EXECUTIVE' ? 'bg-success/20 text-success border border-success/20' :
                  'bg-muted text-muted-foreground border border-muted-foreground/20'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={logout}
            className="flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
