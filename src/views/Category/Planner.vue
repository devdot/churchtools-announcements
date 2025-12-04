<script setup lang="ts">
import { Card, ToggleSwitch } from 'primevue';
import { computed, ref, type ComputedRef } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useAppointments from '../../composables/useAppointments';
import useCategory from '../../composables/useCategory';
import type { AnnouncementSet } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import { filterRule } from '../../types/Rule';
import Loading from '../Utils/Loading.vue';
import PlannerAnnouncement from './PlannerAnnouncement.vue';
import PlannerFields from './PlannerFields.vue';
import PlannerSet from './PlannerSet.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();

const { rules, rulesLoaded } = useCategory(props.category);
const { customs, customsLoaded, sets, setsLoaded } = useAnnouncements(props.category);

const setFirst: ComputedRef<AnnouncementSet> = computed(() => sets.value[0]);
const setLast: ComputedRef<AnnouncementSet> = computed(() => sets.value[sets.value.length - 1]);

const { appointments: appointmentsRaw, isLoading: isLoadingAppointments } = useAppointments(
    props.category,
    setFirst,
    setLast,
);

const showHidden = ref(false);
const appointments = computed(() =>
    appointmentsRaw.value.filter(
        appointment =>
            filterRule(rules.value, appointment) &&
            (showHidden.value || (appointment.options?.announce.type ?? '') !== 'never'),
    ),
);
</script>
<template>
    <Loading v-if="!customsLoaded || !setsLoaded || !rulesLoaded || isLoadingAppointments" />
    <div v-else>
        <div class="space-y-6">
            <h1 class="text-display-m">Planer</h1>
            <Card>
                <template #content>
                    <div class="-m-4 flex overflow-y-auto text-sm wrap-anywhere select-none">
                        <div class="min-w-72 shrink-0 border-r border-gray-400">
                            <div class="border-b border-gray-400">
                                <div class="h-24 p-1">
                                    <div class="flex items-center gap-4">
                                        <label>"Nie"-Ankündigungen anzeigen</label>
                                        <ToggleSwitch v-model="showHidden" />
                                    </div>
                                </div>
                                <div class="h-6"></div>
                                <div class="h-6 p-1 text-right">Summe</div>
                            </div>
                            <div>
                                <PlannerAnnouncement
                                    v-for="custom in customs"
                                    :key="custom.id"
                                    :announcement="custom"
                                    :category="props.category"
                                    class="flex h-10 gap-1 p-1 even:bg-gray-100"
                                />
                                <PlannerAnnouncement
                                    v-for="appointment in appointments"
                                    :key="appointment.id + appointment.startDate"
                                    :announcement="appointment"
                                    :category="props.category"
                                    class="flex h-10 gap-1 p-1 even:bg-gray-100"
                                />
                            </div>
                        </div>
                        <div class="grow overflow-x-auto bg-gray-100">
                            <div
                                class="sticky top-0 z-10 flex border-b border-gray-400 bg-gray-100"
                            >
                                <PlannerSet
                                    v-for="set in sets"
                                    :key="set.id"
                                    :appointments="appointments"
                                    :category="props.category"
                                    :customs="customs"
                                    :set="set"
                                />
                                <div class="flex-1"></div>
                            </div>
                            <div>
                                <PlannerFields
                                    v-for="custom in customs"
                                    :key="custom.id"
                                    :announcement="custom"
                                    :category="category"
                                    :sets="sets"
                                />
                                <PlannerFields
                                    v-for="appointment in appointments"
                                    :key="appointment.id + appointment.startDate"
                                    :announcement="appointment"
                                    :category="category"
                                    :sets="sets"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
