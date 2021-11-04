import { AVAILABLE_CATEGORIES } from "./news.constants";

export type AvailableNewsCategories = typeof AVAILABLE_CATEGORIES[number] | "All";
