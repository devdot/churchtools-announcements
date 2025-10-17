<script setup lang="ts">
import useCategories from '../../composables/useCategories';
const props = defineProps<{
    categoryId: number | string;
}>();

const { findCategory, updateCategory, deleteCategory, isLoading } = useCategories();
const category = findCategory(props.categoryId);
</script>
<template>
    <div v-if="isLoading">Lade Daten</div>
    <div v-else-if="category === null">Kategorie nicht gefunden!</div>
    <div v-else class="flex w-full flex-col">
        <h1>
            {{ category?.name ?? '' }}
        </h1>
        <div class="flex gap-4">
            <RouterLink :to="{ name: 'categories' }">Übersicht</RouterLink>
            <RouterLink :to="{ name: 'category' }">Ankündigungen</RouterLink>
            <RouterLink :to="{ name: 'category.rules' }">Regeln</RouterLink>
            <RouterLink :to="{ name: 'category.settings' }">Einstellungen</RouterLink>
            <button @click="updateCategory(category)">Update</button>
            <button @click="deleteCategory(category)">Delete</button>
        </div>
        <RouterView :category="category" />
    </div>
</template>
