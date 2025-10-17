import type { AppointmentBase } from '../utils/ct-types';

export interface Rule {
    negate: boolean;
    filter: RuleFilter;
}

export interface RuleFilter {
    type: RuleFilterType;
}

export type RuleFilterMap<TValue> = {
    and: TValue;
    or: TValue;
    create: TValue;
    calendar: TValue;
    text: TValue;
};
export type RuleFilterType = keyof RuleFilterMap<boolean>;
export const ruleFilterTypeNames: RuleFilterMap<string> = {
    and: 'Und-Verknüpfung',
    or: 'Oder-Verknüpfung',
    create: 'Neue Regel',
    calendar: 'Kalender',
    text: 'Text',
};

// todo: Filter date min / max

export type RuleFilterFunction<T extends RuleFilter> = {
    (filter: T, appointment: AppointmentBase): boolean;
};

export interface RuleFilterAnd extends RuleFilter {
    type: 'and';
    and: Rule[];
}

export interface RuleFilterOr extends RuleFilter {
    type: 'or';
    or: Rule[];
}

export interface RuleFilterCreate extends RuleFilter {
    type: 'create';
    create: RuleFilterType | null;
}

export interface RuleFilterCalendar extends RuleFilter {
    type: 'calendar';
    calendarId: number;
}

export interface RuleFilterText extends RuleFilter {
    type: 'text';
    field: RuleFilterTextFields;
    search: string;
    regex: boolean;
}

export type RuleFilterTextFields = 'title' | 'subtitle' | 'description';

export const filterFactory = function (type: RuleFilterType) {
    const baseFactory = <T extends RuleFilter>(type: string, filter: Omit<T, 'type'>) => {
        return () => ({
            type: type,
            ...filter,
        });
    };
    const factories: RuleFilterMap<{ (): RuleFilter }> = {
        and: baseFactory<RuleFilterAnd>('and', { and: [] }),
        or: baseFactory<RuleFilterOr>('or', { or: [] }),
        create: baseFactory<RuleFilterCreate>('create', { create: null }),
        calendar: baseFactory<RuleFilterCalendar>('calendar', { calendarId: -1 }),
        text: baseFactory<RuleFilterText>('text', {
            field: 'title',
            search: '',
            regex: false,
        }),
    };
    const factory = factories[type] ?? (() => {});
    return factory();
};

export const ruleFactory = function (filter: RuleFilterType = 'create'): Rule {
    return {
        negate: false,
        filter: filterFactory(filter),
    };
};

const functions: RuleFilterMap<RuleFilterFunction<RuleFilter>> = {
    create: (filter: RuleFilterCreate, appointment: AppointmentBase) =>
        filter !== null || appointment !== null,
    calendar: function (filter: RuleFilterCalendar, appointment: AppointmentBase) {
        return filter.calendarId === -1 || appointment.calendar.id === filter.calendarId;
    },
    text: function (filter: RuleFilterText, appointment: AppointmentBase) {
        const field = appointment[filter.field] ?? null;
        if (typeof field === 'string') {
            if (filter.regex) {
                return field.match(filter.search) !== null;
            }
            return field === filter.search;
        }
        return false;
    },
};

export function filterRule(rule: Rule, appointment: AppointmentBase): boolean {
    const expected = rule.negate !== true;

    switch (rule.filter.type) {
        case 'and': {
            const rules = (rule.filter as RuleFilterAnd).and;
            for (const rule of rules) {
                if (filterRule(rule, appointment) !== expected) {
                    return false;
                }
            }
            return true;
        }
        case 'or': {
            const rules = (rule.filter as RuleFilterOr).or;
            for (const rule of rules) {
                if (filterRule(rule, appointment) === expected) {
                    return true;
                }
            }
            return rules.length === 0;
        }
        default: {
            const func = functions[rule.filter.type];
            if (typeof func === 'function') {
                // @ts-expect-error ignore type casting of rule here because we cannot do it better
                return functions[rule.filter.type](rule.filter, appointment) === expected;
            }
            throw 'Type not found: ' + rule.filter.type;
        }
    }
}
