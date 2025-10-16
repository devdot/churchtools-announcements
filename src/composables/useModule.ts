import { useCustomModuleQuery } from '@churchtools/utils';
import { computed } from 'vue';

export default function useModule() {
    const moduleName = import.meta.env.VITE_KEY;
    const { data: customModule, isLoading } = useCustomModuleQuery(moduleName);
    const moduleId = computed(() => customModule.value?.id ?? 0);
    return {
        customModule,
        moduleId,
        moduleName,
        isLoading,
    };
}
