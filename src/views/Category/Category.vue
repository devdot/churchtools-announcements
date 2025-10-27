<script setup lang="ts">
import { Menu } from 'primevue';
import { ref } from 'vue';
import useCategories from '../../composables/useCategories';
import Layout from '../Layout.vue';
import Loading from '../Utils/Loading.vue';
const props = defineProps<{
    categoryId: number | string;
}>();

const { findCategory, isLoading } = useCategories();
const category = findCategory(props.categoryId);

const menu = ref([
    { route: 'category', label: 'Ankündigungen', icon: 'fa-solid fa-scroll' },
    { route: 'category.customs', label: 'Ansagen', icon: 'fa-solid fa-bullhorn' },
    { route: 'category.rules', label: 'Kalender-Filter', icon: 'fa-solid fa-filter' },
    { route: 'category.settings', label: 'Einstellungen', icon: 'fa-solid fa-gear' },
]);
</script>
<template>
    <Loading v-if="isLoading" />
    <div v-else-if="category === null">Kategorie nicht gefunden!</div>
    <Layout v-else :key="category.id">
        <template #header-title>{{ category.name }}</template>
        <template #sidebar>
            <Menu class="border-none" :model="menu" style="--p-menu-list-padding: 0">
                <template #item="{ item, props }">
                    <router-link v-slot="{ href, navigate }" custom :to="{ name: item.route }">
                        <a :href="href" v-bind="props.action" @click="navigate">
                            <span :class="item.icon" />
                            <span class="ml-2">{{ item.label }}</span>
                        </a>
                    </router-link>
                </template>
            </Menu>
        </template>
        <template #main>
            <RouterView :key="category.id" :category="category" />
        </template>
    </Layout>
</template>
