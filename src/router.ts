import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import CategoryAnnouncementCustoms from './views/Category/AnnouncementCustoms.vue';
import CategoryAnnouncementSets from './views/Category/AnnouncementSets.vue';
import Category from './views/Category/Category.vue';
import CategoryRules from './views/Category/Rules.vue';
import CategorySettings from './views/Category/Settings.vue';
import NotFound from './views/NotFound.vue';
import Overview from './views/Overview.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '',
        name: 'overview',
        component: Overview,
    },
    {
        path: '/categories/:categoryId',
        name: 'category-parent',
        component: Category,
        props: true,
        children: [
            {
                path: '',
                name: 'category',
                component: CategoryAnnouncementSets,
                props: true,
            },
            {
                path: 'customs',
                name: 'category.customs',
                component: CategoryAnnouncementCustoms,
                props: true,
            },
            {
                path: 'rules',
                name: 'category.rules',
                component: CategoryRules,
                props: true,
            },
            {
                path: 'settings',
                name: 'category.settings',
                component: CategorySettings,
                props: true,
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: NotFound,
    },
];

const KEY = import.meta.env.VITE_KEY;

export const router = createRouter({
    routes,
    history: createWebHistory('/ccm/' + KEY + '/'),
});
