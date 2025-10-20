import { churchtoolsClient } from '@churchtools/churchtools-client';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Calendar } from '../utils/ct-types';

export default function useCalendars() {
    const { data, isLoading } = useQuery<Calendar[]>({
        queryKey: ['calendars'],
        queryFn: () => churchtoolsClient.get('/calendars'),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
    const calendars = computed(() => data.value ?? []);
    const calendarIds = computed(() => calendars.value.map(calendar => calendar.id));

    return {
        calendars,
        calendarIds,
        isLoading,
    };
}
