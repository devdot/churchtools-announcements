<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import {
    filterFactory,
    ruleFilterTypeNames,
    type RuleFilterCreate,
    type RuleFilterType,
} from '../../../types/Rule';

const props = defineProps<{ filter: RuleFilterCreate }>();
const filter = reactive(props.filter);
const options: RuleFilterType[] = ['and', 'or', 'calendar', 'text'];
const names = ref(ruleFilterTypeNames);

watch(filter, value =>
    value.create !== null ? Object.assign(filter, filterFactory(value.create)) : null,
);
</script>
<template>
    <div>
        <select v-model="filter.create">
            <option class="italic" :value="null">Filter wählen</option>
            <option v-for="option in options" :key="option" :value="option">
                {{ names[option] ?? option }}
            </option>
        </select>
    </div>
</template>
