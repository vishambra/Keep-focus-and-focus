import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import { Schedule, SuggestedSchedule } from '../types';
import { useSchedule } from '../context/ScheduleContext';
import ScheduleModal from '../components/ScheduleModal';
import { EditIcon, TrashIcon, BedIcon, ClockIcon, NotificationIcon } from '../components/icons/FeatureIcons';

const SunIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-3.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.464-2.95a1 1 0 00-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707zm-2.121-3.536a1 1 0 010 1.414l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM10 4a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" />
    </svg>
);
const MoonIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
);
const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);


const suggestedSchedules: SuggestedSchedule[] = [
  { id: 1, title: 'Morning Study', time: '06:00 AM - 08:00 AM', days: 'Mon - Fri', icon: SunIcon },
  { id: 2, title: 'Afternoon Study', time: '02:00 PM - 04:00 PM', days: 'Mon - Fri', icon: SunIcon },
  { id: 3, title: 'Evening Study', time: '06:00 PM - 08:00 PM', days: 'Mon - Fri', icon: (props) => <SunIcon {...props} className={`${props.className} opacity-70`} /> },
  { id: 4, title: 'Night Study', time: '08:00 PM - 10:00 PM', days: 'Mon - Fri', icon: MoonIcon },
];

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatDays = (dayIndexes: number[]): string => {
    if (dayIndexes.length === 7) return 'Every day';
    if (dayIndexes.join(',') === '1,2,3,4,5') return 'Weekdays';
    if (dayIndexes.join(',') === '0,6') return 'Weekends';
    return dayIndexes.map(i => dayMap[i]).join(', ');
};

const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${formattedHour}:${minute} ${ampm}`;
};

const SuggestedScheduleCard: React.FC<{ schedule: SuggestedSchedule }> = ({ schedule }) => (
  <div className="bg-white dark:bg-surface p-4 rounded-xl flex items-center justify-between border border-slate-200 dark:border-white/10">
    <div className="flex items-center gap-4">
      <div className="bg-slate-100 dark:bg-black/20 p-3 rounded-full">
        <schedule.icon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-on-surface">{schedule.title}</p>
        <p className="text-sm text-slate-500 dark:text-on-surface-variant">{schedule.time}</p>
        <p className="text-xs text-slate-500 dark:text-on-surface-variant">{schedule.days}</p>
      </div>
    </div>
    <button className="bg-green-100 dark:bg-primary/20 text-green-700 dark:text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-green-200 dark:hover:bg-primary/40 transition-colors">
      Add +
    </button>
  </div>
);

const CustomScheduleCard: React.FC<{ schedule: Schedule; onEdit: () => void; onDelete: () => void; }> = ({ schedule, onEdit, onDelete }) => (
    <div className={`p-4 rounded-xl border ${schedule.type === 'sleep' ? 'bg-violet-100/50 dark:bg-secondary/10 border-violet-200 dark:border-secondary/20' : 'bg-white dark:bg-surface border-slate-200 dark:border-white/10'}`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="font-semibold text-slate-800 dark:text-on-surface">{schedule.title}</p>
                <p className="text-sm text-slate-500 dark:text-on-surface-variant">{`${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">{formatDays(schedule.days)}</p>
            </div>
            <div className="flex gap-2">
                 <button onClick={onEdit} className="p-2 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

const ActiveFocusTimer: React.FC = () => {
    const { activeFocusSchedule, timeLeftInFocus } = useSchedule();
    if (!activeFocusSchedule) return null;

    const hours = Math.floor(timeLeftInFocus / 3600);
    const minutes = Math.floor((timeLeftInFocus % 3600) / 60);
    const seconds = timeLeftInFocus % 60;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    return (
        <div className="bg-green-500 dark:bg-primary text-black p-4 rounded-xl mb-6 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <h2 className="font-bold">{activeFocusSchedule.title} is active!</h2>
            </div>
            <p className="font-mono text-3xl font-bold mt-1" style={{fontVariantNumeric: 'tabular-nums'}}>{formattedTime}</p>
            <p className="text-sm opacity-80">Focus time remaining. All distracting websites are now blocked.</p>
        </div>
    );
};

const QuickLockoutCard: React.FC = () => {
    const { startOneTimeLockout, activeLockout } = useSchedule();
    const [duration, setDuration] = useState('60');

    const handleStart = () => {
        const minutes = parseInt(duration, 10);
        if (!isNaN(minutes) && minutes > 0) {
            startOneTimeLockout(minutes);
        }
    };

    if (activeLockout) {
        return null; 
    }

    return (
        <div className="bg-white dark:bg-surface p-4 rounded-xl border border-slate-200 dark:border-white/10 mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-on-surface mb-2">Start a Quick Lockout</h3>
            <p className="text-sm text-slate-500 dark:text-on-surface-variant mb-3">
                Temporarily lock the app for a set amount of time to enforce a break.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Minutes"
                    min="1"
                    className="w-full bg-slate-100 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-300 dark:border-transparent focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                />
                <button
                    onClick={handleStart}
                    disabled={!duration || parseInt(duration, 10) <= 0}
                    className="bg-primary text-black font-bold px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-300 transition-colors"
                >
                    Start
                </button>
            </div>
        </div>
    );
}

const NotificationSettings: React.FC = () => {
    const [permission, setPermission] = useState(Notification.permission);

    const requestPermission = useCallback(() => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        Notification.requestPermission().then(setPermission);
    }, []);

    let content;
    switch (permission) {
        case 'granted':
            content = <p className="text-sm text-green-700 dark:text-primary">Notifications are enabled.</p>;
            break;
        case 'denied':
            content = <p className="text-sm text-red-700 dark:text-red-400 text-right">Notifications are blocked.<br/>You'll need to enable them in your browser settings.</p>;
            break;
        default:
            content = (
                <button 
                    onClick={requestPermission} 
                    className="bg-slate-200 dark:bg-surface px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
                >
                    Enable Notifications
                </button>
            );
    }

    return (
        <div className="bg-white dark:bg-surface p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <NotificationIcon className="w-6 h-6 text-slate-500 dark:text-on-surface-variant" />
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-on-surface">Pre-Session Alerts</h3>
                    <p className="text-xs text-slate-500 dark:text-on-surface-variant">Get a heads-up 5 minutes before a schedule starts.</p>
                </div>
            </div>
            {content}
        </div>
    );
};


