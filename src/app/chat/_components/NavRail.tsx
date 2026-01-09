import React from 'react';
import { Briefcase, MessageCircle, Calendar, User } from 'lucide-react';

export default function NavRail() {
  return (
    <nav className="w-20 flex-shrink-0 flex flex-col items-center py-6 border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark z-20">
      {/* Logo */}
      <div className="mb-8">
        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary" />
      </div>

      {/* Icons */}
      <div className="flex flex-col gap-6 w-full items-center flex-1">
        <NavButton
          icon={<Briefcase size={28} />}
          label="Jobs"
          href="#"
        />
        <NavButton
          icon={<MessageCircle size={28} />}
          label="Messages"
          href="#"
          active
        />
        <NavButton
          icon={<Calendar size={28} />}
          label="Schedule"
          href="#"
        />
      </div>

      {/* Profile Bottom */}
      <button className="p-3 rounded-lg text-text-muted hover:text-primary transition-colors">
        <User size={28} />
      </button>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function NavButton({ icon, label, href, active }: NavButtonProps) {
  return (
    <a
      href={href}
      className={`p-3 rounded-lg transition-all relative group ${
        active
          ? 'bg-primary text-black shadow-lg shadow-primary/20'
          : 'text-text-muted hover:bg-background-light dark:hover:bg-background-dark hover:text-primary'
      }`}
    >
      {icon}
      <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {label}
      </span>
    </a>
  );
}
