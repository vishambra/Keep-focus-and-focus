
import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <header className="p-4 sm:p-6 flex justify-between items-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-on-surface">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface rounded-full text-sm text-slate-600 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-transparent">
            <HelpIcon />
            <span className="hidden sm:inline">Help</span>
        </button>
      </div>
    </header>
  );
};

export default Header;