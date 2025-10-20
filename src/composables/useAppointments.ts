import { churchtoolsClient } from '@churchtools/churchtools-client';
import { useQuery } from '@tanstack/vue-query';
import { addDays, format } from 'date-and-time';
import { computed } from 'vue';
import type { Category } from '../types/Category';
import type { AppointmentCalculatedWithIncludes } from '../utils/ct-types';
import useCalendars from './useCalendars';
import useCategory from './useCategory';

export default function useAppointments(category: Category) {
    const { settings, settingsLoaded } = useCategory(category);
    const { calendars, calendarIds, isLoading: isLoadingCalendars } = useCalendars();

    const { data, isLoading } = useQuery<AppointmentCalculatedWithIncludes[]>({
        queryKey: ['appointments', settings, calendarIds],
        queryFn: () => {
            const today = new Date(); // todo: utilize an announcement date as base (perhaps the entire composable needs this as an parameter)

            // fill calendar ids if all (-1) are selected
            const calIds =
                (settings.value.calendarIds[0] ?? -1) !== -1
                    ? settings.value.calendarIds
                    : calendarIds.value;

            return churchtoolsClient.get('/calendars/appointments', {
                from: format(today, 'YYYY-MM-DD'),
                to: format(addDays(today, settings.value.cutoffDays), 'YYYY-MM-DD'),
                calendar_ids: calIds,
            });
        },
        staleTime: 1000 * 60, // 1 minute
        enabled: computed(() => settingsLoaded.value && !isLoadingCalendars.value),
    });

    const appointments = computed(() =>
        (data.value ?? []).map(appointment =>
            Object.assign(appointment.appointment.base, appointment.appointment.calculated),
        ),
    );

    return {
        appointments,
        calendars,
        isLoading,
    };
}
