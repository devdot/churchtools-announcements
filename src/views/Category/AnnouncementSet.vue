<script setup lang="ts">
import { ToggleSwitch } from 'primevue';
import { computed, ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useAppointments from '../../composables/useAppointments';
import useCategory from '../../composables/useCategory';
import { usePermissions } from '../../composables/usePermissions';
import type { AnnouncementSet } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import { filterRule } from '../../types/Rule';
import Loading from '../Utils/Loading.vue';
import Announcement from './Announcement.vue';

const props = defineProps<{
    category: Category;
    set: AnnouncementSet;
}>();

const { appointments, isLoading } = useAppointments(props.category, ref(props.set));
const { rules, rulesLoaded, announcementOptionsLoaded } = useCategory(props.category);
const { filterOptions, customs } = useAnnouncements(props.category);

const isLoaded = computed(() => !isLoading.value && rulesLoaded && announcementOptionsLoaded);
const filteredAppointments = computed(() =>
    appointments.value.filter(
        appointment =>
            filterRule(rules.value, appointment) &&
            (disableOptionsFilter.value || filterOptions(appointment, props.set)),
    ),
);
const filteredCustoms = computed(() =>
    disableOptionsFilter.value
        ? customs.value
        : customs.value.filter(custom => filterOptions(custom, props.set)),
);

const disableOptionsFilter = ref(false);

const { can: canFn } = usePermissions();
const can = canFn(props.category);
</script>
<template>
    <div v-if="isLoaded" class="divide-y divide-gray-200">
        <div class="flex gap-4">
            <div v-if="category.description !== ''" class="grow pt-2 pb-4">
                {{ category.description }}
            </div>
            <div>
                <ToggleSwitch v-model="disableOptionsFilter" title="versteckte anzeigen" />
            </div>
        </div>
        <Announcement
            v-for="custom in filteredCustoms"
            :key="custom.id"
            :announcement="custom"
            :canEdit="can.editData"
            :category="props.category"
            class="py-2"
        />
        <Announcement
            v-for="appointment in filteredAppointments"
            :key="appointment.id + appointment.startDate"
            :announcement="appointment"
            :canEdit="can.editData"
            :category="props.category"
            class="py-2"
        />
    </div>
    <Loading v-else />
</template>
