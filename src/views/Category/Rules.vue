<script setup lang="ts">
import { formatDate } from '@churchtools/utils';
import { Button, Card } from 'primevue';
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
import type { AnnouncementSet } from '../../types/Announcement';
import type { Category, CategoryDataRules } from '../../types/Category';
import { copyRule, filterRule } from '../../types/Rule';
import Rule from '../Rule/Rule.vue';
import Loading from '../Utils/Loading.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();
const category = props.category;

const { updateRules, rules: storageRules, rulesLoaded } = useCategory(category);
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

const update = function () {};
</script>

<template>
    <div class="grid w-full grid-cols-2 gap-8">
        <div class="space-y-6">
            <h1 class="text-display-m">Kalender-Filter</h1>
            <Button
                :disabled="!(isChanged || rules.id === 0) && !isSaving"
                fluid
                label="Speichern"
                size="small"
                @click="save"
            />
            <Rule v-if="rulesLoaded" :key="updateKey" :canEdit="!isSaving" :rule="rules" />
            <Loading v-else />
        </div>
        <div class="space-y-6">
            <h1 class="text-display-m mb-6">Vorschau</h1>
            <Button fluid label="Aktualisieren" severity="info" size="small" @click="update" />
            <Card>
                <template #content>
                    <table class="w-full">
                        <thead>
                            <tr class="border-b">
                                <td class="font-bold">Titel</td>
                                <td class="font-bold">Datum</td>
                            </tr>
                            <tr v-if="isLoading">
                                <td colspan="2"><Loading /></td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="appointment in preview"
                                :key="appointment.id + appointment.startDate"
                            >
                                <td class="pr-2">{{ appointment.title }}</td>
                                <td>{{ formatDate(new Date(appointment.startDate), true) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </template>
            </Card>
        </div>
    </div>
</template>
