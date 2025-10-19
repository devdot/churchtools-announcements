import type { RuleFilter } from '../../../types/Rule';

export interface FilterPropsBase {
    canEdit?: boolean;
    level?: number;
}

export interface FilterProps<TFilter extends RuleFilter> extends FilterPropsBase {
    filter: TFilter;
}

export const filterDefaults: FilterPropsBase = {
    canEdit: true,
    level: 0,
};
