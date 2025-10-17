<script setup lang="ts">
import type { Category } from '../../types/Category';

const props = defineProps<{ category: Category; categoryId: string | number }>();
const category = props.category;
</script>

<template>
    <div>annoucements! {{ category.id }}</div>
</template>
