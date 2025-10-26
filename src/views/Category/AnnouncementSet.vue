<script setup lang="ts">
import { computed, ref } from 'vue';
import useAppointments from '../../composables/useAppointments';
import useCategory from '../../composables/useCategory';
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
const { rules, rulesLoaded, announcementCustoms } = useCategory(props.category);

const isLoaded = computed(() => !isLoading.value && rulesLoaded);
const filtered = computed(() =>
    appointments.value.filter(appointment => filterRule(rules.value, appointment)),
);
</script>
<template>
    <div v-if="isLoaded" class="divide-y divide-gray-200">
        <Announcement
            v-for="custom in announcementCustoms"
            :key="custom.id"
            :announcement="custom"
            :canEdit="false"
            :category="props.category"
            class="py-2"
        />
        <Announcement
            v-for="appointment in filtered"
            :key="appointment.id + appointment.startDate"
            :announcement="appointment"
            :canEdit="false"
            :category="props.category"
            class="py-2"
        />
    </div>
    <Loading v-else />
</template>
