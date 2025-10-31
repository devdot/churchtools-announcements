import { addDays, format, isSameDay } from 'date-and-time';
import { computed, type ComputedRef } from 'vue';
import type {
    Announcement,
    AnnouncementAppointment,
    AnnouncementOptions,
    AnnouncementSet,
} from '../types/Announcement';
import type { Category, CategoryDataAnnouncementOptions } from '../types/Category';
import type { AppointmentBase } from '../utils/ct-types';
import useCategory from './useCategory';

export const useAnnouncements = function (category: Category) {
    const {
        announcementCustoms: customs,
        announcementCustomsLoaded: customsLoaded,
        createAnnouncementCustom: createCustom,
        updateAnnouncementCustom: updateCustom,
        deleteAnnouncementCustom: deleteCustom,
        announcementOptions: options,
        announcementOptionsLoaded: optionsLoaded,
        createAnnouncementOptions: createOptions,
        updateAnnouncementOptions: updateOptions,
        deleteAnnouncementOptions: deleteOptions,
        announcementSets: sets,
        announcementSetsLoaded: setsLoaded,
        createAnnouncementSet: createSet,
        updateAnnouncementSet: updateSet,
        deleteAnnouncementSet: deleteSet,
    } = useCategory(category);

    const getDateString = (date: Date) => format(date, 'YYYY-MM-DD', { timeZone: 'UTC' });

    const setsByDate: ComputedRef<Map<string, AnnouncementSet>> = computed(() => {
        const map = new Map<string, AnnouncementSet>();
        sets.value.forEach(set => map.set(getDateString(set.date), set));
        return map;
    });

    const getSetByDate = (date: Date) => setsByDate.value.get(getDateString(date)) ?? null;

    // options helpers
    const optionsMap = computed(function () {
        const map = new Map<string, CategoryDataAnnouncementOptions>();
        options.value.forEach(o => map.set(o.a_id + '_' + o.a_date, o));
        return map;
    });

    const defaultOptions: AnnouncementOptions = {
        id: 0,
        announce: {
            type: 'always',
            date: [],
        },
        notes: '',
        contactIds: [],
        announceeIds: [],
        tags: [],
    };
    const defaultOptionsJson = JSON.stringify(defaultOptions);

    const findOptions = function (
        appointment: AppointmentBase,
    ): CategoryDataAnnouncementOptions | null {
        return optionsMap.value.get(appointment.id + '_' + appointment.startDate) ?? null;
    };

    const generateOptions = (options: Partial<AnnouncementOptions> = {}) =>
        structuredClone({
            ...defaultOptions,
            ...options,
        });

    const storeOptions = function (appointment: AnnouncementAppointment) {
        if (typeof appointment.options === 'undefined') {
            const options = findOptions(appointment);
            if (options) {
                return deleteOptions(options);
            }
            return Promise.resolve(true);
        }

        // check if the options are the same as default options and if so, delete record
        if (JSON.stringify(appointment.options) === defaultOptionsJson) {
            return deleteOptions(appointment.options);
        }

        const write = {
            ...appointment.options,
            a_id: appointment.id,
            a_date: appointment.startDate,
        };

        return appointment.options.id > 0 ? updateOptions(write) : createOptions(write);
    };

    const filterOptions = function (announcement: Announcement, set: AnnouncementSet): boolean {
        const date = announcement.options?.announce.date ?? [];
        const dates = date.map(d => new Date(d));
        switch (announcement.options?.announce.type ?? '') {
            case 'on':
                return (dates.find(d => isSameDay(d, set.date)) ?? null) !== null;
            case 'from':
                return set.date.getTime() >= (dates[0] ?? new Date()).getTime();
            case 'until':
                return set.date.getTime() <= (dates[0] ?? new Date()).getTime() + 86400000; // end of day
            case 'never':
                return false;
            case 'always':
            default:
                return true;
        }
    };

    const setsDates = computed(() =>
        sets.value.map(set => set.date).sort((a, b) => a.getTime() - b.getTime()),
    );
    const setsDateMin = computed(() => setsDates.value[0] ?? new Date());
    const setsDateMax = computed(() => setsDates.value[setsDates.value.length - 1] ?? new Date());
    const setsDatesDisabled = computed(function () {
        const dates = [];
        let key = 0;
        const max = setsDateMax.value.getTime();
        for (let date = setsDateMin.value; date.getTime() <= max; date = addDays(date, 1)) {
            if (isSameDay(setsDates.value[key], date)) {
                key++;
            } else {
                dates.push(date);
            }
        }
        return dates;
    });

    return {
        filterOptions,
        customs,
        customsLoaded,
        createCustom,
        updateCustom,
        deleteCustom,
        options,
        optionsLoaded,
        findOptions,
        generateOptions,
        storeOptions,
        createOptions,
        updateOptions,
        deleteOptions,
        sets,
        setsLoaded,
        getSetByDate,
        getDateString,
        createSet,
        updateSet,
        deleteSet,
        setsDates,
        setsDateMin,
        setsDateMax,
        setsDatesDisabled,
    };
};
