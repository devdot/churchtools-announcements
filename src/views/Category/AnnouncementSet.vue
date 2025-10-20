<script setup lang="ts">
import { format } from 'date-and-time';
import de from 'date-and-time/locales/de';
import { computed, ref } from 'vue';
import useAppointments from '../../composables/useAppointments';
import useCategory from '../../composables/useCategory';
import type { AnnouncementSet } from '../../types/Annoucement';
import type { Category } from '../../types/Category';
import { filterRule } from '../../types/Rule';
import type { AppointmentBase } from '../../utils/ct-types';

const props = defineProps<{
    category: Category;
    set: AnnouncementSet;
}>();

const { appointments, isLoading } = useAppointments(props.category, ref(props.set));
const { rules, rulesLoaded } = useCategory(props.category);

const isLoaded = computed(() => !isLoading.value && rulesLoaded);
const filtered = computed(() =>
    appointments.value.filter(appointment => filterRule(rules.value, appointment)),
);

const getDateString = function (appointment: AppointmentBase): string {
    if (appointment.allDay) {
        const start = format(new Date(appointment.startDate), 'DD. MMMM', { locale: de });
        const end = format(new Date(appointment.endDate), 'DD. MMMM', { locale: de });
        return start === end ? start : start + ' - ' + end;
    } else {
        return format(new Date(appointment.startDate), 'DD. MMMM HH:mm', { locale: de });
    }
};
</script>
<template>
    <div v-if="isLoaded" class="divide-y divide-gray-200">
        <div
            v-for="appointment in filtered"
            :key="appointment.id + appointment.startDate"
            class="py-2"
        >
            <div class="text-lg">
                <span>{{ appointment.title }}</span>
                <span v-if="appointment.subtitle?.length ?? 0 > 0">
                    ({{ appointment.subtitle }})
                </span>
            </div>
            <div class="pl-4">
                <div class="font-bold">{{ getDateString(appointment) }}</div>
                <div v-if="appointment.description?.length ?? 0 > 0">
                    {{ appointment.description }}
                </div>
            </div>
        </div>
    </div>
    <div v-else>Lade Ankündigungen ...</div>
</template>
