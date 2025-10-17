<script setup lang="ts">
import { ref } from 'vue';
import type { RuleFilterText, RuleFilterTextFields } from '../../../types/Rule';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilterText>>(), filterDefaults);
const filter = ref(props.filter);
const fields: RuleFilterTextFields[] = ['title', 'subtitle', 'description'];
const fieldNames = ['Titel', 'Untertitel', 'Beschreibung'];
</script>
<template>
    <div>
        <div>
            <select v-model="filter.field" :disabled="!props.canEdit">
                <option v-for="(field, key) in fields" v-bind:key="field" :value="field">
                    {{ fieldNames[key] }}
                </option>
            </select>
        </div>
        <div class="flex">
            <input v-model="filter.search" class="border" :disabled="!props.canEdit" />
            <input v-model="filter.regex" :disabled="!props.canEdit" type="checkbox" />
            <label>regex</label>
        </div>
    </div>
</template>
