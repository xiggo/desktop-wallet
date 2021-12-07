import { AVAILABLE_CATEGORIES } from "./news.constants";

interface NewsFilters {
	categories: AvailableNewsCategories[];
	coins: string[];
	searchQuery?: string;
}

interface NewsQuery {
	categories?: string[];
	coins: string[];
	page?: number;
	query?: string;
}

export type AvailableNewsCategories = typeof AVAILABLE_CATEGORIES[number] | "All";

export type { NewsFilters, NewsQuery };
