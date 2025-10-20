import { format } from 'date-and-time';
import { computed, type ComputedRef } from 'vue';
import type { AnnouncementSet } from '../types/Annoucement';
import type { Category } from '../types/Category';
import useCategory from './useCategory';

export const useAnnouncements = function (category: Category) {
    const {
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

    return {
        sets,
        setsLoaded,
        getSetByDate,
        getDateString,
        createSet,
        updateSet,
        deleteSet,
    };
};
