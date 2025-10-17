<script setup lang="ts">
import useCategories from '../composables/useCategories';

const { categories } = useCategories();
</script>
<template>
    <div>
        <div class="grid">
            <RouterLink
                v-for="category in categories"
                :key="category.id"
                :to="{ name: 'category', params: { categoryId: category.id } }"
            >
                {{ category.name }}
            </RouterLink>
        </div>
        <RouterLink :to="{ name: 'categories' }">Kategorien bearbeiten</RouterLink>
    </div>
</template>
