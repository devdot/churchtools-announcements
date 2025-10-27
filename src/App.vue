<script setup lang="ts">
// import { Grid, LoadingMessage } from '@churchtools/styleguide';
import useModule from './composables/useModule';
import Loading from './views/Utils/Loading.vue';
const { isLoading: isLoadingModule, moduleName } = useModule();
</script>
<template>
    <Loading v-if="isLoadingModule" class="flex grow flex-col" />
    <!-- <LoadingMessage message="Daten werden geladen"/> -->
    <!-- <Grid  -->
    <RouterView v-else :key="moduleName" />
    <!-- </Grid> -->
</template>
