<script setup lang="ts">
// import { Grid, LoadingMessage } from '@churchtools/styleguide';
import useModule from './composables/useModule';
const { isLoading: isLoadingModule, moduleName } = useModule();
</script>
<template>
    <div v-if="isLoadingModule" class="flex grow flex-col">
        <!-- <LoadingMessage message="Daten werden geladen"/> -->
        Daten werden geladen
    </div>
    <!-- <Grid  -->
    <div
        v-else
        :id="moduleName"
        class="w-full"
        min-height="var(--grid-min-height, 57px)"
        style="--color-link: var(--accent-bright); --grid-left: 263px; --grid-left-collapsed: 0px"
    >
        <div class="flex grow flex-col">
            <!-- <template v-slot:header>
            </template> -->
            <div class="flex grow">
                <!-- <RouterLink>Router</RouterLink> -->
            </div>
            <div class="flex grow">
                <RouterView />
            </div>
        </div>
    </div>
    <!-- </Grid> -->
</template>
