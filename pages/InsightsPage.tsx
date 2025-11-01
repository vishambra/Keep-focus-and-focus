import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CategorizedSite } from '../types';

// A simple circular progress component, credit: https://www.w3.org/TR/SVG/
const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const strokeWidth = 10;
    const radius = 85;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                className="text-slate-200 dark:text-surface"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
                strokeLinecap="round"
                className="text-primary"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};


const InsightsPage: React.FC = () => {
    const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
    const [totalUsageMinutes, setTotalUsageMinutes] = useState(0);
    const [sessionStarts, setSessionStarts] = useState(0);
    const [sites, setSites] = useState<CategorizedSite[]>([]);

    useEffect(() => {
        const focusMins = parseInt(localStorage.getItem('totalFocusMinutes') || '0', 10);
        const usageMins = parseInt(localStorage.getItem('totalUsageMinutes') || '0', 10);
        const starts = parseInt(localStorage.getItem('sessionStarts') || '0', 10);
        const savedSites = JSON.parse(localStorage.getItem('customBlocklist') || '[]') as CategorizedSite[];

        setTotalFocusMinutes(focusMins);
        setTotalUsageMinutes(usageMins);
        setSessionStarts(starts);
        setSites(savedSites);
    }, []);
    
    const productivityScore = totalUsageMinutes > 0 ? Math.round((totalFocusMinutes / totalUsageMinutes) * 100) : 0;
    const uncategorizedMinutes = Math.max(0, totalUsageMinutes - totalFocusMinutes);

    const formatTime = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    };
    
    return (
        <div>
            <Header title="Insights" />
            <div className="p-4 space-y-8">
                <div className="bg-white dark:bg-surface rounded-xl p-6 flex flex-col items-center text-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-on-surface mb-4">Productivity Score</h2>
                    <div className="relative">
                        <CircularProgress progress={productivityScore} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-900 dark:text-on-surface">{productivityScore}<span className="text-2xl text-slate-500 dark:text-on-surface-variant">%</span></span>
                            <span className="text-sm text-slate-500 dark:text-on-surface-variant">Productive</span>
                        </div>
                    </div>
                    <p className="mt-4 text-slate-600 dark:text-on-surface-variant max-w-xs text-sm">
                        This score is based on the ratio of active focus time to total time spent in the app.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Productive Time" value={formatTime(totalFocusMinutes)} description="Total time in focus sessions." />
                    <StatCard title="Uncategorized Time" value={formatTime(uncategorizedMinutes)} description="Time spent in-app outside of focus." />
                    <StatCard title="Session Starts" value={String(sessionStarts)} description="Number of focus sessions initiated." />
                </div>
                
                <div className="bg-slate-100 dark:bg-surface/50 rounded-lg p-4 text-sm text-slate-600 dark:text-on-surface-variant">
                    <h3 className="font-semibold text-slate-800 dark:text-on-surface mb-2">How Insights Work</h3>
                    <p className="mb-2">This page provides insights based on your activity <span className="font-bold">within Zenith Focus</span>. Due to browser security and user privacy, web applications cannot track your usage of other apps or how many times you unlock your device.</p>
                    <p>The "Session Starts" metric is a great way to track your intention to focus throughout the day. For more detailed blocking, categorize websites as 'Productive' or 'Destructive' on the Blocks page.</p>
                </div>

                <div>
                     <h3 className="text-lg font-bold text-slate-800 dark:text-on-surface mb-3">Categorized Websites</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SiteListCard title="Destructive Sites" sites={sites.filter(s => s.category === 'destructive')} />
                        <SiteListCard title="Productive Sites" sites={sites.filter(s => s.category === 'productive')} />
                     </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{title: string; value: string; description: string}> = ({title, value, description}) => (
    <div className="bg-white dark:bg-surface rounded-xl p-4">
        <p className="text-sm text-slate-500 dark:text-on-surface-variant">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-on-surface my-1">{value}</p>
        <p className="text-xs text-slate-500 dark:text-on-surface-variant">{description}</p>
    </div>
);

const SiteListCard: React.FC<{title: string; sites: CategorizedSite[]}> = ({title, sites}) => (
    <div className="bg-white dark:bg-surface rounded-xl p-4 min-h-[100px]">
        <h4 className="font-semibold text-slate-800 dark:text-on-surface mb-2">{title}</h4>
        {sites.length > 0 ? (
            <ul className="space-y-1">
                {sites.map(site => (
                    <li key={site.url} className="text-sm text-slate-600 dark:text-on-surface-variant font-mono truncate">{site.url}</li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-500 dark:text-on-surface-variant">No sites categorized yet.</p>
        )}
    </div>
);

export default InsightsPage;