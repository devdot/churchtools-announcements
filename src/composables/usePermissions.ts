import { usePermissions as usePermissionsImport } from '@churchtools/utils';
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue';
import type { Category } from '../types/Category';
import type { CustomModulePermission } from '../utils/ct-types';
import useModule from './useModule';

type CategoryPermission = Exclude<keyof CustomModulePermission, 'view' | 'create custom category'>;

export const usePermissions = function () {
    const { moduleName } = useModule();
    const { globalPerm: global } = usePermissionsImport();

    const permissions: ComputedRef<CustomModulePermission> = computed(
        () =>
            (global.value ?? {})[moduleName] ?? {
                view: false,
                'view custom category': [],
                'create custom category': false,
                'edit custom category': [],
                'delete custom category': [],
                'view custom data': [],
                'create custom data': [],
                'edit custom data': [],
                'delete custom data': [],
            },
    );

    const categoryPermission = function (
        categoryId: MaybeRef<number>,
        permission: CategoryPermission,
    ): boolean {
        return (
            (permissions.value[permission].find(id => id === unref(categoryId)) ?? null) !== null
        );
    };

    const can = function (category: MaybeRef<number | Category>) {
        const cat = unref(category);
        const categoryId = typeof cat === 'number' ? cat : cat.id;
        return computed(() => ({
            view: categoryPermission(categoryId, 'view custom category'),
            edit: categoryPermission(categoryId, 'edit custom category'),
            delete: categoryPermission(categoryId, 'delete custom category'),
            viewData: categoryPermission(categoryId, 'view custom data'),
            createData: categoryPermission(categoryId, 'create custom data'),
            editData: categoryPermission(categoryId, 'edit custom data'),
            deleteData: categoryPermission(categoryId, 'delete custom data'),
            upsertData:
                categoryPermission(categoryId, 'create custom data') &&
                categoryPermission(categoryId, 'edit custom data'),
        }));
    };

    return {
        global,
        permissions,
        can,
        canView: computed(() => permissions.value.view),
        canCreateCategory: computed(() => permissions.value['create custom category']),
    };
};
