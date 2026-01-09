import React from 'react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
}

export default function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="w-64 hidden md:flex flex-col bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 h-full flex-shrink-0 z-20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex gap-3 items-center mb-8">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-sm border-2 border-primary" />
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal tracking-tight">
              Fitgig
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">
              Talent OS
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={item.active ? 'text-primary' : ''}>{item.icon}</span>
              <p className="text-sm font-medium leading-normal">{item.label}</p>
            </a>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-slate-700 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <p className="text-slate-900 dark:text-white text-sm font-medium truncate">
              Sarah Jenkins
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
              Instructor
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
