<script setup lang="ts">
import { Tag } from 'primevue';

const props = defineProps<{
    tags: string[];
}>();
</script>
<template>
    <div class="flex gap-2">
        <Tag v-for="tag in props.tags" :key="tag" severity="secondary" :value="tag" />
    </div>
</template>
