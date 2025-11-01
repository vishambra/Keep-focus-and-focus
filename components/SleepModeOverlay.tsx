
import React, { useState, useEffect } from 'react';

interface SleepModeOverlayProps {
    title: string;
    timeLeft: number;
}

const SleepModeOverlay: React.FC<SleepModeOverlayProps> = ({ title, timeLeft }) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-violet-400 mb-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <h1 className="text-2xl sm:text-3xl font-bold">Phone Lockout Active</h1>
            <p className="text-slate-300 mt-2 max-w-sm">
                "{title}" is running. Time to disconnect and get some rest.
            </p>
            <div className="my-10">
                <p className="text-7xl sm:text-8xl font-bold font-mono tracking-tighter" style={{fontVariantNumeric: 'tabular-nums'}}>{currentTime}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <p className="text-sm text-slate-300">Ending in:</p>
                <p className="text-2xl font-semibold font-mono" style={{fontVariantNumeric: 'tabular-nums'}}>{hours}:{minutes}:{seconds}</p>
            </div>
        </div>
    );
};

export default SleepModeOverlay;