import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Schedule } from '../types';

interface ScheduleContextType {
    schedules: Schedule[];
    addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
    updateSchedule: (schedule: Schedule) => void;
    deleteSchedule: (id: string) => void;
    activeFocusSchedule: Schedule | null;
    timeLeftInFocus: number;
    activeLockout: { title: string; timeLeft: number } | null;
    startOneTimeLockout: (durationInMinutes: number) => void;
    cancelOneTimeLockout: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const getActiveSchedules = (schedules: Schedule[]): { 
    activeFocus: Schedule | null; timeLeftFocus: number; 
    activeSleep: Schedule | null; timeLeftSleep: number;
} => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    let activeFocus: Schedule | null = null;
    let timeLeftFocus = 0;
    let activeSleep: Schedule | null = null;
    let timeLeftSleep = 0;

    for (const schedule of schedules) {
        if (schedule.days.includes(currentDay)) {
            const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
            const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
            const startTimeInMinutes = startHour * 60 + startMinute;
            const endTimeInMinutes = endHour * 60 + endMinute;

            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
                const endTimeToday = new Date();
                endTimeToday.setHours(endHour, endMinute, 0, 0);
                const timeLeft = Math.round((endTimeToday.getTime() - now.getTime()) / 1000);
                
                if (schedule.type === 'focus' && !activeFocus) {
                    activeFocus = schedule;
                    timeLeftFocus = timeLeft;
                } else if (schedule.type === 'sleep' && !activeSleep) {
                    activeSleep = schedule;
                    timeLeftSleep = timeLeft;
                }
            }
        }
    }
    return { activeFocus, timeLeftFocus, activeSleep, timeLeftSleep };
};

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [schedules, setSchedules] = useState<Schedule[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const savedSchedules = localStorage.getItem('zenith-schedules');
            const parsedSchedules = savedSchedules ? JSON.parse(savedSchedules) : [];
            // Migration for older data: ensure all schedules have a `type`
            return parsedSchedules.map((s: any) => ({ ...s, type: s.type || 'focus' }));
        } catch (error) {
            console.error('Error reading schedules from localStorage', error);
            return [];
        }
    });
    
    const [oneTimeLockoutEndTime, setOneTimeLockoutEndTime] = useState<number | null>(null);
    const [activeFocusSchedule, setActiveFocusSchedule] = useState<Schedule | null>(null);
    const [timeLeftInFocus, setTimeLeftInFocus] = useState(0);
    const [activeLockout, setActiveLockout] = useState<{ title: string; timeLeft: number } | null>(null);
    const lastCheckedDate = useRef<string | null>(null);
    const sentNotifications = useRef<Set<string>>(new Set());


    useEffect(() => {
        try {
            localStorage.setItem('zenith-schedules', JSON.stringify(schedules));
        } catch (error) {
            console.error('Error saving schedules to localStorage', error);
        }
    }, [schedules]);

    // Effect for checking active schedules and lockouts
    useEffect(() => {
        const intervalId = setInterval(() => {
            const { activeFocus, timeLeftFocus, activeSleep, timeLeftSleep } = getActiveSchedules(schedules);
            setActiveFocusSchedule(activeFocus);
            setTimeLeftInFocus(timeLeftFocus);

            // One-time lockout check takes precedence
            if (oneTimeLockoutEndTime && oneTimeLockoutEndTime > Date.now()) {
                const timeLeft = Math.round((oneTimeLockoutEndTime - Date.now()) / 1000);
                setActiveLockout({ title: 'Quick Lockout', timeLeft });
            } else if (activeSleep) { // Then check for scheduled lockout
                setActiveLockout({ title: activeSleep.title, timeLeft: timeLeftSleep });
            } else {
                setActiveLockout(null);
                if (oneTimeLockoutEndTime) setOneTimeLockoutEndTime(null); // Clear expired one-time lockout
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [schedules, oneTimeLockoutEndTime]);

    // Effect for sending notifications
    useEffect(() => {
        const NOTIFICATION_LEAD_TIME_MINUTES = 5;

        const checkSchedulesAndNotify = () => {
            if (Notification.permission !== 'granted') {
                return;
            }

            const now = new Date();
            const todayStr = now.toDateString();
            
            // Reset sent notifications at midnight
            if (lastCheckedDate.current !== todayStr) {
                sentNotifications.current.clear();
                lastCheckedDate.current = todayStr;
            }

            const currentDay = now.getDay();
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
            
            schedules.forEach(schedule => {
                if (schedule.days.includes(currentDay)) {
                    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                    const startTimeInMinutes = startHour * 60 + startMinute;
                    
                    const timeUntilStart = startTimeInMinutes - currentTimeInMinutes;
                    const notificationId = `${schedule.id}-${todayStr}`;

                    if (
                        timeUntilStart > 0 && 
                        timeUntilStart <= NOTIFICATION_LEAD_TIME_MINUTES &&
                        !sentNotifications.current.has(notificationId)
                    ) {
                        const typeText = schedule.type === 'focus' ? 'Focus session' : 'Lockout';
                        new Notification('Upcoming Schedule', {
                            body: `Your "${schedule.title}" ${typeText} is starting in ${timeUntilStart} minute(s).`,
                            icon: '/vite.svg', // Using the app's favicon as a default icon
                        });
                        sentNotifications.current.add(notificationId);
                    }
                }
            });
        };

        const intervalId = setInterval(checkSchedulesAndNotify, 30 * 1000); // Check every 30 seconds

        return () => clearInterval(intervalId);
    }, [schedules]);
    
    const startOneTimeLockout = useCallback((durationInMinutes: number) => {
        setOneTimeLockoutEndTime(Date.now() + durationInMinutes * 60 * 1000);
    }, []);

    const cancelOneTimeLockout = useCallback(() => {
        setOneTimeLockoutEndTime(null);
    }, []);

    const addSchedule = useCallback((scheduleData: Omit<Schedule, 'id'>) => {
        const newSchedule: Schedule = { ...scheduleData, id: Date.now().toString() };
        setSchedules(prev => [...prev, newSchedule]);
    }, []);

    const updateSchedule = useCallback((updatedSchedule: Schedule) => {
        setSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
    }, []);

    const deleteSchedule = useCallback((id: string) => {
        setSchedules(prev => prev.filter(s => s.id !== id));
    }, []);

    const value = { 
        schedules, 
        addSchedule, 
        updateSchedule, 
        deleteSchedule, 
        activeFocusSchedule, 
        timeLeftInFocus, 
        activeLockout, 
        startOneTimeLockout, 
        cancelOneTimeLockout
    };

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (context === undefined) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
};