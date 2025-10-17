import { churchtoolsClient } from '@churchtools/churchtools-client';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Calendar } from '../utils/ct-types';

export default function useCalendars() {
    // todo: it seems like caching is not working yet!
    const { data, isLoading } = useQuery<Calendar[]>({
        queryKey: ['calendars'],
        queryFn: () => churchtoolsClient.get('/calendars'),
    });
    const calendars = computed(() => data.value ?? []);

    return {
        calendars,
        isLoading,
    };
}
