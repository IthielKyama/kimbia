import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'GUEST' | 'SUPER_ADMIN' | 'RACE_ADMIN_PENDING' | 'RACE_ADMIN_APPROVED';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

const mockUsers: Record<string, User> = {
  SUPER_ADMIN: { id: '1', name: 'Super Admin User', email: 'admin@kimbia.com', role: 'SUPER_ADMIN' },
  RACE_ADMIN_PENDING: { id: '2', name: 'New Organizer (Pending)', email: 'new@organizer.com', role: 'RACE_ADMIN_PENDING' },
  RACE_ADMIN_APPROVED: { id: '3', name: 'Approved Organizer', email: 'approved@organizer.com', role: 'RACE_ADMIN_APPROVED' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('GUEST');

  useEffect(() => {
    // Load from local storage for persistence across reloads during dev
    const storedRole = localStorage.getItem('mock_auth_role') as Role;
    if (storedRole && storedRole !== 'GUEST') {
      setRole(storedRole);
      setUser(mockUsers[storedRole]);
    }
  }, []);

  const login = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'GUEST') {
      setUser(null);
      localStorage.removeItem('mock_auth_role');
    } else {
      setUser(mockUsers[newRole]);
      localStorage.setItem('mock_auth_role', newRole);
    }
  };

  const logout = () => {
    setRole('GUEST');
    setUser(null);
    localStorage.removeItem('mock_auth_role');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
      {/* Dev UI Toggle */}
      <div className="fixed bottom-4 right-4 bg-surface border border-gray-700 shadow-2xl rounded-2xl p-4 z-50 flex flex-col gap-2 text-sm w-72 font-geist">
        <div className="font-bold text-white border-b border-gray-700 pb-3 mb-2 flex justify-between items-center">
          <span>🛠 Mock Auth Toggle</span>
        </div>
        <div className="text-xs text-placeholder mb-2 bg-background p-2 rounded-lg border border-gray-800">
          Current Role: <span className="font-bold text-primary block mt-1 text-sm">{role}</span>
        </div>
        <button onClick={() => login('GUEST')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-xl text-left transition-colors font-medium">Logout (GUEST)</button>
        <button onClick={() => login('SUPER_ADMIN')} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-3 py-2 rounded-xl text-left transition-colors font-medium">Login as SUPER_ADMIN</button>
        <button onClick={() => login('RACE_ADMIN_APPROVED')} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-2 rounded-xl text-left transition-colors font-medium">Login as RACE_ADMIN_APPROVED</button>
        <button onClick={() => login('RACE_ADMIN_PENDING')} className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 px-3 py-2 rounded-xl text-left transition-colors font-medium">Login as RACE_ADMIN_PENDING</button>
      </div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
