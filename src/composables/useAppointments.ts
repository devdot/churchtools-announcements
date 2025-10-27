import { churchtoolsClient } from '@churchtools/churchtools-client';
import { useQuery } from '@tanstack/vue-query';
import { addDays, format } from 'date-and-time';
import { computed, type ComputedRef, type Ref } from 'vue';
import type { AnnouncementAppointment, AnnouncementSet } from '../types/Announcement';
import type { Category } from '../types/Category';
import type { AppointmentCalculatedWithIncludes } from '../utils/ct-types';
import useCalendars from './useCalendars';
import useCategory from './useCategory';

export default function useAppointments(category: Category, announcementSet: Ref<AnnouncementSet>) {
    const { settings, settingsLoaded } = useCategory(category);
    const { calendars, calendarIds, isLoading: isLoadingCalendars } = useCalendars();

    const { data, isLoading } = useQuery<AppointmentCalculatedWithIncludes[]>({
        queryKey: ['appointments', calendarIds, settings, announcementSet],
        queryFn: () => {
            // fill calendar ids if all (-1) are selected
            const calIds =
                (settings.value.calendarIds[0] ?? -1) !== -1
                    ? settings.value.calendarIds
                    : calendarIds.value;

            return churchtoolsClient.get('/calendars/appointments', {
                from: format(announcementSet.value.date, 'YYYY-MM-DD'),
                to: format(
                    addDays(announcementSet.value.date, settings.value.cutoffDays),
                    'YYYY-MM-DD',
                ),
                calendar_ids: calIds,
            });
        },
        staleTime: 1000 * 60, // 1 minute
        enabled: computed(() => settingsLoaded.value && !isLoadingCalendars.value),
    });

    const appointments: ComputedRef<AnnouncementAppointment[]> = computed(() =>
        (data.value ?? []).map(appointment =>
            Object.assign(appointment.appointment.base, appointment.appointment.calculated, {
                type: 'appointment', // note: for some reason TS recognizes this as generic string and therefore fails to match types for the entire array
            }),
        ),
    );

    return {
        appointments,
        calendars,
        isLoading,
    };
}
