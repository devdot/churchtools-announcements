<script setup lang="ts">
import { computed, reactive } from 'vue';
import useAppointments from '../../composables/useAppointments';
import type { Category } from '../../types/Category';
import { filterRule } from '../../types/Rule';
import Rule from '../Rule/Rule.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();
const category = props.category;

// todo: temporary rule for testing
const rule = reactive({
    negate: false,
    filter: {
        type: 'and',
        and: [
            {
                negate: true,
                filter: {
                    type: 'calendar',
                    calendarId: 1,
                },
            },
            {
                negate: true,
                filter: {
                    type: 'text',
                    field: 'title',
                    regex: false,
                    search: 'Gottesdienst',
                },
            },
        ],
    },
});

const { appointments, isLoading } = useAppointments(category);
const preview = computed(() =>
    appointments.value.filter(appointment => filterRule(rule, appointment)),
);

// todo: catch the change/updated rule
// when saving, make sure to remove all 'create' filter types
</script>

<template>
    <h1>Regeln</h1>
    <div class="grid w-full grid-cols-2 gap-8">
        <div>
            <Rule :rule="rule" />
            <button>Speichern</button>
            <!-- todo: den benutzer beim verlassen darauf hinweisen, dass noch nicht gespeichert ist -->
        </div>
        <div>
            <div>Vorschau:</div>
            <table>
                <thead>
                    <tr>
                        <th>Titel</th>
                        <th>Datum</th>
                    </tr>
                    <tr v-if="isLoading">
                        <td colspan="2">Lade Kalender ...</td>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="appointment in preview"
                        :key="appointment.id + appointment.startDate"
                    >
                        <td>{{ appointment.title }}</td>
                        <td>{{ appointment.startDate }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
