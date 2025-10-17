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
    // add interval (weekly / monthly / ...) or association with events (in calendar ?!)
}

export interface CategoryDataSettings extends CategoryData, CategorySettings {
    type: 'settings';
}

export interface CategoryDataRule extends CategoryData, Rule {
    type: 'rule';
}
