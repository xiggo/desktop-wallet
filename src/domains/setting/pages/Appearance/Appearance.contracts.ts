import { AccentColorType, ViewingModeType } from "app/hooks";

export interface AppearanceSettingsState {
	accentColor: AccentColorType;
	viewingMode: ViewingModeType;
}

export interface UseAppearanceSettings {
	getValues: () => AppearanceSettingsState;
	setValues: (values: AppearanceSettingsState) => void;
}
