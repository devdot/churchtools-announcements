<script setup lang="ts">
import { reactive, ref } from 'vue';
import {
    filterFactory,
    ruleFilterTypeNames,
    type RuleFilterCreate,
    type RuleFilterType,
} from '../../../types/Rule';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilterCreate>>(), filterDefaults);
const filter = reactive(props.filter);
const options: RuleFilterType[] = ['and', 'or', 'calendar', 'text'];
const names = ref(ruleFilterTypeNames);

const createdRule = () => {
    if (filter.create !== null) {
        Object.assign(filter, filterFactory(filter.create));
        // remove the create property (not needed anymore but not removed by Object.assign)
        delete filter.create;
    }
};
</script>
<template>
    <div>
        <select v-model="filter.create" @change="createdRule">
            <option class="italic" :value="null">Filter wählen</option>
            <option v-for="option in options" :key="option" :value="option">
                {{ names[option] ?? option }}
            </option>
        </select>
    </div>
</template>
