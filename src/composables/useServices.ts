import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { Service } from '@churchtools/utils';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

export default function useServices() {
    const { data, isLoading } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: () => churchtoolsClient.get<Service[]>('/services'),
        staleTime: 1000 * 60 * 10, // 10 minutes
        initialData: [],
        initialDataUpdatedAt: 0,
    });

    const find = function (id: number = 0) {
        return computed(() => data.value.find(service => service.id == id) ?? null);
    };

    const findName = function (id: number = 0) {
        return computed(() => find(id).value?.name ?? '');
    };

    return {
        services: data,
        isLoading,
        find,
        findName,
    };
}
