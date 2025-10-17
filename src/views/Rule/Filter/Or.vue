<script setup lang="ts">
import { computed, ref } from 'vue';
import type { RuleFilterOr, Rule as RuleType } from '../../../types/Rule';
import Rule from '../Rule.vue';
import RuleAdd from '../RuleAdd.vue';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilterOr>>(), filterDefaults);
const filter = ref(props.filter);

const isEmpty = computed(() => filter.value.or.length === 0);
const lastKey = computed(() => filter.value.or.length - 1);

const createdRule = function (rule: RuleType) {
    filter.value.or.push(rule);
};
const deletedRule = function (key: number) {
    if (filter.value.or[key]) {
        filter.value.or.splice(key, 1);
        // todo: this is messing with vue in a bad way
    }
};
</script>
<template>
    <div class="grid w-full grid-flow-col grid-rows-1 overflow-x-auto">
        <div
            v-for="(rule, key) in filter.or"
            :key="key"
            :class="['relative min-w-72', key !== lastKey ? 'pr-12' : '']"
        >
            <Rule
                :canEdit="props.canEdit"
                :level="props.level + 1"
                :rule="rule"
                @deletedRule="deletedRule(key)"
            />
            <div v-if="key !== lastKey" class="absolute top-0 right-0 flex">
                <div class="mt-4 h-0.5 w-2 bg-gray-500"></div>
                <div class="mt-2 w-8 bg-gray-500 text-center text-xs text-white">ODER</div>
                <div class="mt-4 h-0.5 w-2 bg-gray-500"></div>
            </div>
        </div>
        <div v-if="props.canEdit" class="flex">
            <div v-if="!isEmpty" class="mt-4 h-0.5 w-2 bg-gray-500"></div>
            <RuleAdd @createdRule="createdRule" />
        </div>
    </div>
</template>
