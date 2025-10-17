<script setup lang="ts">
import { ruleFactory, type Rule as RuleType } from '../../types/Rule';

const emits = defineEmits<{ (e: 'createdRule', rule: RuleType): void }>();
</script>
<template>
    <button
        class="h-8 w-8 cursor-pointer rounded-full bg-gray-500 text-center text-xl text-white"
        @click="emits('createdRule', ruleFactory())"
    >
        +
    </button>
</template>
