import type { AppointmentBase } from "../utils/ct-types";

export interface Announcement {
    id: number,
    type: 'custom' | 'appointment',
}

export interface AnnouncementCustom extends Announcement {
    type: 'custom',
    title: string,
    description: string,
}

export interface AnnouncementAppointment extends Announcement, AppointmentBase {
    type: 'appointment';
}

export interface AnnouncementSet {
    id: number,
    date: Date,
    title: string,
    eventId: number|null,
}
