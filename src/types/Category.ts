export interface Category {
    id: number;
    name: string;
    readonly shorty: string;
    description: string;
}

export type CategoryCreate = Omit<Category, 'id' | 'shorty'>;
