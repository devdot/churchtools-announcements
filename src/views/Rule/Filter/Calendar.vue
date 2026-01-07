<script setup lang="ts">
import { ref } from 'vue';
import useCalendars from '../../../composables/useCalendars';
import type { RuleFilterCalendar } from '../../../types/Rule';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilterCalendar>>(), filterDefaults);
const filter = ref(props.filter);
const { calendars } = useCalendars();
</script>
<template>
    <div>
        <select v-model="filter.calendarId" class="w-full border p-0.5" :disabled="!props.canEdit">
            <option class="italic" :value="-1">Alle</option>
            <option v-for="calendar in calendars" :key="calendar.id" :value="calendar.id">
                {{ calendar.name }}
            </option>
        </select>
    </div>
</template>
