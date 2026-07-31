import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Train,
  Calendar,
  TrainFront,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils';
import { APP_NAME, APP_SUBTITLE } from '@/config/constants';
import { useAuthStore, useIsAdmin } from '@/stores/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/map', label: 'Map', icon: Map, adminOnly: false },
  { to: '/trains', label: 'Trains', icon: Train, adminOnly: false },
  { to: '/schedules', label: 'Schedules', icon: Calendar, adminOnly: true },
  { to: '/locomotives', label: 'Locomotives', icon: TrainFront, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
  { to: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function Sidebar() {
  const isAdmin = useIsAdmin();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-panel/50 backdrop-blur-glass">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo-bell.png"
            alt="Ironstate Railroad"
            className="h-10 w-10 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">{APP_NAME}</h1>
            <p className="text-xs text-foreground/50">{APP_SUBTITLE}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-accent border border-primary/30'
                  : 'text-foreground/70 hover:bg-border/50 hover:text-foreground',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-lg bg-background/50 px-3 py-2">
          <p className="text-xs text-foreground/50">Signed in as</p>
          <p className="text-sm font-medium">{user?.displayName}</p>
          <p className="text-xs capitalize text-accent">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-border/50 hover:text-foreground transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
