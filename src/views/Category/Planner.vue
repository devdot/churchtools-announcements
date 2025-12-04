<script setup lang="ts">
import { ToggleSwitch } from 'primevue';
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

// todo: make this selected set dynamic
const selectedSet: ComputedRef<AnnouncementSet> = computed(() => sets.value[0]);

const { appointments: appointmentsRaw, isLoading: isLoadingAppointments } = useAppointments(
    props.category,
    selectedSet,
    // todo: let me fetch appointments until a later (custom) date
);

const filterAnnouncements = ref(true);
const appointments = computed(() =>
    appointmentsRaw.value.filter(
        appointment =>
            filterRule(rules.value, appointment) &&
            (!filterAnnouncements.value || (appointment.options?.announce.type ?? '') !== 'never'),
    ),
);
</script>
<template>
    <Loading v-if="!customsLoaded || !setsLoaded || !rulesLoaded || isLoadingAppointments" />
    <div v-else class="flex text-sm wrap-anywhere select-none">
        <div class="min-w-72 shrink-0 border-r">
            <div class="h-24 p-1">
                <div class="flex items-center gap-4">
                    <label>Verfügbare Ankündigungen filtern</label>
                    <ToggleSwitch v-model="filterAnnouncements" />
                </div>
            </div>
            <div class="h-6"></div>
            <div class="h-6 p-1 text-right">Summe</div>
            <div>
                <PlannerAnnouncement
                    v-for="custom in customs"
                    :key="custom.id"
                    :announcement="custom"
                    :category="props.category"
                    class="flex h-10 gap-1 p-1 odd:bg-white"
                />
                <PlannerAnnouncement
                    v-for="appointment in appointments"
                    :key="appointment.id + appointment.startDate"
                    :announcement="appointment"
                    :category="props.category"
                    class="flex h-10 gap-1 p-1 odd:bg-white"
                />
            </div>
        </div>
        <div class="grow overflow-x-auto">
            <div class="flex">
                <PlannerSet
                    v-for="set in sets"
                    :key="set.id"
                    :appointments="appointments"
                    :category="props.category"
                    :customs="customs"
                    :set="set"
                />
                <div class="flex-1 border-b"></div>
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
