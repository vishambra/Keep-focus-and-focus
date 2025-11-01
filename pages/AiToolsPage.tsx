import React, { useState } from 'react';
import Header from '../components/Header';
import { AiTool } from '../types';
import { researchQuery, summarizeVideo, summarizeUrl } from '../services/geminiService';
import { SendIcon } from '../components/icons/FeatureIcons';

// Icons for tools
const SearchIcon: React.FC<{className?: string}> = ({className}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg> );
const SummarizeIcon: React.FC<{className?: string}> = ({className}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg> );
const ImageIcon: React.FC<{className?: string}> = ({className}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg> );
const VideoIcon: React.FC<{className?: string}> = ({className}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg> );
const LinkIcon: React.FC<{className?: string}> = ({className}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg> );
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg> );

const aiTools: AiTool[] = [
    { id: 'research', title: 'Research Assistant', description: 'E.g., "What are the latest findings on quantum computing?"', icon: SearchIcon },
    { id: 'summarizeVideo', title: 'Video Summarizer', description: 'E.g., summarize a 2-hour lecture in seconds.', icon: VideoIcon },
    { id: 'summarizeUrl', title: 'Article Summarizer', description: 'E.g., summarize a lengthy news article or blog.', icon: LinkIcon },
    { id: 'analyze', title: 'Image Analyzer', description: 'E.g., get a breakdown of a complex textbook chart.', icon: ImageIcon },
    { id: 'generate', title: 'Image Generator', description: 'E.g., "An astronaut studying on the moon, cinematic style."', icon: ImageIcon },
];

const AiToolCard: React.FC<{ tool: AiTool, onClick: () => void }> = ({ tool, onClick }) => (
  <button onClick={onClick} className="bg-white dark:bg-surface p-4 rounded-xl flex items-center gap-4 w-full text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/10">
    <div className="bg-slate-100 dark:bg-black/20 p-3 rounded-full">
      <tool.icon className="w-6 h-6 text-violet-600 dark:text-secondary" />
    </div>
    <div>
      <p className="font-semibold text-slate-800 dark:text-on-surface">{tool.title}</p>
      <p className="text-sm text-slate-500 dark:text-on-surface-variant">{tool.description}</p>
    </div>
  </button>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="sr-only">Loading...</span>
    </div>
);


const ResearchAssistantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ answer: string; sources: { title: string; uri: string }[] } | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await researchQuery(query);
            setResult(response);
        } catch (err) {
            setError('Failed to fetch results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-base w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-black/20 p-2 rounded-full">
                            <SearchIcon className="w-5 h-5 text-violet-600 dark:text-secondary" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface">Research Assistant</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div className="min-h-[200px] bg-slate-100 dark:bg-surface rounded-lg p-4">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-center text-red-500 py-10">{error}</p>}
                        {result ? (
                            <div className="space-y-4 animate-fade-in">
                                <p className="text-slate-800 dark:text-on-surface whitespace-pre-wrap leading-relaxed">{result.answer}</p>
                                <div>
                                    <h3 className="font-semibold text-slate-700 dark:text-on-surface-variant mb-2 border-t border-slate-200 dark:border-white/10 pt-3">Sources:</h3>
                                    <ul className="space-y-2">
                                        {result.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-700 dark:text-primary hover:underline transition-colors">
                                                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{source.title}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            !isLoading && !error && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-on-surface-variant">
                                    <SearchIcon className="w-12 h-12 mb-2"/>
                                    <p>Ask a question to get started.</p>
                                    <p className="text-xs mt-1">E.g., "What are the latest findings on quantum computing?"</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-grow bg-white dark:bg-surface px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={isLoading || !query.trim()}
                            className="bg-primary text-black font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-300 transition-all flex items-center gap-2"
                        >
                            <span className="hidden sm:inline">Ask</span>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoSummarizerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);

    const handleSummarize = async () => {
        if (!url.trim()) return;
        try {
            new URL(url);
        } catch (_) {
            setError("Please enter a valid URL.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSummary(null);
        try {
            const response = await summarizeVideo(url);
            setSummary(response);
        } catch (err) {
            setError('Failed to summarize video. Please check the URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-base w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-black/20 p-2 rounded-full">
                            <VideoIcon className="w-5 h-5 text-violet-600 dark:text-secondary" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface">Video Summarizer</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                     <div className="min-h-[200px] bg-slate-100 dark:bg-surface rounded-lg p-4">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-center text-red-500 py-10">{error}</p>}
                        {summary ? (
                             <div className="space-y-4 animate-fade-in">
                                 <h3 className="font-semibold text-slate-700 dark:text-on-surface-variant">Summary:</h3>
                                <p className="text-slate-800 dark:text-on-surface whitespace-pre-wrap leading-relaxed">{summary}</p>
                            </div>
                        ) : (
                             !isLoading && !error && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-on-surface-variant">
                                    <VideoIcon className="w-12 h-12 mb-2"/>
                                    <p>Paste a video URL to get a summary.</p>
                                    <p className="text-xs mt-1">E.g., A link to a long lecture or documentary.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter video URL..."
                            className="flex-grow bg-white dark:bg-surface px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSummarize()}
                        />
                        <button 
                            onClick={handleSummarize}
                            disabled={isLoading || !url.trim()}
                            className="bg-primary text-black font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-300 transition-all flex items-center gap-2"
                        >
                            <span className="hidden sm:inline">Summarize</span>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UrlSummarizerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);

    const handleSummarize = async () => {
        if (!url.trim()) return;
        try {
            new URL(url);
        } catch (_) {
            setError("Please enter a valid URL.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSummary(null);
        try {
            const response = await summarizeUrl(url);
            setSummary(response);
        } catch (err) {
            setError('Failed to summarize content. Please check the URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-base w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-black/20 p-2 rounded-full">
                            <LinkIcon className="w-5 h-5 text-violet-600 dark:text-secondary" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface">Article Summarizer</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1 rounded-full text-slate-500 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                     <div className="min-h-[200px] bg-slate-100 dark:bg-surface rounded-lg p-4">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-center text-red-500 py-10">{error}</p>}
                        {summary ? (
                             <div className="space-y-4 animate-fade-in">
                                 <h3 className="font-semibold text-slate-700 dark:text-on-surface-variant">Summary:</h3>
                                <p className="text-slate-800 dark:text-on-surface whitespace-pre-wrap leading-relaxed">{summary}</p>
                            </div>
                        ) : (
                             !isLoading && !error && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-on-surface-variant">
                                    <LinkIcon className="w-12 h-12 mb-2"/>
                                    <p>Paste an article or website URL to get a summary.</p>
                                    <p className="text-xs mt-1">E.g., A link to a news article or blog post.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter article or website URL..."
                            className="flex-grow bg-white dark:bg-surface px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-primary focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSummarize()}
                        />
                        <button 
                            onClick={handleSummarize}
                            disabled={isLoading || !url.trim()}
                            className="bg-primary text-black font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-300 transition-all flex items-center gap-2"
                        >
                            <span className="hidden sm:inline">Summarize</span>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AiToolsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeToolId, setActiveToolId] = useState<string | null>(null);

    const handleToolClick = (toolId: string) => {
        if (toolId === 'research' || toolId === 'summarizeVideo' || toolId === 'summarizeUrl') {
            setActiveToolId(toolId);
            setIsModalOpen(true);
        } else {
            alert(`Launching ${toolId} tool... (UI for this tool would appear here)`);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setActiveToolId(null);
    }

    return (
        <div className="p-4">
            <Header title="AI Tools" />
            <div className="mt-6">
                <p className="text-slate-600 dark:text-on-surface-variant mb-4">Leverage AI to boost your productivity and understanding.</p>
                <div className="space-y-3">
                    {aiTools.map(tool => (
                        <AiToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
                    ))}
                </div>
            </div>
             <div className="mt-8 p-4 bg-violet-100 dark:bg-secondary/10 border border-violet-200 dark:border-secondary/20 rounded-lg text-center">
                <h3 className="font-bold text-violet-700 dark:text-secondary">Gemini Pro Powered</h3>
                <p className="text-sm text-violet-600 dark:text-on-surface-variant mt-1">
                    Our tools use advanced models like Gemini 2.5 Pro for complex analysis and Flash for quick tasks, ensuring you get the best results.
                </p>
            </div>
            {isModalOpen && activeToolId === 'research' && <ResearchAssistantModal onClose={closeModal} />}
            {isModalOpen && activeToolId === 'summarizeVideo' && <VideoSummarizerModal onClose={closeModal} />}
            {isModalOpen && activeToolId === 'summarizeUrl' && <UrlSummarizerModal onClose={closeModal} />}
        </div>
    );
};

export default AiToolsPage;