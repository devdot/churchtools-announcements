<script setup lang="ts">
import { ref } from 'vue';
import type { RuleFilter } from '../../../types/Rule';
import { filterDefaults, type FilterProps } from './FilterProps';

const props = withDefaults(defineProps<FilterProps<RuleFilter>>(), filterDefaults);
const filter = ref(props.filter);
</script>
<template>
    <div class="italic">{{ filter.type }} ist nicht implementiert!</div>
</template>
