import { Contracts } from "@payvo/profiles";
import { AccentColorType, ViewingModeType } from "app/hooks";
import React from "react";
import { useTranslation } from "react-i18next";

import { AppearanceSettingsState, UseAppearanceSettings } from "./Appearance.contracts";
import { AppearanceAccentColor } from "./blocks/AppearanceAccentColor";
import { AppearanceViewingMode } from "./blocks/AppearanceViewingMode";

export const useAppearanceItems = (): Record<string, any>[] => {
	const { t } = useTranslation();

	return [
		{
			isFloatingLabel: false,
			label: `${t("SETTINGS.APPEARANCE.OPTIONS.ACCENT_COLOR.TITLE")}`,
			labelDescription: `${t("SETTINGS.APPEARANCE.OPTIONS.ACCENT_COLOR.DESCRIPTION")}`,
			value: <AppearanceAccentColor />,
			wrapperClass: "pb-6",
		},
		{
			isFloatingLabel: false,
			label: `${t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.TITLE")}`,
			labelDescription: `${t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.DESCRIPTION")}`,
			value: <AppearanceViewingMode />,
			wrapperClass: "pt-6",
		},
	];
};

export const useAppearanceSettings = (profile: Contracts.IProfile): UseAppearanceSettings => ({
	getValues: (): AppearanceSettingsState => ({
		accentColor: profile.settings().get(Contracts.ProfileSetting.AccentColor) as AccentColorType,
		viewingMode: profile.settings().get(Contracts.ProfileSetting.Theme) as ViewingModeType,
	}),
	setValues: (values: AppearanceSettingsState): void => {
		profile.settings().set(Contracts.ProfileSetting.AccentColor, values.accentColor);
		profile.settings().set(Contracts.ProfileSetting.Theme, values.viewingMode);
	},
});
