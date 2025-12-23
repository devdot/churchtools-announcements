<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { Person } from '@churchtools/utils';
import { useQuery } from '@tanstack/vue-query';
import { Chip } from 'primevue';
import { computed } from 'vue';

const props = defineProps<{
    ids: number[];
    label: string;
}>();

const { data, isLoading } = useQuery<Person[]>({
    queryKey: ['persons', 'ids', props.ids],
    queryFn: () => churchtoolsClient.get<Person[]>('/persons', { ids: props.ids }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
    initialDataUpdatedAt: 0,
});

const persons = computed(() =>
    isLoading.value
        ? props.ids.map(id => ({
              id: id,
              name: '#' + id,
              image: null,
          }))
        : data.value.map(person => ({
              id: person.id,
              name: person.firstName + ' ' + person.lastName,
              image: person.imageUrl,
          })),
);
</script>
<template>
    <div class="flex items-center gap-2">
        <div v-if="label != ''">{{ label }}</div>
        <a
            v-for="person in persons"
            :key="person.id"
            :href="'/?q=churchdb#PersonView/searchEntry:#' + person.id"
        >
            <Chip
                :image="person.image ?? '/system/assets/img/nobody-new.jpg'"
                :label="person.name"
            />
        </a>
    </div>
</template>
