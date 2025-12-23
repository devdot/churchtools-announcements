<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { GetSearchResponse, Person } from '@churchtools/utils';
import { AutoComplete, FloatLabel, InputGroup, MultiSelect } from 'primevue';
import { ref, type Ref } from 'vue';

const props = defineProps<{
    label: string;
}>();

const model = defineModel<number[]>({ default: [] });

const search = ref('');
const onSearch = function () {
    if (search.value === null) return;
    if (search.value.length >= 2 && search.value.charAt(0) == '#') {
        // searching id
        churchtoolsClient
            .get<Person[]>('/persons', {
                ids: [search.value.substring(1)],
            })
            .then(onSearchResults);
        return;
    }
    if (search.value.length < 3) return;
    // search persons
    churchtoolsClient
        .get<GetSearchResponse>('/search', {
            query: search.value,
            domain_types: ['person'],
        })
        .then(function (result) {
            onSearchResults(
                result.map(p => ({
                    ...p.domainAttributes,
                    id: parseInt(p.domainIdentifier),
                })),
            );
        });
};

const searchResults: Ref<Person[]> = ref([]);
const onSearchResults = function (results: Person[]) {
    // clear array
    searchResults.value.splice(0, searchResults.value.length);

    // move into results array
    results.map(person => searchResults.value.push(person));
};

const onSelect = function (e) {
    const selected = e.value?.id ?? null;
    search.value = '';

    if (selected === null) {
        return;
    }
    model.value.push(selected);
};
</script>
<template>
    <InputGroup>
        <FloatLabel variant="on">
            <MultiSelect v-model="model" display="chip" fluid :options="model" showClear>
                <template #dropdownicon>
                    <i class="fa-solid fa-user"></i>
                </template>
            </MultiSelect>
            <label>{{ props.label }}</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <AutoComplete
                v-model="search"
                :data-key="'id'"
                fluid
                :suggestions="searchResults"
                @complete="onSearch"
                @item-select="onSelect"
            >
                <template #option="slotProps">
                    <span>{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</span>
                    <span class="pl-2 text-xs"> #{{ slotProps.option.id }}</span>
                </template>
            </AutoComplete>
            <!-- <MultiSelect filter fluid> -->
            <!-- <template #dropdownicon>
                    <i class="fa-solid fa-user"></i>
                </template>
            </MultiSelect> -->
            <label>Hinzufügen</label>
        </FloatLabel>
    </InputGroup>
</template>
