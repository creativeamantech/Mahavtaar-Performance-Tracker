import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role, DEFAULT_PERMISSIONS } from '../constants/permissions';
import { db } from '../lib/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasPermission: (view: string) => boolean;
  isExecutive: () => boolean;
  users: User[];
  addUser: (u: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'ADMIN', permissions: { views: DEFAULT_PERMISSIONS.ADMIN } },
  { id: '2', name: 'Ravi Manager', email: 'ravi@company.com', role: 'MANAGER', permissions: { views: DEFAULT_PERMISSIONS.MANAGER } },
  { id: '3', name: 'Aarti Sharma', email: 'aarti@company.com', role: 'EXECUTIVE', permissions: { views: DEFAULT_PERMISSIONS.EXECUTIVE } },
  { id: '4', name: 'Viewer User', email: 'viewer@company.com', role: 'VIEWER', permissions: { views: DEFAULT_PERMISSIONS.VIEWER } },
];

// Browser-local demo-grade auth. Hash function to avoid plaintext password storage.
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function initDb() {
      try {
        const count = await db.users.count();
        if (count === 0) {
          const defaultPasswordHash = await hashPassword('Admin@123');
          const seedUsers = MOCK_USERS.map(u => ({ ...u, passwordHash: defaultPasswordHash }));
          await db.users.bulkPut(seedUsers);
        }
        const dbUsers = await db.users.toArray();
        setUsers(dbUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role as Role, permissions: u.permissions })));
      } catch (err) {
        console.error("Failed to init users DB", err);
      } finally {
        setLoading(false);
      }
    }
    initDb();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const found = await db.users.where('email').equals(email).first();
    if (!found) {
      throw new Error('Invalid credentials');
    }
    
    const inputHash = await hashPassword(password);
    if (found.passwordHash !== inputHash) {
      throw new Error('Invalid credentials');
    }
    
    const safeUser: User = { id: found.id, name: found.name, email: found.email, role: found.role as Role, permissions: found.permissions };
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => setUser(null);

  const hasPermission = (view: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions?.views?.includes(view) ?? false;
  };

  const isExecutive = () => user?.role === 'EXECUTIVE';

  const addUser = async (u: Omit<User, 'id'>) => {
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword('Admin@123'); // Default password for new users
    const newUser = { ...u, id };
    
    setUsers(prev => [...prev, newUser]);
    await db.users.put({ ...newUser, passwordHash });
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    const existing = await db.users.get(id);
    if (existing) {
      await db.users.update(id, { ...existing, ...data });
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    await db.users.delete(id);
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
