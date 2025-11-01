
import React from 'react';
import { Page } from '../types';
import { HomeIcon, ScheduleIcon, AiToolsIcon, BlocksIcon, InsightsIcon } from './icons/NavIcons';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: Page;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={`Navigate to ${label}`}
      className={`flex flex-col items-center justify-center gap-1 w-full transition-colors duration-200 ${
        isActive ? 'text-green-600 dark:text-primary' : 'text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const navItems: { label: Page; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Schedules', icon: <ScheduleIcon /> },
    { label: 'AI Tools', icon: <AiToolsIcon /> },
    { label: 'Blocks', icon: <BlocksIcon /> },
    { label: 'Insights', icon: <InsightsIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-surface/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          isActive={currentPage === item.label}
          onClick={() => setCurrentPage(item.label)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;