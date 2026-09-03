import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, Trophy, Users, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { role, user, logout } = useAuth();

  const isSuperAdmin = role === 'SUPER_ADMIN';

  const allNavItems = [
    { label: 'Organizers', path: '/admin/organizers', icon: Users, forSuperAdmin: true },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, forRaceAdmin: true },
    { label: 'My Races', path: '/races', icon: CalendarPlus, forRaceAdmin: true },
    { label: 'Awards', path: '/awards', icon: Trophy, forRaceAdmin: true },
  ];

  const navItems = allNavItems.filter((item) => {
    if (isSuperAdmin) {
      return item.forSuperAdmin;
    }
    return item.forRaceAdmin;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-surface border-b border-gray-800 p-4 flex justify-between items-center z-20">
        <span className="text-xl font-bold text-primary font-outfit">Kimbia</span>
        <button onClick={toggleSidebar} className="text-placeholder hover:text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-surface border-r border-gray-800 transition-transform duration-300 ease-in-out z-10 flex flex-col`}
      >
        <div className="h-16 hidden md:flex items-center px-6 border-b border-gray-800">
          <span className="text-2xl font-bold text-primary tracking-wide font-outfit">KIMBIA</span>
        </div>

        {/* User Info Badge */}
        {user && (
          <div className="px-6 py-4 border-b border-gray-800/80 bg-background/30 font-geist">
            <div className="text-sm font-bold text-white truncate">{user.name}</div>
            <div className="text-xs text-placeholder truncate">{user.email}</div>
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  role === 'SUPER_ADMIN'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : role === 'RACE_ADMIN_APPROVED'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors font-geist ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-placeholder hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-geist"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto mt-16 md:mt-0">
           <Outlet />
        </div>
      </main>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
