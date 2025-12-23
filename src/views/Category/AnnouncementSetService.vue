<script setup lang="ts">
import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { Event, EventService } from '@churchtools/utils';
import { computed, onBeforeMount, ref, type Ref } from 'vue';
import useServices from '../../composables/useServices';
import type { AnnouncementSet } from '../../types/Announcement';
import type { CategorySettings } from '../../types/Category';
import Person from '../Components/Person.vue';

const props = defineProps<{
    set: AnnouncementSet;
    settings: CategorySettings;
}>();

const event: Ref<Event | null> = ref(null);
const eventServices: Ref<EventService[]> = ref([]);
onBeforeMount(() =>
    churchtoolsClient.get<Event>('/events/' + props.set.eventId).then(function (response) {
        event.value = response;
        (response.eventServices ?? []).map(service => eventServices.value.push(service));
    }),
);

const filterServices = function (services: EventService[], ids: number[]) {
    return services.filter(
        service => typeof ids.find(id => id === service.serviceId) != 'undefined',
    );
};
const transformPerson = function (service: EventService) {
    const id = parseInt(service.person?.domainIdentifier ?? '0');
    return {
        id,
        title: service.person?.title ?? '#' + id,
        imageUrl: service.person?.imageUrl ?? '/system/assets/img/nobody-new.jpg',
        frontendUrl: service.person?.frontendUrl ?? '/?q=churchdb#PersonView/searchEntry:#' + id,
    };
};

const announcees = computed(() =>
    filterServices(eventServices.value, props.settings.eventAnnounceeServiceIds)
        .map(transformPerson)
        .filter(p => typeof p !== 'undefined'),
);

const { find } = useServices();
const services = computed(() =>
    filterServices(eventServices.value, props.settings.eventShowServiceIds)
        .map(function (service) {
            const data = find(service.serviceId).value;
            return {
                id: service.serviceId,
                key: service.id,
                name: data?.name ?? '',
                sort: data?.sortKey ?? 0,
                person: transformPerson(service),
            };
        })
        .sort((a, b) => a.sort - b.sort),
);
</script>
<template>
    <div class="py-4">
        <div class="flex items-center gap-2">
            <span>Angekündigt von: </span>
            <Person v-for="announcee in announcees" :key="announcee.id" :person="announcee" />
        </div>
        <div class="grid grid-cols-2 gap-2 p-4">
            <div
                v-for="service in services"
                :key="service.key"
                class="grid grid-cols-2 items-center"
            >
                <div>{{ service.name }}:</div>
                <Person :person="service.person" />
            </div>
        </div>
    </div>
</template>
