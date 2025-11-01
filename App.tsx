
import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SchedulesPage from './pages/SchedulesPage';
import AiToolsPage from './pages/AiToolsPage';
import BlocksPage from './pages/BlocksPage';
import InsightsPage from './pages/InsightsPage';
import { Page } from './types';
import { useSchedule } from './context/ScheduleContext';
import SleepModeOverlay from './components/SleepModeOverlay';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const { activeLockout } = useSchedule();

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <HomePage />;
      case 'Schedules':
        return <SchedulesPage />;
      case 'AI Tools':
        return <AiToolsPage />;
      case 'Blocks':
        return <BlocksPage />;
      case 'Insights':
        return <InsightsPage />;
      default:
        return <HomePage />;
    }
  };

  if (activeLockout) {
    return <SleepModeOverlay title={activeLockout.title} timeLeft={activeLockout.timeLeft} />;
  }

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-base text-slate-800 dark:text-on-surface flex flex-col font-sans antialiased">
      <main className="flex-1 overflow-y-auto pb-20">
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;