import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFocusTimer } from '../hooks/useFocusTimer';
import ThemeToggle from '../components/ThemeToggle';
import { motivationalQuotes } from '../data/quotes';
import { focusSounds } from '../data/sounds';
import { FocusSound, FocusSessionRecord, DailyGoal, Todo } from '../types';
import { SoundIcon, MuteIcon, UserIcon, CloseIcon, ChevronRightIcon, ClockIcon, TargetIcon, CheckCircleIcon, TrashIcon } from '../components/icons/FeatureIcons';

// --- HELPER HOOKS & UTILS ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- SUB-COMPONENTS ---
const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-right">
        <div className="text-sm font-semibold text-on-surface">{value}</div>
        <div className="text-xs text-on-surface-variant">{label}</div>
    </div>
);

const SoundSelector: React.FC<{
    selectedSound: FocusSound;
    onSelectSound: (sound: FocusSound) => void;
}> = ({ selectedSound, onSelectSound }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (sound: FocusSound) => {
        onSelectSound(sound);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select focus sound"
                className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-on-surface-variant hover:text-on-surface transition-colors"
            >
                {selectedSound.id === 'mute' ? <MuteIcon /> : <SoundIcon />}
            </button>
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-36 bg-surface/90 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-2 z-20">
                    {focusSounds.map(sound => (
                        <button
                            key={sound.id}
                            onClick={() => handleSelect(sound)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded ${selectedSound.id === sound.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-on-surface-variant hover:bg-white/10'
                                }`}
                        >
                            {sound.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const TimerDurationControl: React.FC<{ duration: number, onChange: (amount: number) => void }> = ({ duration, onChange }) => (
    <div className="absolute -top-5 flex items-center justify-center w-full">
        <div className="bg-black/20 backdrop-blur-sm rounded-full flex items-center gap-4 px-4 py-1">
            <button
                onClick={() => onChange(-5)}
                aria-label="Decrease focus time by 5 minutes"
                disabled={duration <= 5}
                className="text-2xl font-light text-on-surface-variant disabled:opacity-50 hover:text-on-surface"
            >
                -
            </button>
            <span className="text-base font-medium text-on-surface tabular-nums w-12 text-center">{duration} min</span>
            <button
                onClick={() => onChange(5)}
                aria-label="Increase focus time by 5 minutes"
                disabled={duration >= 90}
                className="text-2xl font-light text-on-surface-variant disabled:opacity-50 hover:text-on-surface"
            >
                +
            </button>
        </div>
    </div>
);

const ProfileModal: React.FC<{
    onClose: () => void;
    totalFocusMinutes: number;
    totalUsageMinutes: number;
    formatFocusTime: (mins: number) => string;
    focusHistory: FocusSessionRecord[];
}> = ({ onClose, totalFocusMinutes, totalUsageMinutes, formatFocusTime, focusHistory }) => {
    const [historyFilter, setHistoryFilter] = useState<'today' | 'week' | 'all'>('all');

    const filteredHistory = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000; // start of 7 days ago

        switch (historyFilter) {
            case 'today':
                return focusHistory.filter(record => record.completedAt >= today);
            case 'week':
                return focusHistory.filter(record => record.completedAt >= oneWeekAgo);
            case 'all':
            default:
                return focusHistory;
        }
    }, [focusHistory, historyFilter]);
    
    const formatHistoryDate = (timestamp: number) => {
        const now = new Date();
        const date = new Date(timestamp);
        
        const isToday = now.toDateString() === date.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = yesterday.toDateString() === date.toDateString();

        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `Today at ${time}`;
        if (isYesterday) return `Yesterday at ${time}`;
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}`;
    };

    return (
         <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-base w-full max-w-sm rounded-2xl flex flex-col max-h-[90vh] animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface">Profile & Settings</h2>
                    <button onClick={onClose} aria-label="Close" className="p-1 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col items-center gap-2 mb-6">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center font-bold text-4xl text-white">V</div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-on-surface mt-2">Guest User</h3>
                        <p className="text-sm text-slate-500 dark:text-on-surface-variant">
                             Total Focus: {formatFocusTime(totalFocusMinutes)} &bull; Usage: {formatFocusTime(totalUsageMinutes)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-surface rounded-lg">
                            <span className="font-medium text-slate-700 dark:text-on-surface-variant">Dark Mode</span>
                            <ThemeToggle />
                        </div>
                        <button className="w-full flex justify-between items-center p-3 bg-slate-100 dark:bg-surface rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-left">
                             <span className="font-medium text-slate-700 dark:text-on-surface-variant">Account Settings</span>
                             <ChevronRightIcon className="text-slate-400 dark:text-on-surface-variant" />
                        </button>
                         <button className="w-full flex justify-between items-center p-3 bg-slate-100 dark:bg-surface rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-left">
                             <span className="font-medium text-slate-700 dark:text-on-surface-variant">Notifications</span>
                             <ChevronRightIcon className="text-slate-400 dark:text-on-surface-variant" />
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-base font-bold text-slate-800 dark:text-on-surface">Focus History</h4>
                            <div className="bg-slate-200 dark:bg-surface p-0.5 rounded-full flex text-xs font-medium text-slate-600 dark:text-on-surface-variant">
                                <button 
                                    onClick={() => setHistoryFilter('today')} 
                                    className={`px-3 py-1 rounded-full transition-colors ${historyFilter === 'today' ? 'bg-white dark:bg-black/50 text-slate-900 dark:text-on-surface' : 'hover:text-slate-900 dark:hover:text-on-surface'}`}>
                                    Today
                                </button>
                                <button 
                                    onClick={() => setHistoryFilter('week')}
                                    className={`px-3 py-1 rounded-full transition-colors ${historyFilter === 'week' ? 'bg-white dark:bg-black/50 text-slate-900 dark:text-on-surface' : 'hover:text-slate-900 dark:hover:text-on-surface'}`}>
                                    7 Days
                                </button>
                                <button 
                                    onClick={() => setHistoryFilter('all')}
                                    className={`px-3 py-1 rounded-full transition-colors ${historyFilter === 'all' ? 'bg-white dark:bg-black/50 text-slate-900 dark:text-on-surface' : 'hover:text-slate-900 dark:hover:text-on-surface'}`}>
                                    All
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-surface rounded-lg p-3 max-h-48 overflow-y-auto">
                            {filteredHistory.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredHistory.map(record => (
                                        <li key={record.id} className="flex items-center gap-3 text-sm">
                                            <ClockIcon className="w-5 h-5 text-slate-500 dark:text-on-surface-variant flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-on-surface">{record.duration} min focus</p>
                                                <p className="text-xs text-slate-500 dark:text-on-surface-variant">{formatHistoryDate(record.completedAt)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-slate-500 dark:text-on-surface-variant py-4">
                                     {focusHistory.length === 0 ? "No completed sessions yet." : "No sessions in this period."}
                                </p>
                            )}
                        </div>
                    </div>

                    <button className="mt-6 w-full py-2.5 rounded-lg font-semibold bg-red-100/80 text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

const GoalSetterModal: React.FC<{
    onClose: () => void;
    onSetGoal: (goal: Omit<DailyGoal, 'progress' | 'lastUpdated'>) => void;
    currentGoal: DailyGoal | null;
}> = ({ onClose, onSetGoal, currentGoal }) => {
    const [type, setType] = useState<'sessions' | 'duration'>(currentGoal?.type || 'sessions');
    const [target, setTarget] = useState<number>(currentGoal?.target || 4);

    const handleSave = () => {
        if (target > 0) {
            onSetGoal({ type, target });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-base w-full max-w-sm rounded-2xl p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-center text-slate-900 dark:text-on-surface mb-4">Set Your Daily Goal</h2>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 dark:bg-surface rounded-full mb-4">
                    <button onClick={() => setType('sessions')} className={`py-2 rounded-full font-semibold transition-colors ${type === 'sessions' ? 'bg-white text-black dark:bg-black/50 dark:text-white' : 'text-slate-600 dark:text-on-surface-variant'}`}>Sessions</button>
                    <button onClick={() => setType('duration')} className={`py-2 rounded-full font-semibold transition-colors ${type === 'duration' ? 'bg-white text-black dark:bg-black/50 dark:text-white' : 'text-slate-600 dark:text-on-surface-variant'}`}>Duration</button>
                </div>
                <div className="flex items-center justify-center gap-4 my-6">
                    <input 
                        type="number" 
                        value={target}
                        onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 text-center text-3xl font-bold bg-transparent border-b-2 border-primary focus:outline-none"
                    />
                    <span className="text-xl text-slate-600 dark:text-on-surface-variant">{type === 'sessions' ? 'sessions' : 'minutes'}</span>
                </div>
                <button onClick={handleSave} className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-green-300 transition-colors">Set Goal</button>
            </div>
        </div>
    );
};

const TodoListPanel: React.FC<{
    todos: Todo[];
    onAdd: (text: string) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}> = ({ todos, onAdd, onToggle, onDelete, onClose }) => {
    const [newTodoText, setNewTodoText] = useState('');

    const handleAdd = () => {
        if (newTodoText.trim()) {
            onAdd(newTodoText.trim());
            setNewTodoText('');
        }
    };

    return (
        <div className="fixed bottom-16 left-0 right-0 z-40 p-4 animate-fade-in-up">
            <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-lg border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg mx-auto shadow-2xl">
                <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-white/10">
                    <h3 className="font-bold text-slate-800 dark:text-on-surface ml-2">Session To-Do List</h3>
                    <button onClick={onClose} aria-label="Close to-do list" className="p-1.5 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-4 max-h-48 overflow-y-auto">
                    {todos.length > 0 ? (
                        <ul className="space-y-2">
                            {todos.map(todo => (
                                <li key={todo.id} className="flex items-center gap-3">
                                    <button onClick={() => onToggle(todo.id)}>
                                        <CheckCircleIcon className={`w-6 h-6 transition-colors ${todo.completed ? 'text-primary' : 'text-slate-400 dark:text-on-surface-variant'}`} />
                                    </button>
                                    <span className={`flex-grow text-slate-800 dark:text-on-surface ${todo.completed ? 'line-through text-slate-500 dark:text-on-surface-variant' : ''}`}>{todo.text}</span>
                                    <button onClick={() => onDelete(todo.id)} className="text-slate-500 hover:text-red-500 p-1">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-sm text-slate-500 dark:text-on-surface-variant py-4">Add a task to get started.</p>
                    )}
                </div>
                <div className="p-3 border-t border-slate-200 dark:border-white/10">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTodoText}
                            onChange={(e) => setNewTodoText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder="Add a new task..."
                             className="flex-grow bg-white dark:bg-black/20 px-4 py-2 rounded-lg border border-slate-300 dark:border-transparent focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                        />
                        <button onClick={handleAdd} className="bg-primary text-black font-semibold px-4 rounded-lg hover:bg-green-300 transition-colors">Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const HomePage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [totalFocusMinutes, setTotalFocusMinutes] = useState(() => parseInt(localStorage.getItem('totalFocusMinutes') || '0', 10));
    const [totalUsageMinutes, setTotalUsageMinutes] = useState(() => parseInt(localStorage.getItem('totalUsageMinutes') || '0', 10));
    const [focusDuration, setFocusDuration] = useState(() => parseInt(localStorage.getItem('focusDuration') || '25', 10));
    const [selectedSound, setSelectedSound] = useState<FocusSound>(() => focusSounds.find(s => s.id === localStorage.getItem('focusSoundId')) || focusSounds[0]);
    const [focusHistory, setFocusHistory] = useState<FocusSessionRecord[]>(() => JSON.parse(localStorage.getItem('focusHistory') || '[]'));
    const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(() => {
        const saved = localStorage.getItem('dailyGoal');
        if (!saved) return null;
        try {
            const goal = JSON.parse(saved);
            // Ensure `goal` is not null and is an object before proceeding.
            if (goal && typeof goal === 'object') {
                // Reset progress if it's a new day
                if (goal.lastUpdated !== getTodayDateString()) {
                    goal.progress = 0;
                    goal.lastUpdated = getTodayDateString();
                }
                return goal as DailyGoal;
            }
        } catch (error) {
            console.error('Failed to parse daily goal from localStorage:', error);
        }
        // If parsing fails or stored value is not a valid goal object, return null.
        return null;
    });
    const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem('sessionTodos') || '[]'));

    // Modals & UI State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isTodoListOpen, setIsTodoListOpen] = useState(false);

    // Timer Mode State
    const [timerMode, setTimerMode] = useState<'standard' | 'pomodoro'>(() => (localStorage.getItem('timerMode') as 'standard' | 'pomodoro') || 'standard');
    const [pomodoroState, setPomodoroState] = useState<'focus' | 'break'>('focus');
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const sessionJustFinished = useRef(false);

    // --- DERIVED STATE & TIMER INIT ---
    const currentTimerDuration = timerMode === 'pomodoro' ? (pomodoroState === 'focus' ? 25 : 5) : focusDuration;
    const { minutes, seconds, totalSeconds, isActive, isFinished, start, pause, resume, reset: baseReset, initialMinutes } = useFocusTimer(currentTimerDuration, selectedSound.url);
    const hasStarted = totalSeconds < initialMinutes * 60;
    
    // --- QUOTES ---
    const dailyQuote = useMemo(() => motivationalQuotes[new Date().getDate() % motivationalQuotes.length], []);
    const completionQuote = useMemo(() => {
        const otherQuotes = motivationalQuotes.filter(q => q !== dailyQuote);
        return otherQuotes[Math.floor(Math.random() * otherQuotes.length)];
    }, [dailyQuote]);
    
    // --- PERSISTENCE & SIDE EFFECTS ---
    useEffect(() => localStorage.setItem('totalFocusMinutes', String(totalFocusMinutes)), [totalFocusMinutes]);
    useEffect(() => localStorage.setItem('totalUsageMinutes', String(totalUsageMinutes)), [totalUsageMinutes]);
    useEffect(() => localStorage.setItem('focusDuration', String(focusDuration)), [focusDuration]);
    useEffect(() => localStorage.setItem('focusSoundId', selectedSound.id), [selectedSound]);
    useEffect(() => localStorage.setItem('focusHistory', JSON.stringify(focusHistory)), [focusHistory]);
    useEffect(() => localStorage.setItem('timerMode', timerMode), [timerMode]);
    useEffect(() => localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal)), [dailyGoal]);
    useEffect(() => localStorage.setItem('sessionTodos', JSON.stringify(todos)), [todos]);

    // Track total usage time
    useEffect(() => {
        const interval = setInterval(() => setTotalUsageMinutes(prev => prev + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    // Session Completion Logic (Standard & Pomodoro)
    useEffect(() => {
        if (isFinished) {
            sessionJustFinished.current = true;
            let sessionDuration = 0;
            const wasFocusSession = timerMode === 'standard' || (timerMode === 'pomodoro' && pomodoroState === 'focus');

            if (timerMode === 'standard') sessionDuration = initialMinutes;
            else if (timerMode === 'pomodoro' && pomodoroState === 'focus') {
                sessionDuration = 25;
                setPomodoroCount(prev => prev + 1);
            }

            if (wasFocusSession && sessionDuration > 0) {
                 const newTotal = totalFocusMinutes + sessionDuration;
                 setTotalFocusMinutes(newTotal);
                 
                 const newRecord: FocusSessionRecord = { id: Date.now().toString(), duration: sessionDuration, completedAt: Date.now() };
                 setFocusHistory(prev => [newRecord, ...prev.slice(0, 49)]);

                 // Update daily goal
                 if (dailyGoal) {
                     setDailyGoal(g => g ? ({ ...g, progress: g.progress + (g.type === 'sessions' ? 1 : sessionDuration) }) : null);
                 }
            }
            
            if (timerMode === 'pomodoro') {
                setPomodoroState(prev => prev === 'focus' ? 'break' : 'focus');
            }
        }
    }, [isFinished]);

    // Auto-start next Pomodoro cycle
    useEffect(() => {
        if (sessionJustFinished.current && timerMode === 'pomodoro') {
            start();
            sessionJustFinished.current = false;
        }
    }, [pomodoroState]);

    // --- HANDLERS ---
    const reset = () => {
        baseReset();
        setTodos([]);
        if (timerMode === 'pomodoro') {
            setPomodoroState('focus');
            setPomodoroCount(0);
        }
    };
    
    const handleDurationChange = (amount: number) => {
        setFocusDuration(prev => Math.max(5, Math.min(90, prev + amount)));
    };
    
    const handleSetGoal = (goal: Omit<DailyGoal, 'progress' | 'lastUpdated'>) => {
        setDailyGoal({ ...goal, progress: 0, lastUpdated: getTodayDateString() });
    };

    const addTodo = (text: string) => setTodos(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
    const toggleTodo = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

    const formatFocusTime = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    };

    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // --- RENDER ---
    return (
        <div className="relative h-full min-h-screen flex flex-col items-center justify-center p-4 text-white overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(https://picsum.photos/id/1015/1200/800)` }}>
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            
            {isFinished && timerMode === 'standard' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                    <h2 className="text-4xl font-bold text-primary mb-4">Focus Complete!</h2>
                    <p className="text-lg text-on-surface max-w-md mb-8">"{completionQuote}"</p>
                    <button onClick={reset} className="bg-primary text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-green-300 transition-colors transform hover:scale-105">Start New Session</button>
                </div>
            )}
            
            {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} totalFocusMinutes={totalFocusMinutes} totalUsageMinutes={totalUsageMinutes} formatFocusTime={formatFocusTime} focusHistory={focusHistory} />}
            {isGoalModalOpen && <GoalSetterModal onClose={() => setIsGoalModalOpen(false)} onSetGoal={handleSetGoal} currentGoal={dailyGoal} />}
            {isTodoListOpen && <TodoListPanel todos={todos} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} onClose={() => setIsTodoListOpen(false)} />}

            <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center h-full pt-4 sm:pt-8">
                {/* Header */}
                <header className="w-full flex justify-between items-center px-2 mb-6 sm:mb-10">
                    <button onClick={() => setIsProfileModalOpen(true)} aria-label="User Profile" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <UserIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-6">
                        <StatCard label="Focus Time" value={formatFocusTime(totalFocusMinutes)} />
                        <StatCard label="Usage Time" value={formatFocusTime(totalUsageMinutes)} />
                        <ThemeToggle />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center w-full">
                    {/* Main Timer Display */}
                    <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center shadow-2xl">
                        {timerMode === 'standard' && !isActive && !hasStarted && <TimerDurationControl duration={focusDuration} onChange={handleDurationChange} />}
                        {timerMode === 'pomodoro' && (
                             <p className="text-lg font-semibold uppercase tracking-wider mb-2" style={{ color: pomodoroState === 'break' ? '#a78bfa' : '#4ade80' }}>
                                {pomodoroState} {pomodoroState === 'focus' && ` #${pomodoroCount + 1}`}
                             </p>
                        )}
                        <h1 aria-live="polite" className="text-7xl sm:text-8xl font-bold tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>{formattedTime}</h1>
                        <p className="text-sm text-on-surface-variant h-5">{!isActive && "57 apps blocked"}</p>
                    </div>

                     {/* Daily Goal */}
                    {dailyGoal && (
                        <div className="w-full max-w-sm mt-6">
                            <div className="flex justify-between items-center text-xs font-medium mb-1">
                                <span className="text-on-surface-variant">Daily Goal</span>
                                <span className="text-on-surface">{dailyGoal.progress} / {dailyGoal.target} {dailyGoal.type}</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (dailyGoal.progress / dailyGoal.target) * 100)}%` }}></div>
                            </div>
                        </div>
                    )}
                    
                    {/* Controls */}
                    <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-sm">
                         <button
                            onClick={isActive ? pause : hasStarted ? resume : start}
                            aria-label={isActive ? 'Pause timer' : 'Start timer'}
                            className="w-full h-16 rounded-2xl bg-white text-black flex items-center justify-center text-2xl font-bold transform hover:scale-105 transition-transform"
                        >
                            {isActive ? 'PAUSE' : hasStarted ? 'RESUME' : 'START'}
                        </button>
                        <div className="flex justify-between w-full">
                             <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                                <TargetIcon className="w-5 h-5" /> Goal
                             </button>
                             <button
                                onClick={reset}
                                aria-label="Reset timer"
                                className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.13-5.22M20 15a9 9 0 01-14.13 5.22" /></svg>
                            </button>
                            <SoundSelector selectedSound={selectedSound} onSelectSound={setSelectedSound} />
                            <button onClick={() => setIsTodoListOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                                <CheckCircleIcon className="w-5 h-5" /> To-Do
                            </button>
                        </div>
                    </div>
                </main>
                
                {/* Footer Quote */}
                <footer className="w-full text-center py-4 mt-auto">
                    <p className="text-sm text-on-surface-variant italic max-w-md mx-auto">"{dailyQuote}"</p>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;