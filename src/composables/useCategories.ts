import { computed, type ComputedRef } from 'vue';
import { type Category, type CategoryCreate } from '../types/Category';
import { slugify } from '../utils/string';
import useData from './useData';

const PREFIX = 'cat_';

export default function useCategories() {
    const {
        dataCategories,
        findDataCategory,
        createDataCategory,
        updateDataCategory,
        deleteDataCategory,
        isLoading,
    } = useData();
    const categories: ComputedRef<Category[]> = computed(() =>
        (dataCategories.value ?? []).filter(cat => cat.shorty.startsWith(PREFIX)),
    );

    const findCategory = (categoryId: number | string) => {
        const id = typeof categoryId === 'number' ? categoryId : Number.parseInt(categoryId);
        return computed(() => categories.value.filter(cat => cat.id === id).pop() ?? null);
    };

    const createCategory = (category: CategoryCreate): Promise<Category> => {
        const shorty = PREFIX + slugify(category.name);
        const search = findDataCategory(shorty).value;
        if (search === null) {
            return createDataCategory({
                shorty: shorty,
                ...category,
            });
        }
        return Promise.resolve(search);
    };

    const updateCategory = (category: Category): Promise<Category> => {
        return updateDataCategory({
            ...category,
        });
    };

    const deleteCategory = (category: Category): Promise<boolean> => {
        return deleteDataCategory(category.id).then(ret => ret !== false);
    };

    return {
        categories,
        isLoading,
        findCategory,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}
