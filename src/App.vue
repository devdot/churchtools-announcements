<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount } from 'vue';
import useModule from './composables/useModule';
import DevBar from './views/Utils/DevBar.vue';
import Loading from './views/Utils/Loading.vue';
const { isLoading: isLoadingModule, moduleName } = useModule();

onBeforeMount(function () {
    if (document.body.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
    }
});

onBeforeUnmount(function () {
    if (!document.body.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
    }
});

const IS_DEV = import.meta.env.DEV === true;
</script>
<template>
    <DevBar v-if="IS_DEV" />
    <Loading v-if="isLoadingModule" class="flex grow flex-col" />
    <RouterView v-else :key="moduleName" />
</template>
