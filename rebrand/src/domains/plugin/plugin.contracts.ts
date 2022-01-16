import { translations as pluginTranslations } from "./i18n";
import { PLUGIN_CATEGORIES } from "./plugin.constants";

export type PluginCategories = typeof PLUGIN_CATEGORIES[number];
export type PluginPermissions = keyof typeof pluginTranslations.PERMISSIONS;
