import { ButtonGroup, ButtonGroupOption } from "app/components/ButtonGroup";
import { Icon } from "app/components/Icon";
import { AppearanceSettingsState } from "domains/setting/pages/Appearance/Appearance.contracts";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ViewingModeItem {
	icon: string;
	name: string;
	value: string;
}

export const AppearanceViewingMode: React.FC = () => {
	const { t } = useTranslation();

	const form = useFormContext<AppearanceSettingsState>();

	const viewingMode = form?.watch("viewingMode");

	const viewingModes: ViewingModeItem[] = [
		{
			icon: "Light",
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.LIGHT"),
			value: "light",
		},
		{
			icon: "Dark",
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DARK"),
			value: "dark",
		},
	];

	return (
		<ButtonGroup>
			{viewingModes.map(({ icon, name, value }) => (
				<ButtonGroupOption
					disabled={!form}
					key={value}
					isSelected={() => viewingMode === value}
					setSelectedValue={() =>
						form?.setValue("viewingMode", value, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
					value={value}
					variant="modern"
				>
					<div className="flex items-center space-x-2 px-2">
						<Icon width={20} height={20} name={icon} />
						<span>{name}</span>
					</div>
				</ButtonGroupOption>
			))}
		</ButtonGroup>
	);
};
