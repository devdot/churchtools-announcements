<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import { useQuery } from '@tanstack/vue-query';
import { addDays, addMonths } from 'date-and-time';
import { computed, type ComputedRef } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useCategory from '../../composables/useCategory';
import type { Category, CategoryDataAnnouncementSet } from '../../types/Category';
import type { Event } from '../../utils/ct-types';

const props = defineProps<{
    category: Category;
}>();

const { settings } = useCategory(props.category);
const { sets, setsLoaded, getSetByDate, getDateString, createSet, deleteSet } = useAnnouncements(
    props.category,
);

const setsIntervalDates: ComputedRef<Date[]> = computed(function () {
    const dates: Date[] = [];

    const type = settings.value.interval.type;
    const day = settings.value.interval.day;

    const start = addDays(new Date(), -settings.value.pruneDays);
    start.setUTCMilliseconds(0);
    start.setUTCSeconds(0);
    start.setUTCMinutes(0);
    start.setUTCHours(0);
    const cutoff = addDays(new Date(), settings.value.cutoffDays).getTime();

    if (type === 'week') {
        const first = addDays(start, day - start.getDay() - 7);
        for (let date: Date = first; date.getTime() < cutoff; date = addDays(date, 7)) {
            dates.push(date);
        }
    } else if (type === 'month') {
        const first = addMonths(start, -1);
        first.setDate(day);
        for (let date: Date = first; date.getTime() < cutoff; date = addMonths(date, 1)) {
            dates.push(date);
        }
    }

    // make sure the first date is not smaller than prune
    const pruneTime = start.getTime();
    while ((dates[0]?.getTime() ?? pruneTime) < pruneTime) {
        dates.splice(0, 1);
    }

    return dates;
});

const { data: eventsData } = useQuery<Event[]>({
    queryKey: ['events', props.category.id, settings],
    queryFn: function () {
        return churchtoolsClient.get('/events', {
            canceled: false,
            from: getDateString(addDays(new Date(), -settings.value.pruneDays)),
            to: getDateString(addDays(new Date(), settings.value.cutoffDays)),
        });
    },
    placeholderData: [],
    staleTime: 1000 * 60 * 10, // 10 minutes
});
const events = computed(() =>
    eventsData.value
        .filter(
            event =>
                event.calendar?.id ??
                Number.parseInt(event.calendar?.domainIdentifier ?? 0) ===
                    settings.value.eventCalendarId,
        )
        .filter(event => typeof event.startDate === 'string'),
);

const expectedSets = computed(function () {
    const sets: Omit<CategoryDataAnnouncementSet, 'id'>[] = setsIntervalDates.value
        .map(date => ({
            date: date,
            title: props.category.name,
            eventId: null,
        }))
        .concat(
            events.value.map(event => ({
                date: new Date(event.startDate),
                title: event.name ?? props.category.name,
                eventId: event.id ?? null,
            })),
        );
    return sets;
});

const generateableSets = computed(function () {
    return expectedSets.value.filter(set => getSetByDate(set.date) === null);
});

const existingSets = computed(function () {
    return expectedSets.value.filter(set => getSetByDate(set.date) !== null);
});

const prunableSets = computed(function () {
    let dates = setsIntervalDates.value;
    dates = dates.concat(events.value.map(event => new Date(event.startDate)));

    const dateStrings = dates.map(getDateString);
    return sets.value.filter(set => !dateStrings.includes(getDateString(set.date)));
});

const totalSets = computed(function () {
    return generateableSets.value
        .map(set => ({ ...set, status: 'generate' }))
        .concat(prunableSets.value.map(set => ({ ...set, status: 'prune' })))
        .concat(existingSets.value.map(set => ({ ...set, status: 'existing' })))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
});

const generate = async function () {
    return Promise.all(generateableSets.value.map(createSet));
};

const prune = async function () {
    // delete them all
    return Promise.all(prunableSets.value.map(deleteSet));
};
</script>
<template>
    <div v-if="setsLoaded" class="border">
        <div class="flex gap-2">
            <button @click="generate">Generieren</button>
            <button @click="prune">Alte Löschen</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Titel</th>
                    <th>Status</th>
                    <th>Event</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="set in totalSets" :key="getDateString(set.date) + set.eventId">
                    <td>{{ getDateString(set.date) }}</td>
                    <td>{{ set.title }}</td>
                    <td>{{ set.status }}</td>
                    <td>
                        <a v-if="set.eventId" :href="'?q=churchservice&id=' + set.eventId">Event</a>
                        <span v-else class="italic">ohne</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else>Lade ...</div>
</template>
