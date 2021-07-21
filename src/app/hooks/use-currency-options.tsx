import { OptionGroupProperties } from "app/components/SelectDropdown/SelectDropdown.models";
import { PlatformSdkChoices } from "data";
import { useTranslation } from "react-i18next";

export const useCurrencyOptions = (): OptionGroupProperties[] => {
	const { t } = useTranslation();

	return [
		{ options: PlatformSdkChoices.currencies.fiat, title: t("COMMON.FIAT") },
		{ options: PlatformSdkChoices.currencies.crypto, title: t("COMMON.CRYPTOCURRENCY") },
	];
};
