<script setup lang="ts">
import { computed, ref } from 'vue';
import type { RuleFilterAnd, Rule as RuleType } from '../../../types/Rule';
import Rule from '../Rule.vue';
import RuleAdd from '../RuleAdd.vue';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilterAnd>>(), filterDefaults);
const filter = ref(props.filter);

const isEmpty = computed(() => filter.value.and.length === 0);

const createdRule = function (rule: RuleType) {
    filter.value.and.push(rule);
};
const deletedRule = function (key: number) {
    if (filter.value.and[key]) {
        filter.value.and.splice(key, 1);
        // todo: this is messing with vue in a bad way
    }
};
</script>
<template>
    <div class="w-full">
        <div v-for="(rule, key) in filter.and" :key="key">
            <Rule
                :canEdit="props.canEdit"
                :level="props.level + 1"
                :rule="rule"
                @deletedRule="deletedRule(key)"
            />
            <div v-if="key < filter.and.length - 1">
                <div class="ml-4 h-2 w-0.5 bg-gray-500"></div>
                <div class="w-8 bg-gray-500 text-center text-xs text-white">UND</div>
                <div class="ml-4 h-2 w-0.5 bg-gray-500"></div>
            </div>
        </div>
        <div v-if="props.canEdit">
            <div v-if="!isEmpty" class="ml-4 h-2 w-0.5 bg-gray-500"></div>
            <RuleAdd @createdRule="createdRule" />
        </div>
    </div>
</template>
