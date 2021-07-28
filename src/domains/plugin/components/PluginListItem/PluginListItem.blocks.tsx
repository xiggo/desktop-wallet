import { Badge } from "app/components/Badge";
import { Button } from "app/components/Button";
import { Dropdown, DropdownOption } from "app/components/Dropdown";
import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const PluginLaunchButton = ({ plugin, onLaunch }: any) => {
	const { t } = useTranslation();

	const tooltipContent = () => {
		if (!plugin.isEnabled) {
			return t("PLUGINS.PLUGIN_INFO.NOT_ENABLED");
		}

		if (!plugin.hasLaunch) {
			return t("PLUGINS.PLUGIN_INFO.NOT_LAUNCHEABLE");
		}
	};

	const renderButtonContent = () => {
		if (plugin.isEnabled && plugin.hasLaunch) {
			return t("COMMON.LAUNCH");
		}

		return <Icon name="Dash" size="lg" />;
	};

	return (
		<Tooltip content={tooltipContent()}>
			<div className="w-full">
				<Button
					variant="secondary"
					onClick={() => onLaunch?.(plugin)}
					disabled={!plugin.hasLaunch}
					className="w-full"
					data-testid="PluginListItem__launch"
				>
					{renderButtonContent()}
				</Button>
			</div>
		</Tooltip>
	);
};

const PluginMenu = ({ plugin, onDelete, onEnable, onDisable, onUpdate }: any) => {
	const { t } = useTranslation();

	const actions = useMemo(() => {
		const result: DropdownOption[] = [];

		if (plugin.hasUpdateAvailable) {
			result.push({
				disabled: plugin.isCompatible === false,
				label: t("COMMON.UPDATE"),
				value: "update",
			});
		}

		if (plugin.isEnabled) {
			result.push({ label: t("COMMON.DISABLE"), value: "disable" });
		} else {
			result.push({ disabled: plugin.isCompatible === false, label: t("COMMON.ENABLE"), value: "enable" });
		}

		result.push({ label: t("COMMON.DELETE"), value: "delete" });

		return result;
	}, [t, plugin]);

	return (
		<Dropdown
			toggleContent={
				<div className="relative">
					{plugin.hasUpdateAvailable && (
						<Tooltip content={t("PLUGINS.NEW_VERSION_AVAILABLE")}>
							<Badge
								data-testid="PluginListItem__update-badge"
								size="sm"
								className="bg-theme-danger-500"
								position="top-right"
							/>
						</Tooltip>
					)}
					<Button variant="secondary" size="icon" className="text-left">
						<Icon name="Settings" size="lg" />
					</Button>
				</div>
			}
			options={actions}
			onSelect={(option: any) => {
				if (option.value === "delete") {
					onDelete?.(plugin);
				}

				if (option.value === "enable") {
					return onEnable?.(plugin);
				}

				if (option.value === "disable") {
					return onDisable?.(plugin);
				}

				if (option.value === "update") {
					return onUpdate?.(plugin);
				}
			}}
			dropdownClass="top-3 text-left"
		/>
	);
};

export { PluginLaunchButton, PluginMenu };
