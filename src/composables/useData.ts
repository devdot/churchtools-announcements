import {
    useCustomModuleDataCategoriesQuery,
    useCustomModuleDataCategoryMutations,
    type CustomModuleDataCategoryCreate,
} from '@churchtools/utils';
import { computed } from 'vue';
import useModule from './useModule';

export default function useData() {
    // it's important to pass refs because the request will be called again when refs change
    const { moduleId } = useModule();
    const {
        createDataCategory: create,
        updateDataCategory: update,
        deleteDataCategory: del,
    } = useCustomModuleDataCategoryMutations(moduleId);

    const { data, isLoading } = useCustomModuleDataCategoriesQuery(moduleId);
    const dataCategories = computed(() => data.value ?? []);

    const findDataCategory = (shorty: string) => {
        return computed(
            () => dataCategories.value?.filter(cat => cat.shorty === shorty).pop() ?? null,
        );
    };

    const getDataCategoryId = (shorty: string) => {
        return computed(() => findDataCategory(shorty).value?.id ?? 0);
    };

    const createDataCategory = (schema: Omit<CustomModuleDataCategoryCreate, 'customModuleId'>) => {
        return create({
            ...schema,
            customModuleId: moduleId.value,
        });
    };

    const updateDataCategory = (schema: Omit<CustomModuleDataCategoryCreate, 'customModuleId'>) => {
        const category = findDataCategory(schema.shorty);
        if (category.value) {
            return update({
                id: category.value.id,
                customModuleId: moduleId.value,
                ...schema,
            });
        } else {
            return createDataCategory(schema);
        }
    };

    const deleteDataCategory = (shorty: string | number) => {
        if (typeof shorty === 'number') {
            return del(shorty);
        }

        const category = findDataCategory(shorty);
        if (category.value) {
            return del(category.value.id);
        }

        return Promise.resolve(false);
    };

    return {
        dataCategories,
        getDataCategoryId,
        findDataCategory,
        createDataCategory,
        updateDataCategory,
        deleteDataCategory,
        isLoading,
    };
}
