import type { AppointmentBase, ZuluDate } from "../utils/ct-types";

export interface Announcement {
    id: number,
    type: 'custom' | 'appointment',
    options?: AnnouncementOptions,
}

export interface AnnouncementCustom extends Announcement {
    type: 'custom',
    title: string,
    description: string,
}

export interface AnnouncementAppointment extends Announcement, AppointmentBase {
    type: 'appointment';
}

export interface AnnouncementOptions {
    id: number,
    announce: {
        type: 'from' | 'until' | 'on' | 'never' | 'always';
        date: ZuluDate[],
    },
    notes: string,
    contactIds: number[], // person ids to contact for more information
    announceeIds: number[], // person ids that do the announcement, if any
    tags: string[],
}

export interface AnnouncementSet {
    id: number,
    date: Date,
    title: string,
    eventId: number|null,
}
