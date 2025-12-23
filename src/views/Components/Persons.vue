<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { Person as PersonType } from '@churchtools/utils';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import Person from './Person.vue';

const props = defineProps<{
    ids: number[];
    label: string;
}>();

const ids = computed(() => (props.ids.length === 0 ? [0] : props.ids));

const { data, isLoading } = useQuery<PersonType[]>({
    queryKey: ['persons', 'ids', ids],
    queryFn: () => churchtoolsClient.get<PersonType[]>('/persons', { ids: ids.value }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: [],
    initialDataUpdatedAt: 0,
});

const persons = computed(() =>
    isLoading.value
        ? props.ids.map(id => ({
              id: id,
              title: '#' + id,
              imageUrl: '/system/assets/img/nobody-new.jpg',
              frontendUrl: '/?q=churchdb#PersonView/searchEntry:#' + person.id,
          }))
        : data.value.map(person => ({
              imageUrl: '/system/assets/img/nobody-new.jpg',
              frontendUrl: '/?q=churchdb#PersonView/searchEntry:#' + person.id,
              ...person,
              title: person.firstName + ' ' + person.lastName,
          })),
);
</script>
<template>
    <div class="flex items-center gap-2">
        <div v-if="label != ''">{{ label }}</div>
        <Person v-for="person in persons" :key="person.id" :person="person" />
    </div>
</template>
