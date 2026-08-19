export const VIEWS = {
  DATA_EXPLORER: 'data_explorer',
  DASHBOARD: 'dashboard',
  DATA_ENTRY: 'data_entry',
  CITY_PIVOT: 'city_pivot',
  TEAM_PIVOT: 'team_pivot',
  CITY_TEAM_MATRIX: 'city_team_matrix',
  SETTINGS: 'settings',
  AUDIT_LOG: 'audit_log',
  EXPORT: 'export',
} as const;

export type ViewKey = typeof VIEWS[keyof typeof VIEWS];

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN: Object.values(VIEWS),
  MANAGER: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.CITY_TEAM_MATRIX, VIEWS.AUDIT_LOG, VIEWS.EXPORT],
  EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY],
  VIEWER: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.CITY_PIVOT],
};

export type Role = 'ADMIN' | 'MANAGER' | 'EXECUTIVE' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: { views: string[] };
}
