import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  History, 
  Settings, 
  Bell, 
  ShieldCheck,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Globe, label: 'Projects', path: '/projects' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-bg text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Site Sentinel</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent",
                  isActive 
                    ? "bg-white/5 text-white border-white/10 shadow-lg" 
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ok rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-sm font-medium text-text-secondary">Monitoring Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search projects or URLs..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all text-white placeholder:text-text-secondary"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-text-secondary hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-critical rounded-full border-2 border-[#09090b]" />
            </button>
            <div className="w-8 h-8 bg-white/10 rounded-full overflow-hidden border border-border">
              <img src="https://picsum.photos/seed/user/32/32" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
