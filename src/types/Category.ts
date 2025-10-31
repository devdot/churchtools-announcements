import type { AppointmentBase } from '../utils/ct-types';
import type { AnnouncementCustom, AnnouncementOptions, AnnouncementSet } from './Announcement';
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

export interface CategoryDataAnnouncementOptions extends CategoryData, AnnouncementOptions {
    type: 'a_options';
    a_id: number; // appointment-id
    a_date: AppointmentBase['startDate'];
}

export interface CategoryDataAnnouncementSet extends CategoryData, AnnouncementSet {
    type: 'set';
}
