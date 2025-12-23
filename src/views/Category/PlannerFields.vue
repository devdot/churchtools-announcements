<script setup lang="ts">
import { dateToZulu } from '@churchtools/utils';
import { Checkbox } from 'primevue';
import { computed, ref, toRaw } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useCategory from '../../composables/useCategory';
import type { Announcement, AnnouncementOptions, AnnouncementSet } from '../../types/Announcement';
import type { Category } from '../../types/Category';

const props = defineProps<{
    category: Category;
    sets: AnnouncementSet[];
    announcement: Announcement;
}>();

const { settings } = useCategory(props.category);

const { filterOptions, updateCustom, generateOptions, storeOptions, setsDateMax } =
    useAnnouncements(props.category);

const announcementTimestamp = computed(() =>
    new Date(props.announcement?.startDate ?? setsDateMax.value).getTime(),
);

const toZuluMidnight = function (date: Date) {
    const ret = new Date(date);
    ret.setHours(0, 0, 0, 0);
    return dateToZulu(ret);
};

const filterSetTime = function (set: AnnouncementSet) {
    const time = set.date.getTime();
    return (
        props.announcement.type === 'custom' ||
        (time <= announcementTimestamp.value &&
            time + settings.value.cutoffDays * 3600 * 24 * 1000 >= announcementTimestamp.value)
    );
};

const filterSet = function (set: AnnouncementSet) {
    return filterSetTime(set) && filterOptions(props.announcement, set);
};

const filteredSets = computed(() => props.sets.filter(filterSet));
const datesFiltered = computed(() => filteredSets.value.map(set => toZuluMidnight(set.date)));
const datesAvailable = computed(() =>
    props.sets
        .filter(set => set.date.getTime() <= announcementTimestamp.value)
        .map(set => toZuluMidnight(set.date)),
);

const expandOptionsAnnounce = function (options: AnnouncementOptions): AnnouncementOptions {
    const ret = generateOptions(options);

    if (options.announce.type !== 'on') {
        ret.announce.type = 'on';
        ret.announce.date = [];
        ret.announce.date.push(...datesFiltered.value);
    }

    return ret;
};

const mergeOptionsAnnounce = function (options: AnnouncementOptions): AnnouncementOptions {
    const ret = generateOptions(options);
    const length = options.announce.date.length;

    if (length === 0) {
        ret.announce.type = 'never';
        return ret;
    }

    if (length === datesAvailable.value.length) {
        ret.announce.type = 'always';
        ret.announce.date = [];
        return ret;
    }

    // check for consecutive
    const first = datesAvailable.value.findIndex(val => val === options.announce.date[0]);
    let key = first;
    for (let i = 1; i < length; i++) {
        key++;
        if (options.announce.date[i] !== (datesAvailable.value[key] ?? '')) {
            console.log('not consec');
            return ret;
        }
    }

    if (first === 0) {
        ret.announce.type = 'until';
        ret.announce.date = [options.announce.date[length - 1]];
    } else if (length === datesAvailable.value.length - first) {
        ret.announce.type = 'from';
        ret.announce.date = [options.announce.date[0]];
    }

    return ret;
};

const isSaving = ref(false);

const changed = function (checked: boolean, set: AnnouncementSet) {
    let options = toRaw(props.announcement.options ?? generateOptions());

    // transform date
    const date = new Date(set.date);
    date.setHours(0, 0, 0, 0);
    const setDate = dateToZulu(date);

    // expand the announce options
    options = expandOptionsAnnounce(options);

    // remove the current date first
    options.announce.date = options.announce.date.filter(date => date !== setDate);
    if (checked) {
        // add to dates
        options.announce.date.push(setDate);
        options.announce.date.sort();
    }

    options = mergeOptionsAnnounce(options);

    // store according to type
    isSaving.value = true;
    if (props.announcement.type === 'appointment') {
        storeOptions({
            ...props.announcement,
            options: options,
        }).then(() => (isSaving.value = false));
    } else if (props.announcement.type === 'custom') {
        updateCustom({
            ...props.announcement,
            options: options,
        }).then(() => (isSaving.value = false));
    }

    return;
};
</script>
<template>
    <div class="flex h-10">
        <div
            v-for="set in sets"
            :key="set.id"
            class="w-10 p-2 odd:bg-gray-300/50 dark:odd:bg-gray-700/50"
        >
            <Checkbox
                binary
                :disabled="isSaving || !filterSetTime(set)"
                :model-value="filterSet(set)"
                @change="event => changed(event.target?.checked ?? false, set)"
            />
        </div>
        <div class="grow"></div>
    </div>
</template>
