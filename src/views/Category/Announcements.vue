<script setup lang="ts">
import { format } from 'date-and-time';
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useAnnouncements } from '../../composables/useAnnouncements';
import type { AnnouncementSet as AnnouncementSetType } from '../../types/Annoucement';
import type { Category } from '../../types/Category';
import AnnouncementSet from './AnnouncementSet.vue';
import AnnouncementSetsAdmin from './AnnouncementSetsAdmin.vue';

const props = defineProps<{ category: Category; categoryId: string | number }>();

const showAdmin = ref(false);

const { sets, setsLoaded } = useAnnouncements(props.category);

const hasSelected = ref(false);
const findClosestSet = () => {
    if (sets.value.length === 0) {
        return 0;
    }

    let key = 0;
    const now = new Date().getTime();
    for (; typeof sets.value[key] !== 'undefined' && sets.value[key].date.getTime() < now; key++);
    return key;
};
watch(sets, () => {
    if (!hasSelected.value) {
        selectedKey.value = findClosestSet();
    }
});
const selectedKey: Ref<number> = ref(findClosestSet());
const selectedSet: ComputedRef<AnnouncementSetType | null> = computed(
    () => sets.value[selectedKey.value] ?? null,
);
</script>

<template>
    <div v-if="setsLoaded">
        <div class="flex gap-2">
            <span>Ankündigungen für:</span>
            <select v-model="selectedKey" @change="hasSelected = true">
                <option
                    v-for="(set, key) in sets"
                    :key="set.id"
                    :disabled="sets.length === 0"
                    :value="key"
                >
                    {{ set.title }} {{ format(set.date, 'DD.MM.YYYY') }}
                </option>
            </select>
            <button @click="showAdmin = !showAdmin">Administrieren</button>
        </div>
        <AnnouncementSetsAdmin v-if="showAdmin" :category="props.category" />
        <AnnouncementSet
            v-if="selectedSet !== null"
            :key="selectedKey"
            :category="props.category"
            :set="selectedSet"
        />
    </div>
    <div v-else>Lade ...</div>
</template>
