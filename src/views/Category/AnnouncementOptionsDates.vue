<script setup lang="ts">
import { dateToZulu } from '@churchtools/utils';
import { Button, DatePicker, SelectButton } from 'primevue';
import { computed, onBeforeMount, ref, type ComputedRef, type Ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { Announcement } from '../../types/Announcement';
import type { Category } from '../../types/Category';

const props = defineProps<{ category: Category; announcement: Announcement }>();

const { updateCustom, generateOptions, storeOptions } = useAnnouncements(props.category);

const announcement = ref(props.announcement);
const options = ref(announcement.value.options ?? generateOptions());

const saveOptions = function () {
    options.value.announce.date = announceDates.value.map(dateToZulu);
    if (announcement.value.type === 'appointment') {
        storeOptions({
            ...announcement.value,
            options: options.value,
        });
    } else if (announcement.value.type === 'custom') {
        updateCustom({
            ...announcement.value,
            options: options.value,
        });
    }
};

const announceDateMode: ComputedRef<'multi' | 'single' | 'none'> = computed(function () {
    return (
        {
            from: 'single',
            until: 'single',
            on: 'multi',
            never: 'none',
            always: 'none',
        }[options.value.announce.type] ?? 'multi'
    );
});
const announceDates: Ref<Date[]> = ref([]);
onBeforeMount(function () {
    options.value.announce.date.forEach(zulu => announceDates.value.push(new Date(zulu)));
});
const announceTypeChanged = function () {
    if (announceDateMode.value === 'single') {
        if (announceDates.value.length === 0 || typeof announceDates.value[0] === 'undefined') {
            while (announceDates.value.length > 0) {
                announceDates.value.pop();
            }
            announceDates.value[0] = new Date();
        } else if (announceDates.value.length > 1) {
            announceDates.value.splice(1, announceDates.value.length - 1);
        }
    } else if (announceDateMode.value === 'none') {
        announceDates.value.splice(0, announceDates.value.length);
    }
};

const { setsDateMin, setsDateMax, setsDatesDisabled } = useAnnouncements(props.category);
const date = computed(() =>
    typeof announcement.value.startDate === 'string'
        ? new Date(announcement.value.startDate)
        : null,
);
const maxDate = computed(() =>
    date.value === null
        ? setsDateMax.value
        : setsDateMax.value.getTime() < date.value?.getTime()
          ? setsDateMax.value
          : date.value,
);
</script>
<template>
    <div
        v-tooltip.top="
            'Mit diesen Einstellungen lässt sich festlegen, zu welchen Ankündigungs-Terminen diese Ansage angezeigt bzw. angesagt werden soll.'
        "
        class="space-y-2"
    >
        <SelectButton
            v-model="options.announce.type"
            fluid
            option-label="label"
            option-value="value"
            :options="[
                { value: 'from', label: 'Ab' },
                { value: 'until', label: 'Bis' },
                { value: 'on', label: 'Am' },
                { value: 'never', label: 'Nie' },
                { value: 'always', label: 'Immer' },
            ]"
            size="small"
            @change="announceTypeChanged"
        />
        <DatePicker
            v-if="announceDateMode === 'single'"
            v-model="announceDates[0]"
            :disabledDates="setsDatesDisabled"
            fluid
            inline
            :manualInput="false"
            :maxDate="maxDate"
            :minDate="setsDateMin"
            size="small"
        />
        <DatePicker
            v-if="announceDateMode === 'multi'"
            v-model="announceDates"
            :disabledDates="setsDatesDisabled"
            fluid
            inline
            :manualInput="false"
            :maxDate="maxDate"
            :minDate="setsDateMin"
            selectionMode="multiple"
            size="small"
        />
        <Button
            :disabled="announceDateMode !== 'none' && announceDates.length === 0"
            fluid
            label="Speichern"
            size="small"
            @click="saveOptions"
        />
    </div>
</template>
