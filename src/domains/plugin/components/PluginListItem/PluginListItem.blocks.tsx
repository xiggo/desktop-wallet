import { Badge } from "app/components/Badge";
import { Button } from "app/components/Button";
import { Dropdown, DropdownOption } from "app/components/Dropdown";
import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import cn from "classnames";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface PluginLaunchButtonProperties {
	plugin: any;
	onLaunch?: (plugin: any) => void;
	isCompact?: boolean;
}

const PluginLaunchButton = ({ plugin, onLaunch, isCompact }: PluginLaunchButtonProperties) => {
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

		if (isCompact) {
			return <span className="w-14 h-0.5 bg-theme-secondary-300 dark:bg-theme-secondary-700 rounded-full" />;
		}

		return <Icon name="Dash" size="lg" />;
	};

	const renderButton = () => {
		if (isCompact) {
			return (
				<span className="flex">
					<Button
						size="icon"
						variant="transparent"
						onClick={() => onLaunch?.(plugin)}
						disabled={!plugin.hasLaunch}
						className={cn("text-theme-primary-600 hover:text-theme-primary-700", {
							"-my-1": !plugin.hasLaunch,
						})}
						data-testid="PluginListItem__launch"
					>
						{renderButtonContent()}
					</Button>
				</span>
			);
		}

		return (
			<span className="flex w-full">
				<Button
					variant="secondary"
					onClick={() => onLaunch?.(plugin)}
					disabled={!plugin.hasLaunch}
					className="w-full"
					data-testid="PluginListItem__launch"
				>
					{renderButtonContent()}
				</Button>
			</span>
		);
	};

	return <Tooltip content={tooltipContent()}>{renderButton()}</Tooltip>;
};

interface PluginMenuProperties {
	plugin: any;
	onEnable?: (plugin: any) => void;
	onDisable?: (plugin: any) => void;
	onUpdate?: (plugin: any) => void;
	onDelete?: (plugin: any) => void;
	isCompact?: boolean;
}

const PluginMenu = ({ plugin, onDelete, onEnable, onDisable, onUpdate, isCompact }: PluginMenuProperties) => {
	const { t } = useTranslation();

	const actions = useMemo(() => {
		const result: DropdownOption[] = [];

		if (plugin.updateStatus.isAvailable) {
			result.push({
				disabled: !plugin.updateStatus.isCompatible,
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
					{plugin.updateStatus.isAvailable && (
						<Tooltip content={t("PLUGINS.NEW_VERSION_AVAILABLE")}>
							<Badge
								data-testid="PluginListItem__update-badge"
								size="sm"
								className="bg-theme-danger-500"
								position="top-right"
							/>
						</Tooltip>
					)}
					<Button
						size="icon"
						variant={isCompact ? "transparent" : "secondary"}
						className={cn("text-left", {
							"text-theme-primary-600 hover:text-theme-primary-700 -mx-3": isCompact,
						})}
					>
						<Icon name="EllipsisVertical" size="lg" />
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
