import type { AnnouncementCustom, AnnouncementSet } from './Announcement';
import type { Rule } from './Rule';

export interface Category {
    id: number;
    name: string;
    readonly shorty: string;
    description: string;
}

export type CategoryCreate = Omit<Category, 'id' | 'shorty'>;

export interface CategoryData {
    id: number;
    type: string;
}

export interface CategorySettings {
    description: string;
    cutoffDays: number; // look-ahead number of days
    calendarIds: number[]; // input calendars
    interval: {
        type: 'week' | 'month' | 'never';
        day: number; // js Date.getDay, Sunday = 0
    };
    eventCalendarId: number | null;
    pruneDays: number; // prune data that is older than number of days
}

export interface CategoryDataSettings extends CategoryData, CategorySettings {
    type: 'settings';
}

export interface CategoryDataRules extends CategoryData, Rule {
    type: 'rules';
}

export interface CategoryDataAnnouncementCustom
    extends CategoryData,
        Omit<AnnouncementCustom, 'type'> {
    type: 'custom';
}

export interface CategoryDataAnnouncementSet extends CategoryData, AnnouncementSet {
    type: 'set';
}
