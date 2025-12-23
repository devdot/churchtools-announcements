<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import { useQuery } from '@tanstack/vue-query';
import { addDays, addMonths, format } from 'date-and-time';
import { Button, ButtonGroup, Card, DatePicker, InputNumber, InputText } from 'primevue';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useCategory from '../../composables/useCategory';
import type { Category, CategoryDataAnnouncementSet } from '../../types/Category';
import type { Event } from '../../utils/ct-types';
import Loading from '../Utils/Loading.vue';

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
    initialData: [],
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
});
const events = computed(() =>
    eventsData.value
        // event.calendar is defined wrong in official types.d.ts
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
    return sets.value.filter(
        set => (prunableSets.value.find(prune => prune.id === set.id) ?? null) === null,
    );
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

const showAdd = ref(false);
const addSet: Ref<Omit<CategoryDataAnnouncementSet, 'id' | 'type'>> = ref({
    title: '',
    date: new Date(),
    eventId: null,
});
</script>
<template>
    <div class="max-w-content mx-auto space-y-5">
        <div class="flex justify-between">
            <h1 class="text-display-m">Ankündigungs-Termine</h1>
        </div>
        <Card v-if="setsLoaded">
            <template #content>
                <ButtonGroup>
                    <Button
                        :badge="generateableSets.length + ''"
                        :disabled="generateableSets.length === 0"
                        icon="fa-solid fa-square-plus"
                        label="Erzeugen"
                        outlined
                        @click="generate"
                    />
                    <Button
                        :badge="prunableSets.length + ''"
                        :disabled="prunableSets.length === 0"
                        icon="fa-solid fa-trash"
                        label="Löschen"
                        outlined
                        severity="danger"
                        @click="prune"
                    />
                    <Button
                        icon="fa-solid fa-plus"
                        label="Manuell"
                        outlined
                        severity="info"
                        @click="showAdd = true"
                    />
                </ButtonGroup>
                <div v-if="showAdd" class="space-y-2">
                    <DatePicker
                        v-model="addSet.date"
                        dateFormat="dd.mm.yy"
                        fluid
                        placeholder="Datum"
                        size="small"
                    />
                    <InputText v-model="addSet.title" fluid placeholder="Titel" size="small" />
                    <InputNumber
                        v-model="addSet.eventId"
                        fluid
                        :min="1"
                        placeholder="Event ID"
                        showClear
                        size="small"
                    />
                    <Button
                        :disabled="addSet.title === ''"
                        fluid
                        label="Hinzufügen"
                        @click="createSet(addSet)"
                    />
                </div>
            </template>
        </Card>
        <Card v-if="setsLoaded">
            <template #content>
                <div class="leading-6">
                    <div class="grid grid-cols-4 gap-1 border-b font-bold">
                        <div>Datum</div>
                        <div>Titel</div>
                        <div>Status</div>
                        <div>Event</div>
                    </div>
                    <div
                        v-for="set in totalSets"
                        :key="getDateString(set.date) + set.eventId"
                        class="grid grid-cols-4 gap-1 even:bg-gray-100 dark:even:bg-gray-800"
                    >
                        <div>{{ format(set.date, 'DD.MM.YYYY') }}</div>
                        <div>{{ set.title }}</div>
                        <div class="flex justify-between">
                            <span
                                :class="
                                    set.status === 'prune'
                                        ? 'text-red-500'
                                        : set.status === 'generate'
                                          ? 'text-green-500'
                                          : 'text-blue-500'
                                "
                                >{{
                                    set.status === 'prune'
                                        ? 'löschen'
                                        : set.status === 'generate'
                                          ? 'erzeugen'
                                          : 'existiert'
                                }}</span
                            >
                            <span class="cursor-pointer text-xs">
                                <i
                                    v-if="set.status !== 'generate'"
                                    class="fa-solid fa-trash hover:text-red-500"
                                    @click="deleteSet(set)"
                                ></i>
                                <i
                                    v-else
                                    class="fa-solid fa-plus hover:text-green-500"
                                    @click="createSet(set)"
                                ></i>
                            </span>
                        </div>
                        <div>
                            <a
                                v-if="set.eventId"
                                class="hover:underline"
                                :href="'?q=churchservice&id=' + set.eventId"
                                >Event #{{ set.eventId }}</a
                            >
                            <span v-else class="italic">ohne</span>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
        <Loading v-else />
    </div>
</template>
