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
    <div class="space-y-2">
        <div>
            <select v-model="filter.field" class="w-full border p-0.5" :disabled="!props.canEdit">
                <option v-for="(field, key) in fields" :key="field" :value="field">
                    {{ fieldNames[key] }}
                </option>
            </select>
        </div>
        <div class="flex gap-2">
            <input v-model="filter.search" class="flex-1 border p-0.5" :disabled="!props.canEdit" />
            <input
                v-model="filter.regex"
                v-tooltip="'Reguläre Ausdrücke (regex) verwenden'"
                :disabled="!props.canEdit"
                type="checkbox"
            />
        </div>
    </div>
</template>
