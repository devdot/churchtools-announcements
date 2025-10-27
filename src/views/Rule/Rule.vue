<script setup lang="ts">
import { computed, reactive, ref, type Component } from 'vue';
import { ruleFilterTypeNames, type Rule, type RuleFilterMap } from '../../types/Rule';
import Calendar from './Filter/Calendar.vue';
import Create from './Filter/Create.vue';
import { filterDefaults, type FilterPropsBase } from './Filter/FilterProps';
import Generic from './Filter/Generic.vue';
import Group from './Filter/Group.vue';
import Text from './Filter/Text.vue';

const props = withDefaults(
    defineProps<
        FilterPropsBase & {
            rule: Rule;
        }
    >(),
    filterDefaults,
);
const rule = reactive(props.rule);
const canDelete = computed(() => props.canEdit && props.level > 0);

const filters: RuleFilterMap<Component> = {
    and: Group,
    or: Group,
    create: Create,
    calendar: Calendar,
    text: Text,
};

const emits = defineEmits<{ (e: 'deletedRule'): void }>();

const header = computed(() => ruleFilterTypeNames[rule.filter.type] ?? rule.filter.type);
const filter = computed(() => filters[rule.filter.type ?? ''] ?? Generic);

const collapsed = ref(false);

const deleteConfirm = ref(false);

const bg = computed(() => {
    switch (props.level) {
        case 0:
            return 'bg-white';
        case 1:
            return 'bg-gray-100';
        case 2:
            return 'bg-gray-200';
        case 3:
            return 'bg-gray-300';
        default:
            return 'bg-gray-400';
    }
});
</script>
<template>
    <div class="rounded-md border border-gray-500 shadow-md">
        <div class="flex rounded-t-md border-b border-gray-500 bg-white">
            <div class="grow p-2">
                {{ header }}
            </div>
            <div class="flex justify-center divide-x divide-gray-500 border-l border-gray-500">
                <button
                    v-if="rule.negate"
                    class="cursor-pointer p-2 hover:bg-gray-200"
                    title="Regel negieren"
                    @click="rule.negate = false"
                >
                    <i class="fa-solid fa-not-equal"></i>
                </button>
                <button
                    v-else
                    class="cursor-pointer p-2 hover:bg-gray-200"
                    title="Regel negieren"
                    @click="rule.negate = true"
                >
                    <i class="fa-solid fa-equals"></i>
                </button>
                <button
                    v-if="canDelete && !deleteConfirm"
                    class="cursor-pointer p-2 hover:bg-gray-200"
                    @click="deleteConfirm = true"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button
                    v-if="canDelete && deleteConfirm"
                    class="cursor-pointer p-2 text-red-500 hover:bg-gray-200"
                    @click="emits('deletedRule')"
                >
                    <i class="fa-solid fa-check"></i>
                </button>
                <div
                    v-if="collapsed"
                    class="cursor-pointer p-2 hover:bg-gray-200"
                    @click="collapsed = false"
                >
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div v-else class="cursor-pointer p-2 hover:bg-gray-200" @click="collapsed = true">
                    <i class="fa-solid fa-chevron-up"></i>
                </div>
            </div>
        </div>
        <component
            :is="filter"
            v-if="!collapsed"
            :canEdit="props.canEdit"
            :class="[bg, 'rounded-b-md p-4']"
            :filter="rule.filter"
            :level="props.level"
        ></component>
    </div>
</template>
