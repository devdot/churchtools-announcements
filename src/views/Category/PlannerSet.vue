<script setup lang="ts">
import { formatDate } from '@churchtools/utils';
import { format } from 'date-and-time';
import { computed } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type {
    AnnouncementAppointment,
    AnnouncementCustom,
    AnnouncementSet,
} from '../../types/Announcement';
import type { Category } from '../../types/Category';

const props = defineProps<{
    category: Category;
    set: AnnouncementSet;
    customs: AnnouncementCustom[];
    appointments: AnnouncementAppointment[];
}>();

const { filterOptions } = useAnnouncements(props.category);

const setTimestamp = computed(() => props.set.date.getTime() + 3600 * 24 * 1000);
const sum = computed(
    () =>
        props.appointments.filter(
            appointment =>
                filterOptions(appointment, props.set) &&
                setTimestamp.value < new Date(appointment.startDate).getTime(),
        ).length + props.customs.filter(custom => filterOptions(custom, props.set)).length,
);
</script>
<template>
    <div class="h-full w-10">
        <div class="h-24 w-10 p-0.5" :style="{ writingMode: 'vertical-lr' }" :title="set.title">
            {{ set.title }}
        </div>
        <div class="h-6 text-center" :title="formatDate(set.date)">
            {{ format(set.date, 'DD.MM.') }}
        </div>
        <div class="h-6 p-1 text-center font-bold">
            {{ sum }}
        </div>
    </div>
</template>
