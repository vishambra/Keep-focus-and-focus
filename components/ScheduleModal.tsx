
import React, { useState, useEffect } from 'react';
import { Schedule, ScheduleType } from '../types';
import { CloseIcon } from './icons/FeatureIcons';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (schedule: Omit<Schedule, 'id'> | Schedule) => void;
    initialData?: Schedule | null;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dayFullLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [days, setDays] = useState<number[]>([]);
    const [scheduleType, setScheduleType] = useState<ScheduleType>('focus');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setStartTime(initialData.startTime);
            setEndTime(initialData.endTime);
            setDays(initialData.days);
            setScheduleType(initialData.type);
        } else {
            // Reset form for new schedule
            setTitle('');
            setStartTime('09:00');
            setEndTime('17:00');
            setDays([]);
            setScheduleType('focus');
        }
    }, [initialData, isOpen]);

    const handleDayToggle = (dayIndex: number) => {
        setDays(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
        );
    };
    
    const handleSave = () => {
        if (!title.trim()) {
            setError('Title cannot be empty.');
            return;
        }
        if (days.length === 0) {
            setError('Please select at least one day.');
            return;
        }
        if (startTime >= endTime) {
            setError('End time must be after start time.');
            return;
        }
        setError('');

        const scheduleData = { title, startTime, endTime, days: [...days].sort((a,b)=> a-b), type: scheduleType };
        if (initialData) {
            onSave({ ...scheduleData, id: initialData.id });
        } else {
            onSave(scheduleData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-base w-full max-w-md rounded-2xl flex flex-col max-h-[90vh] animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface">{initialData ? 'Edit Schedule' : 'New Schedule'}</h2>
                    <button onClick={onClose} aria-label="Close" className="p-1 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-on-surface-variant mb-2">Schedule Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setScheduleType('focus')} 
                                className={`py-3 rounded-lg font-semibold text-center transition-colors ${scheduleType === 'focus' ? 'bg-primary text-black' : 'bg-slate-200 dark:bg-surface hover:bg-slate-300 dark:hover:bg-white/10'}`}
                            >
                                Focus
                            </button>
                            <button 
                                onClick={() => setScheduleType('sleep')} 
                                className={`py-3 rounded-lg font-semibold text-center transition-colors ${scheduleType === 'sleep' ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-surface hover:bg-slate-300 dark:hover:bg-white/10'}`}
                            >
                                Lockout
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-on-surface-variant mb-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={scheduleType === 'focus' ? "E.g., Morning Study" : "E.g., Disconnect"}
                            className="w-full bg-white dark:bg-surface px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                             <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 dark:text-on-surface-variant mb-1">Start Time</label>
                             <input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-white dark:bg-surface px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 dark:text-on-surface-variant mb-1">End Time</label>
                             <input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-white dark:bg-surface px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-on-surface-variant mb-2">Repeat on</label>
                        <div className="flex justify-center gap-2">
                            {dayLabels.map((label, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDayToggle(index)}
                                    aria-label={dayFullLabels[index]}
                                    className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${days.includes(index) ? 'bg-primary text-black' : 'bg-slate-200 dark:bg-surface hover:bg-slate-300 dark:hover:bg-white/10'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {error && <p className="text-center text-sm text-red-500">{error}</p>}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-green-300 transition-colors"
                    >
                        Save Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;