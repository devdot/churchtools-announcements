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
    const { calendars, isLoading: isLoadingCalendars } = useCalendars();

    // todo: it seems like caching is not working yet!
    const { data, isLoading } = useQuery<AppointmentCalculatedWithIncludes[]>({
        queryKey: ['appointments', computed(() => settings.value.id)],
        queryFn: () => {
            const today = new Date(); // todo: utilize an announcement date as base (perhaps the entire composable needs this as an parameter)

            // fill calendar ids if all (-1) are selected
            const calendarIds =
                (settings.value.calendarIds[0] ?? -1) !== -1
                    ? settings.value.calendarIds
                    : calendars.value.map(calendar => calendar.id);

            return churchtoolsClient.get('/calendars/appointments', {
                from: format(today, 'YYYY-MM-DD'),
                to: format(addDays(today, settings.value.cutoffDays), 'YYYY-MM-DD'),
                calendar_ids: calendarIds,
            });
        },
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
