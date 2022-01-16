interface GeneralSettingsState {
	automaticSignOutPeriod: string;
	avatar: string;
	bip39Locale: string;
	errorReporting: boolean;
	exchangeCurrency: string;
	locale: string;
	marketProvider: string;
	name: string;
	screenshotProtection: boolean;
	timeFormat: string;
	useTestNetworks: boolean;
}

interface SettingsOption {
	label: string;
	value: string | number;
	unsupportedCurrencies?: string[];
}

export type { GeneralSettingsState, SettingsOption };
