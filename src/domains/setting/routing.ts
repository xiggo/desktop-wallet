import { AppearanceSettings, ExportSettings, GeneralSettings, PasswordSettings } from "@/domains/setting/pages";

export const SettingRoutes = [
	{
		component: GeneralSettings,
		exact: true,
		path: "/profiles/:profileId/settings/general",
	},
	{
		component: PasswordSettings,
		exact: true,
		path: "/profiles/:profileId/settings/password",
	},
	{
		component: ExportSettings,
		exact: true,
		path: "/profiles/:profileId/settings/export",
	},
	{
		component: AppearanceSettings,
		exact: true,
		path: "/profiles/:profileId/settings/appearance",
	},
	{
		component: GeneralSettings,
		exact: true,
		path: "/profiles/:profileId/settings",
	},
];
