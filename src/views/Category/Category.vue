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
    { route: 'category.announcements', label: 'Ansagen', icon: 'fa-solid fa-bullhorn' },
    { route: 'category.planner', label: 'Planer', icon: 'fa-solid fa-calendar-days' },
    { route: 'category.rules', label: 'Kalender-Filter', icon: 'fa-solid fa-filter' },
    { route: 'category.sets', label: 'Ankündigungs-Termine', icon: 'fa-solid fa-calendar-day' },
    { route: 'category.settings', label: 'Einstellungen', icon: 'fa-solid fa-gear' },
]);

const VERSION = __APP_VERSION__;
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
            <div class="grow"></div>
            <a
                class="mt-4 px-3 text-center text-sm text-gray-500 hover:underline"
                href="https://github.com/devdot/churchtools-announcements"
                target="_blank"
            >
                announcements v{{ VERSION }}
            </a>
        </template>
        <template #main>
            <RouterView :key="category.id" :category="category" />
        </template>
    </Layout>
</template>
