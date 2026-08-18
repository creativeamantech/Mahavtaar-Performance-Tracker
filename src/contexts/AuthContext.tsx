import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role, DEFAULT_PERMISSIONS } from '../constants/permissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasPermission: (view: string) => boolean;
  isExecutive: () => boolean;
  users: User[];
  addUser: (u: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'ADMIN', permissions: { views: DEFAULT_PERMISSIONS.ADMIN } },
  { id: '2', name: 'Ravi Manager', email: 'ravi@company.com', role: 'MANAGER', permissions: { views: DEFAULT_PERMISSIONS.MANAGER } },
  { id: '3', name: 'Aarti Sharma', email: 'aarti@company.com', role: 'EXECUTIVE', permissions: { views: DEFAULT_PERMISSIONS.EXECUTIVE } },
  { id: '4', name: 'Viewer User', email: 'viewer@company.com', role: 'VIEWER', permissions: { views: DEFAULT_PERMISSIONS.VIEWER } },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const login = async (email: string, password: string): Promise<User> => {
    const found = users.find(u => u.email === email);
    if (!found || password !== 'Admin@123') {
      throw new Error('Invalid credentials');
    }
    setUser(found);
    return found;
  };

  const logout = () => setUser(null);

  const hasPermission = (view: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions?.views?.includes(view) ?? false;
  };

  const isExecutive = () => user?.role === 'EXECUTIVE';

  const addUser = (u: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...u, id: crypto.randomUUID() }]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, isExecutive, users, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
