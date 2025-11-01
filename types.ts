// FIX: Import React to resolve 'Cannot find namespace 'React'' error.
import React from 'react';

export type Page = 'Home' | 'Schedules' | 'AI Tools' | 'Blocks' | 'Insights';

export interface SuggestedSchedule {
  id: number;
  title: string;
  time: string;
  days: string;
  icon: React.FC<{ className?: string }>;
}

export type ScheduleType = 'focus' | 'sleep';

export interface Schedule {
  id: string;
  title: string;
  startTime: string; // "HH:MM" 24-hour format
  endTime: string;   // "HH:MM" 24-hour format
  days: number[];    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  type: ScheduleType;
}

export interface BlockItem {
    id: string;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    isBlocked: boolean;
    blockEndTime?: number; // Unix timestamp in ms for timed blocks
}

export type SiteCategory = 'productive' | 'destructive' | 'neutral';

export interface CategorizedSite {
    url: string;
    category: SiteCategory;
}

export interface AiTool {
    id: string;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
}

export interface FocusSound {
    id: string;
    name: string;
    url: string;
}

export interface FocusSessionRecord {
    id: string;
    duration: number; // in minutes
    completedAt: number; // unix timestamp in ms
}

export interface DailyGoal {
    type: 'sessions' | 'duration'; // duration in minutes
    target: number;
    progress: number;
    lastUpdated: string; // ISO date string (YYYY-MM-DD)
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
}