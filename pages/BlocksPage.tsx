import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ToggleSwitch from '../components/ToggleSwitch';
import { BlockItem, CategorizedSite, SiteCategory } from '../types';
import { BrainIcon, TrashIcon, ShieldIcon, NotificationIcon } from '../components/icons/FeatureIcons';
import { useSchedule } from '../context/ScheduleContext';

// --- HELPER HOOK for Countdown ---
const useCountdown = (endTime?: number) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!endTime) {
            setTimeLeft(0);
            return;
        }

        const update = () => {
            const remaining = Math.max(0, endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining > 0) {
                requestAnimationFrame(update);
            }
        };
        update();

    }, [endTime]);
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isCounting: timeLeft > 0,
    };
};

// --- MODAL COMPONENT ---
const DurationSelectorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSetDuration: (minutes: number) => void;
}> = ({ isOpen, onClose, onSetDuration }) => {
    if (!isOpen) return null;

    const durations = [
        { label: '15 minutes', minutes: 15 },
        { label: '30 minutes', minutes: 30 },
        { label: '45 minutes', minutes: 45 },
        { label: '1 hour', minutes: 60 },
        { label: '90 minutes', minutes: 90 },
        { label: '2 hours', minutes: 120 },
    ];

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-base w-full max-w-sm rounded-xl p-6 text-center animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-on-surface mb-4">Block Websites For...</h3>
                <div className="space-y-3">
                    {durations.map(({ label, minutes }) => (
                        <button
                            key={minutes}
                            onClick={() => onSetDuration(minutes)}
                            className="w-full bg-slate-100 dark:bg-surface text-slate-800 dark:text-on-surface py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 text-sm text-slate-500 dark:text-on-surface-variant font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};


// --- ICONS ---
const YoutubeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);
const WebsiteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.72 6 7.92 6 10a4 4 0 004 4c2.08 0 2.28-1.487 2.754-2.312a6.002 6.002 0 01-4.422 2.33C6.013 13.987 4.01 11.987 4.01 10c0-.129.007-.256.021-.382a6.001 6.001 0 01.301-1.591zM11.64 4.53a6.006 6.006 0 014.023 2.125 4.002 4.002 0 00-3.03 4.286 4.001 4.001 0 00-4.286 3.03 6.006 6.006 0 01-2.125-4.023A4.002 4.002 0 0010 6a4 4 0 00-1.47-2.864 6.006 6.006 0 013.11-1.598A3.99 3.99 0 0010 4c.39 0 .768.064 1.12.183a6.002 6.002 0 01.52.347z" clipRule="evenodd" />
    </svg>
);
const ShortsIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2-2H4a2 2 0 01-2-2V6z" />
        <path d="M10.75 8.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" />
    </svg>
);


const initialBlockItems: BlockItem[] = [
    { id: 'notifications', title: 'Block Notifications', description: 'Block system-wide alerts', icon: NotificationIcon, isBlocked: false },
    { id: 'yt_productive', title: 'YT Productive mode', description: 'Hides comments & recommendations', icon: YoutubeIcon, isBlocked: false },
    { id: 'websites', title: 'Block Websites', description: 'Set a timer to block distracting sites', icon: WebsiteIcon, isBlocked: false },
    { id: 'shorts', title: 'Block YouTube Shorts', description: 'Hides the Shorts feed', icon: ShortsIcon, isBlocked: false },
    { id: 'productive_mode', title: 'Advanced Filtering', description: 'Enable deep focus content filtering', icon: BrainIcon, isBlocked: false },
    { id: 'advanced_blocking', title: 'Advanced Blocking', description: 'Disables notifications & app store access', icon: ShieldIcon, isBlocked: false },
];

const BlockItemCard: React.FC<{ item: BlockItem; onToggle: () => void; disabled?: boolean }> = ({ item, onToggle, disabled = false }) => (
    <div className={`bg-white dark:bg-surface p-4 rounded-xl flex items-center justify-between border border-slate-200 dark:border-white/10 transition-opacity ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
        <div className="flex items-center gap-4">
            <div className="bg-slate-100 dark:bg-black/20 p-3 rounded-full">
                <item.icon className="w-6 h-6 text-slate-500 dark:text-on-surface-variant" />
            </div>
            <div>
                <p className="font-semibold text-slate-800 dark:text-on-surface">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-on-surface-variant">{item.description}</p>
            </div>
        </div>
        <ToggleSwitch isOn={item.isBlocked} onToggle={onToggle} disabled={disabled} />
    </div>
);

const BlockSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface mb-3">{title}</h2>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const BlocksPage: React.FC = () => {
    const [blockItems, setBlockItems] = useState(initialBlockItems);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClearConfirmModalOpen, setIsClearConfirmModalOpen] = useState(false);
    const [isInitiatingBlockAll, setIsInitiatingBlockAll] = useState(false);
    const { activeFocusSchedule, timeLeftInFocus } = useSchedule();
    const [customBlocklist, setCustomBlocklist] = useState<CategorizedSite[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('customBlocklist');
        return saved ? JSON.parse(saved) : [];
    });
    const [newSiteUrl, setNewSiteUrl] = useState('');
    const [newSiteCategory, setNewSiteCategory] = useState<SiteCategory>('destructive');
    const [customDuration, setCustomDuration] = useState('');

    useEffect(() => {
        localStorage.setItem('customBlocklist', JSON.stringify(customBlocklist));
    }, [customBlocklist]);

    const handleAddSite = () => {
        const trimmedUrl = newSiteUrl.trim().toLowerCase();
        if (trimmedUrl && !customBlocklist.some(site => site.url === trimmedUrl)) {
            if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
                setCustomBlocklist(prev => [...prev, { url: trimmedUrl, category: newSiteCategory }]);
                setNewSiteUrl('');
            } else {
                alert("Please enter a valid website domain (e.g., twitter.com)");
            }
        }
    };

    const handleRemoveSite = (siteToRemove: string) => {
        setCustomBlocklist(prev => prev.filter(site => site.url !== siteToRemove));
    };
    
    const handleClearBlocklist = () => {
        setCustomBlocklist([]);
        setIsClearConfirmModalOpen(false);
    };

    // Check for expired timers
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeFocusSchedule) return;
            const websiteBlock = blockItems.find(item => item.id === 'websites');
            if (websiteBlock?.isBlocked && websiteBlock.blockEndTime && websiteBlock.blockEndTime < Date.now()) {
                const wasBlockAll = blockItems.filter(i => i.id !== 'websites').every(i => i.isBlocked);
                if (wasBlockAll) {
                    setBlockItems(prev => prev.map(item => ({ ...item, isBlocked: false, blockEndTime: undefined })));
                } else {
                    setBlockItems(prev => prev.map(item => item.id === 'websites' ? { ...item, isBlocked: false, blockEndTime: undefined } : item));
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [blockItems, activeFocusSchedule]);

    
    const isScheduleActive = !!activeFocusSchedule;
    const areAllItemsManuallyBlocked = blockItems.every(item => item.isBlocked);
    const areAllBlocked = isScheduleActive || areAllItemsManuallyBlocked;

    const handleToggle = (id: string) => {
        setBlockItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, isBlocked: !item.isBlocked } : item
            )
        );
    };

    const handleSetWebsiteBlockDuration = (minutes: number) => {
        const endTime = Date.now() + minutes * 60 * 1000;
        if (isInitiatingBlockAll) {
             setBlockItems(prev => prev.map(item => ({
                ...item,
                isBlocked: true,
                blockEndTime: item.id === 'websites' ? endTime : undefined,
            })));
        } else {
            setBlockItems(prev => prev.map(item =>
                item.id === 'websites' ? { ...item, isBlocked: true, blockEndTime: endTime } : item
            ));
        }
        setIsModalOpen(false);
        setIsInitiatingBlockAll(false);
    };
    
    const handleStartCustomBlock = () => {
        const minutes = parseInt(customDuration, 10);
        if (isNaN(minutes) || minutes <= 0) {
            alert("Please enter a valid number of minutes.");
            return;
        }
        setIsInitiatingBlockAll(false);
        handleSetWebsiteBlockDuration(minutes);
        setCustomDuration('');
    };

    const handleCancelWebsiteBlock = () => {
        if (areAllItemsManuallyBlocked) {
             setBlockItems(prev => prev.map(item => ({ ...item, isBlocked: false, blockEndTime: undefined })));
        } else {
            setBlockItems(prev => prev.map(item => item.id === 'websites' ? { ...item, isBlocked: false, blockEndTime: undefined } : item));
        }
    };
    
     const handleBlockAllToggle = () => {
        if (areAllBlocked && !isScheduleActive) {
            setBlockItems(prev => prev.map(item => ({ ...item, isBlocked: false, blockEndTime: undefined })));
        } else if (!isScheduleActive) {
            setIsInitiatingBlockAll(true);
            setIsModalOpen(true);
        }
    };
    
    const getWebsiteBlockItem = (): BlockItem => {
        const originalItem = blockItems.find(i => i.id === 'websites')!;
        if (activeFocusSchedule) {
            return { ...originalItem, isBlocked: true, blockEndTime: Date.now() + timeLeftInFocus * 1000 };
        }
        return originalItem;
    };
    
    const getDisplayItem = (originalItem: BlockItem): BlockItem => {
        if (isScheduleActive) {
            return { ...originalItem, isBlocked: true };
        }
        return originalItem;
    };
    
    const ClearConfirmationModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
    }> = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;
        return (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <div 
                    className="bg-white dark:bg-base w-full max-w-sm rounded-xl p-6 text-center animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-on-surface mb-2">Clear Custom Blocklist?</h3>
                    <p className="text-slate-600 dark:text-on-surface-variant mb-6">Are you sure you want to remove all websites? This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-200 dark:bg-surface text-slate-800 dark:text-on-surface py-2.5 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const websiteBlockItem = getWebsiteBlockItem();
    const { hours, minutes, seconds, isCounting } = useCountdown(websiteBlockItem.blockEndTime);

    return (
        <div className="p-4">
            <Header title="Blocks">
                 <button
                    onClick={handleBlockAllToggle}
                    disabled={isScheduleActive}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        areAllBlocked
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30'
                            : 'bg-green-100 dark:bg-primary/20 text-green-700 dark:text-primary hover:bg-green-200 dark:hover:bg-primary/30'
                    }`}
                >
                    {areAllBlocked ? 'Unblock All' : 'Block All'}
                </button>
            </Header>
            <DurationSelectorModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setIsInitiatingBlockAll(false); }}
                onSetDuration={handleSetWebsiteBlockDuration}
            />
            <ClearConfirmationModal 
                isOpen={isClearConfirmModalOpen}
                onClose={() => setIsClearConfirmModalOpen(false)}
                onConfirm={handleClearBlocklist}
            />
            <div className="mt-6 space-y-8">
                 <BlockSection title="General">
                    <BlockItemCard item={getDisplayItem(blockItems.find(i => i.id === 'notifications')!)} onToggle={() => handleToggle('notifications')} disabled={areAllBlocked} />
                    <BlockItemCard item={getDisplayItem(blockItems.find(i => i.id === 'advanced_blocking')!)} onToggle={() => handleToggle('advanced_blocking')} disabled={areAllBlocked} />
                    <BlockItemCard item={getDisplayItem(blockItems.find(i => i.id === 'productive_mode')!)} onToggle={() => handleToggle('productive_mode')} disabled={areAllBlocked} />
                 </BlockSection>

                <BlockSection title="Website Blocking">
                    <div className={`bg-white dark:bg-surface p-4 rounded-xl border border-slate-200 dark:border-white/10 transition-opacity ${isScheduleActive ? 'opacity-70' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-black/20 p-3 rounded-full">
                                    <websiteBlockItem.icon className={`w-6 h-6 ${isCounting ? 'text-red-500' : 'text-slate-500 dark:text-on-surface-variant'}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-on-surface">{websiteBlockItem.title}</p>
                                    {isCounting ? (
                                        <p className="text-sm text-red-500 font-mono font-medium" style={{fontVariantNumeric: 'tabular-nums'}}>
                                            {isScheduleActive ? 'Schedule active:' : areAllItemsManuallyBlocked ? 'All blocked for:' : 'Blocked for:'} {hours}:{minutes}:{seconds}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-on-surface-variant">{websiteBlockItem.description}</p>
                                    )}
                                </div>
                            </div>
                            {isCounting && (
                                <button onClick={handleCancelWebsiteBlock} disabled={isScheduleActive} className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-200 dark:hover:bg-red-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Cancel
                                </button>
                            )}
                        </div>
                        { !isCounting && !isScheduleActive && (
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="number"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(e.target.value)}
                                    placeholder="Enter custom minutes..."
                                    min="1"
                                    className="flex-grow bg-slate-100 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-300 dark:border-transparent focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 disabled:cursor-not-allowed"
                                    disabled={areAllBlocked}
                                />
                                <button
                                    onClick={handleStartCustomBlock}
                                    disabled={areAllBlocked || !customDuration.trim() || parseInt(customDuration, 10) <= 0}
                                    className="bg-slate-800 text-white dark:bg-slate-200 dark:text-black font-semibold px-4 py-2 rounded-lg hover:bg-slate-600 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Start
                                </button>
                            </div>
                        )}
                    </div>
                     <div className="bg-white dark:bg-surface p-4 rounded-xl border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-slate-800 dark:text-on-surface">Custom Blocklist</h3>
                            {customBlocklist.length > 0 && (
                                <button
                                    onClick={() => setIsClearConfirmModalOpen(true)}
                                    disabled={areAllBlocked}
                                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-on-surface-variant mb-3">Add and categorize sites to block when 'Block Websites' is on or a schedule is running.</p>
                        <fieldset disabled={areAllBlocked} className="space-y-3 disabled:opacity-70">
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={newSiteUrl}
                                    onChange={(e) => setNewSiteUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
                                    placeholder="e.g., twitter.com"
                                    className="flex-grow bg-slate-100 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-300 dark:border-transparent focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 disabled:cursor-not-allowed"
                                />
                                <button
                                    onClick={handleAddSite}
                                    className="bg-slate-800 text-white dark:bg-slate-200 dark:text-black font-semibold px-4 py-2 rounded-lg hover:bg-slate-600 dark:hover:bg-white disabled:cursor-not-allowed"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-x-6 gap-y-2 flex-wrap text-sm text-slate-600 dark:text-on-surface-variant">
                                <label className="flex items-center gap-1.5">
                                    <input type="radio" name="category" value="destructive" checked={newSiteCategory === 'destructive'} onChange={() => setNewSiteCategory('destructive')} className="h-4 w-4 accent-red-500" /> Destructive
                                </label>
                                <label className="flex items-center gap-1.5">
                                    <input type="radio" name="category" value="productive" checked={newSiteCategory === 'productive'} onChange={() => setNewSiteCategory('productive')} className="h-4 w-4 accent-green-500" /> Productive
                                </label>
                                <label className="flex items-center gap-1.5">
                                    <input type="radio" name="category" value="neutral" checked={newSiteCategory === 'neutral'} onChange={() => setNewSiteCategory('neutral')} className="h-4 w-4 accent-slate-500" /> Neutral
                                </label>
                            </div>

                            {customBlocklist.length > 0 && (
                                <ul className="space-y-2 pt-2 max-h-32 overflow-y-auto">
                                    {customBlocklist.map(site => (
                                        <li key={site.url} className="flex justify-between items-center bg-slate-100 dark:bg-black/20 p-2 rounded">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                                    site.category === 'destructive' ? 'bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300' :
                                                    site.category === 'productive' ? 'bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-300' :
                                                    'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-300'
                                                }`}>
                                                    {site.category}
                                                </span>
                                                <span className="font-mono text-sm text-slate-700 dark:text-on-surface-variant truncate">{site.url}</span>
                                            </div>
                                            <button onClick={() => handleRemoveSite(site.url)} aria-label={`Remove ${site.url}`} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full flex-shrink-0">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </fieldset>
                    </div>
                </BlockSection>

                <BlockSection title="YouTube">
                     <BlockItemCard item={getDisplayItem(blockItems.find(i => i.id === 'yt_productive')!)} onToggle={() => handleToggle('yt_productive')} disabled={areAllBlocked} />
                     <BlockItemCard item={getDisplayItem(blockItems.find(i => i.id === 'shorts')!)} onToggle={() => handleToggle('shorts')} disabled={areAllBlocked} />
                </BlockSection>
            </div>
        </div>
    );
};

export default BlocksPage;