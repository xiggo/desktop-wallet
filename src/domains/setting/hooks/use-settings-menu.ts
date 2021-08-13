import { useTranslation } from "react-i18next";

export const useSettingsMenu = () => {
	const { t } = useTranslation();

	const menuItems = [
		{
			icon: "Sliders",
			itemKey: "general",
			label: t("SETTINGS.GENERAL.MENU_ITEM"),
		},
		{
			icon: "Lock",
			itemKey: "password",
			label: t("SETTINGS.PASSWORD.MENU_ITEM"),
		},
		{
			icon: "ArrowUpTurnBracket",
			itemKey: "export",
			label: t("SETTINGS.EXPORT.MENU_ITEM"),
		},
		{
			icon: "PencilRuler",
			itemKey: "appearance",
			label: t("SETTINGS.APPEARANCE.MENU_ITEM"),
		},
	];

	return { menuItems };
};
