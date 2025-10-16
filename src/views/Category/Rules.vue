<script setup lang="ts">
import type { Category } from '../../types/Category';

const props = defineProps<{ category: Category }>();
const category = props.category;
</script>

<template>
    <div>rules! {{ category.id }}</div>
</template>
