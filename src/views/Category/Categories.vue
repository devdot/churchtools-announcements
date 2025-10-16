<script setup lang="ts">
import { ref } from 'vue';
import useCategories from '../../composables/useCategories';

const { categories, createCategory } = useCategories();
const newName = ref('neue Kategorie');
</script>
<template>
    <div>
        <h1>Categories</h1>
        <div class="flex">
            <input v-model="newName" />
            <button
                @click="
                    createCategory({
                        name: newName,
                        description: '',
                    })
                "
            >
                Create
            </button>
        </div>
        <table>
            <tr v-for="category in categories" v-bind:key="category.id">
                <td>
                    <RouterLink
                        :to="{
                            name: 'category',
                            params: {
                                categoryId: category.id,
                            },
                        }"
                        >{{ category.name }}</RouterLink
                    >
                </td>
            </tr>
        </table>
    </div>
</template>
