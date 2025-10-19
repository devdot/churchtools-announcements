<script setup lang="ts">
import { computed, ref } from 'vue';
import { ruleFactory, type RuleFilterGroup, type Rule as RuleType } from '../../../types/Rule';
import Rule from '../Rule.vue';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilterGroup>>(), filterDefaults);
const group = ref(props.filter.group);
const vertical = computed(() => props.filter.type === 'and');

const isEmpty = computed(() => group.value.length === 0);
const lastKey = computed(() => group.value.length - 1);

const createdRule = function (rule: RuleType) {
    group.value.push(rule);
};
const deletedRule = function (key: number) {
    if (group.value[key]) {
        group.value.splice(key, 1);
        uniqueKeys.splice(key, 1);
    }
};

const connectBg = computed(() => {
    switch (props.level) {
        case 0:
            return 'bg-gray-300';
        case 1:
            return 'bg-gray-400';
        case 2:
            return 'bg-gray-500';
        case 3:
            return 'bg-gray-600';
        default:
            return 'bg-gray-700';
    }
});

const uniqueKeys: number[] = [];
let nextKey = 0;
const getUniqueKey = function (key: number) {
    if (typeof uniqueKeys[key] === 'number') {
        return uniqueKeys[key];
    }
    return (uniqueKeys[key] = nextKey++);
};
</script>
<template>
    <div :class="['flex', vertical ? 'flex-col' : 'overflow-x-auto']">
        <div
            v-for="(rule, key) in group"
            :key="getUniqueKey(key)"
            :class="[
                'relative',
                vertical ? '' : 'min-w-72',
                key !== lastKey ? (vertical ? 'pb-8' : 'pr-12') : '',
            ]"
        >
            <Rule
                :canEdit="props.canEdit"
                :level="props.level + 1"
                :rule="rule"
                @deletedRule="deletedRule(key)"
            />
            <div v-if="key < lastKey" :class="['absolute', vertical ? '' : 'top-0 right-0 flex']">
                <div :class="[vertical ? 'ml-4 h-2 w-0.5' : 'mt-4 h-0.5 w-2', connectBg]"></div>
                <div
                    :class="[
                        vertical ? '' : 'mt-2',
                        connectBg,
                        'w-8 rounded text-center text-xs text-white',
                    ]"
                >
                    {{ vertical ? 'UND' : 'ODER' }}
                </div>
                <div :class="[vertical ? 'ml-4 h-2 w-0.5' : 'mt-4 h-0.5 w-2', connectBg]"></div>
            </div>
        </div>
        <div v-if="props.canEdit" :class="[vertical ? '' : 'flex']">
            <div
                v-if="!isEmpty"
                :class="[vertical ? 'ml-4 h-2 w-0.5' : 'mt-4 h-0.5 w-2', connectBg]"
            ></div>
            <button
                :class="[
                    connectBg,
                    'h-8 w-8 cursor-pointer rounded-full text-center text-xl text-white',
                ]"
                @click="createdRule(ruleFactory())"
            >
                +
            </button>
        </div>
    </div>
</template>
