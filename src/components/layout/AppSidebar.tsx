import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VIEWS } from '../../constants/permissions';
import {
  LayoutDashboard, FileText, Building2, Users, Grid3X3,
  Settings, ClipboardList, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
  { label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
  { label: 'City Pivot', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
  { label: 'Team Pivot', icon: Users, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
  { label: 'City × Team', icon: Grid3X3, path: '/matrix', view: VIEWS.CITY_TEAM_MATRIX },
  { label: 'Settings', icon: Settings, path: '/settings', view: VIEWS.SETTINGS },
  { label: 'Audit Log', icon: ClipboardList, path: '/audit', view: VIEWS.AUDIT_LOG },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(item => hasPermission(item.view));

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200 ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
          LC
        </div>
        {!collapsed && (
          <span className="truncate font-heading text-xs font-bold uppercase tracking-wider text-primary">
            Loan Tracker
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {visibleItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mx-2 mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-xs transition-colors ${
                active
                  ? 'border-l-2 border-primary bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-bg-hover hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-border p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">{user.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{user.role}</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-bg-hover hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-bg-hover hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
