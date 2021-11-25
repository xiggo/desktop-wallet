import { AccentColorType, ViewingModeType } from "@/app/hooks";

export interface AppearanceSettingsState {
	accentColor: AccentColorType;
	dashboardTransactionHistory: boolean;
	useExpandedTables: boolean;
	useNetworkWalletNames: boolean;
	viewingMode: ViewingModeType;
}

export interface UseAppearanceSettings {
	getValues: () => AppearanceSettingsState;
	setValues: (values: AppearanceSettingsState) => void;
}
