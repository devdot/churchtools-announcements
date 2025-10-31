<script setup lang="ts">
import { format } from 'date-and-time';
import { Button, Card, Dialog, InputGroup, Select } from 'primevue';
import { ref, watch, type Ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import { usePermissions } from '../../composables/usePermissions';
import type { AnnouncementSet as AnnouncementSetType } from '../../types/Announcement';
import type { Category } from '../../types/Category';
import Loading from '../Utils/Loading.vue';
import AnnouncementSet from './AnnouncementSet.vue';
import AnnouncementSetsAdmin from './AnnouncementSetsAdmin.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();

const showAdmin = ref(false);

const { sets, setsLoaded } = useAnnouncements(props.category);
const { can: canFn } = usePermissions();
const can = canFn(props.category);

const findClosestSet = () => {
    const now = new Date().getTime();
    return sets.value.find(set => set.date.getTime() > now) ?? null;
};
watch(sets, () => {
    if (selectedSet.value === null) {
        selectedSet.value = findClosestSet();
        console.log('searched for nearest', selectedSet.value?.id ?? null);
    }
});
const selectedSet: Ref<AnnouncementSetType | null> = ref(findClosestSet());

const select = function (int: -1 | 1) {
    const index = sets.value.findIndex(s => s.id === (selectedSet.value?.id ?? 0));
    const sel = sets.value[index + int] ?? null;
    if (sel) {
        selectedSet.value = sel;
    }
};

const makeName = (set: AnnouncementSetType | null) =>
    set !== null ? set.title + ' ' + format(set.date, 'DD.MM.YYYY') : '- keins -';
</script>

<template>
    <div v-if="setsLoaded" class="max-w-content mx-auto space-y-6">
        <Card>
            <template #content>
                <InputGroup>
                    <Button icon="fa-solid fa-chevron-left" severity="info" @click="select(-1)" />
                    <Select v-model="selectedSet" :loading="!setsLoaded" :options="sets">
                        <template #value="prop">
                            {{ makeName(prop.value) }}
                        </template>
                        <template #option="prop">
                            {{ makeName(prop.option) }}
                        </template>
                    </Select>
                    <Button
                        v-if="can.upsertData"
                        icon="fa-solid fa-gear"
                        label="Administrieren"
                        outlined
                        severity="info"
                        @click="showAdmin = true"
                    />
                    <Button icon="fa-solid fa-chevron-right" severity="info" @click="select(1)" />
                </InputGroup>
            </template>
        </Card>
        <Dialog
            v-if="can.upsertData"
            v-model:visible="showAdmin"
            class="w-1/2"
            header="Ankündigungen Administrieren"
            modal
        >
            <AnnouncementSetsAdmin :category="props.category" />
        </Dialog>
        <Card>
            <template #content>
                <h1 class="text-display-m">Ankündigungen: {{ makeName(selectedSet) }}</h1>
                <AnnouncementSet
                    v-if="selectedSet !== null"
                    :key="selectedSet.id"
                    :category="props.category"
                    :set="selectedSet"
                />
            </template>
        </Card>
    </div>
    <Loading v-else />
</template>
