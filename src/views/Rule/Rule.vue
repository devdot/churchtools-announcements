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
        <div class="flex rounded-t-md border-b border-gray-500 bg-white p-2">
            <div class="grow">
                {{ header }}
            </div>
            <div class="flex gap-2">
                <div>
                    <input v-model="rule.negate" :disabled="!props.canEdit" type="checkbox" />
                    <span v-if="rule.negate">◐</span>
                    <span v-else>◑</span>
                </div>
                <div v-if="canDelete" class="cursor-pointer" @click="emits('deletedRule')">🗑</div>
                <div v-if="collapsed" class="cursor-pointer" @click="collapsed = false">▼</div>
                <div v-else class="cursor-pointer" @click="collapsed = true">▲</div>
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
