<script setup lang="ts">
import { Button, ButtonGroup, Card } from 'primevue';
import { computed, ref, type ComputedRef } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import useAppointments from '../../composables/useAppointments';
import useCategory from '../../composables/useCategory';
import type { AnnouncementSet, Announcement as AnnouncementType } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import { filterRule } from '../../types/Rule';
import Loading from '../Utils/Loading.vue';
import Announcement from './Announcement.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();

const showCustoms = ref(true);
const showAppointments = ref(false);

const { customs, customsLoaded, createCustom, sets, setsLoaded } = useAnnouncements(props.category);

const setFirst: ComputedRef<AnnouncementSet> = computed(() => sets.value[0]);
const setLast: ComputedRef<AnnouncementSet> = computed(() => sets.value[sets.value.length - 1]);

const { appointments, isLoading } = useAppointments(props.category, setFirst, setLast);
const { rules } = useCategory(props.category);
const filteredAppointments = computed(() =>
    appointments.value.filter(a => filterRule(rules.value, a)),
);

const announcements: ComputedRef<AnnouncementType[]> = computed(function () {
    const arr = [];
    if (showCustoms.value) arr.push(...customs.value);
    if (showAppointments.value) arr.push(...filteredAppointments.value);
    return arr;
});
</script>
<template>
    <div class="max-w-content mx-auto space-y-6">
        <h1 class="text-display-m">Ansagen</h1>
        <Card>
            <template #content>
                <Loading v-if="!customsLoaded || !setsLoaded || isLoading" />
                <div v-else class="divide-y divide-gray-200">
                    <ButtonGroup>
                        <Button
                            label="Manuelle Ansagen"
                            :outlined="!showCustoms"
                            severity="info"
                            size="small"
                            @click="showCustoms = !showCustoms"
                        />
                        <Button
                            label="Termine"
                            :outlined="!showAppointments"
                            severity="info"
                            size="small"
                            @click="showAppointments = !showAppointments"
                        />
                        <Button
                            v-if="showCustoms"
                            icon="fa-solid fa-plus"
                            label="Manuelle Ansage erstellen"
                            size="small"
                            @click="
                                createCustom({
                                    type: 'custom',
                                    title: 'Neue Ansage',
                                    description: '',
                                })
                            "
                        />
                    </ButtonGroup>
                    <Announcement
                        v-for="announcement in announcements"
                        :key="announcement.id + (announcement.startDate ?? '')"
                        :announcement="announcement"
                        :canEdit="true"
                        :category="props.category"
                        class="py-2"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>
