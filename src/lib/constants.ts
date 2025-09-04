export const ROUTES = {
    root: '/',
    filter: '/route/$filterId',
}

export const FILTER = {
    all: 'all',
    uncategorized: 'uncategorized',
    trash: 'trash',
} as const;

export const DB_FILE_NAME = 'library.db';

export type FilterType = typeof FILTER[keyof typeof FILTER] | `folder:${string}`