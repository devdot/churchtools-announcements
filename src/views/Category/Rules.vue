<script setup lang="ts">
import {
    computed,
    onBeforeUnmount,
    reactive,
    ref,
    toRaw,
    watch,
    type Reactive,
    type Ref,
    type WatchHandle,
} from 'vue';
import useAppointments from '../../composables/useAppointments';
import useCategory from '../../composables/useCategory';
import type { AnnouncementSet } from '../../types/Annoucement';
import type { Category, CategoryDataRules } from '../../types/Category';
import { copyRule, filterRule } from '../../types/Rule';
import Rule from '../Rule/Rule.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();
const category = props.category;

const { updateRules, rules: storageRules, rulesLoaded, rulesUpdatedAt } = useCategory(category);
const rules: Reactive<CategoryDataRules> = reactive(structuredClone(toRaw(storageRules.value)));
const updateKey: Ref<number> = ref(0);

watch(storageRules, () => {
    stopRulesWatch();
    // Object.assign(rules, toRaw(storageRules.value)); // this does not work well
    copyRule(rules, storageRules.value);
    updateKey.value++;
    startRulesWatch();
});

const save = function () {
    isChanged.value = false;
    isSaving.value = true;

    updateRules(toRaw(rules)).then(function () {
        isSaving.value = false;
        updateKey.value++;
    });
};

const isChanged = ref(false);
const isSaving = ref(false);
let handleRulesWatch: WatchHandle | null = null;
const stopRulesWatch = function () {
    if (handleRulesWatch !== null) {
        handleRulesWatch();
        handleRulesWatch = null;
    }
};
const startRulesWatch = function () {
    stopRulesWatch();

    handleRulesWatch = watch(
        rules,
        () => {
            isChanged.value = true;
        },
        { deep: true },
    );
};
startRulesWatch();

onBeforeUnmount(() => {
    if (isChanged.value && confirm('Änderungen vor dem Verlassen speichern?')) {
        save();
    }
});

const announcement: Ref<AnnouncementSet> = ref({
    id: 0,
    date: new Date(),
    title: 'Test',
    eventId: null,
});
const { appointments, isLoading } = useAppointments(category, announcement);
const preview = computed(() =>
    appointments.value.filter(appointment => filterRule(rules, appointment)),
);
</script>

<template>
    <h1>Regeln</h1>
    <div>storage: {{ storageRules.id }} editor: {{ rules.id }} key: {{ updateKey }}</div>
    {{ JSON.stringify(rules) }}
    <div class="text-gray-700 italic">Zuletzt geladen: {{ new Date(rulesUpdatedAt) }}</div>
    <div class="grid w-full grid-cols-2 gap-8">
        <div>
            <button
                class="cursor-pointer rounded-md bg-blue-400 p-2 disabled:bg-gray-400"
                :disabled="!(isChanged || rules.id === 0) && !isSaving"
                @click="save"
            >
                Speichern
            </button>
            <Rule v-if="rulesLoaded" :key="updateKey" :canEdit="!isSaving" :rule="rules" />
            <div v-else>Lade Regeln ...</div>
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