const SchedulesPage: React.FC = () => {
    const { schedules, addSchedule, updateSchedule, deleteSchedule } = useSchedule();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    const focusSchedules = schedules.filter(s => s.type === 'focus');
    const sleepSchedules = schedules.filter(s => s.type === 'sleep');

    const handleOpenModalForNew = () => {
        setEditingSchedule(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleSaveSchedule = (scheduleData: Omit<Schedule, 'id'> | Schedule) => {
        if ('id' in scheduleData) {
            updateSchedule(scheduleData);
        } else {
            addSchedule(scheduleData);
        }
    };
    
    return (
        <div className="p-4">
            <Header title="Schedules" />
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSchedule}
                initialData={editingSchedule}
            />
            <div className="mt-6 space-y-8">
                <NotificationSettings />
                <ActiveFocusTimer />
                
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-slate-800 dark:text-on-surface font-bold text-lg">Focus Schedules</h3>
                        <button onClick={handleOpenModalForNew} className="bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-700 dark:hover:bg-gray-200 transition-colors">
                            Add Schedule +
                        </button>
                    </div>
                    {focusSchedules.length > 0 ? (
                        <div className="space-y-3">
                            {focusSchedules.map(schedule => (
                                <CustomScheduleCard 
                                    key={schedule.id}
                                    schedule={schedule}
                                    onEdit={() => handleOpenModalForEdit(schedule)}
                                    onDelete={() => deleteSchedule(schedule.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4 bg-slate-100 dark:bg-surface rounded-lg">
                            <CalendarIcon className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-600 dark:text-on-surface-variant">No custom focus schedules yet.</p>
                             <p className="text-sm text-slate-500 dark:text-on-surface-variant">Create a schedule to automate your focus sessions.</p>
                        </div>
                    )}
                </div>

                 <div>
                    <h3 className="text-slate-800 dark:text-on-surface font-bold text-lg mb-3">Phone Lockout</h3>
                    <QuickLockoutCard />
                    {sleepSchedules.length > 0 ? (
                        <div className="space-y-3">
                            {sleepSchedules.map(schedule => (
                                <CustomScheduleCard 
                                    key={schedule.id}
                                    schedule={schedule}
                                    onEdit={() => handleOpenModalForEdit(schedule)}
                                    onDelete={() => deleteSchedule(schedule.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-8 px-4 bg-slate-100 dark:bg-surface rounded-lg">
                            <BedIcon className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-600 dark:text-on-surface-variant">No lockout schedules yet.</p>
                             <p className="text-sm text-slate-500 dark:text-on-surface-variant">Set a recurring schedule to lock the app automatically.</p>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-slate-600 dark:text-on-surface-variant font-semibold mb-3 text-sm">
                        Suggested schedules
                    </h3>
                    <div className="space-y-3">
                        {suggestedSchedules.map(schedule => (
                            <SuggestedScheduleCard key={schedule.id} schedule={schedule} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulesPage;