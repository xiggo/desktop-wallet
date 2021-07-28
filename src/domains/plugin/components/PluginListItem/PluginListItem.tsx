import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { TableCell, TableRow } from "app/components/Table";
import { Tooltip } from "app/components/Tooltip";
import { usePluginIcon } from "domains/plugin/hooks/use-plugin-icon";
import React from "react";
import { useTranslation } from "react-i18next";

import { PluginImage } from "../PluginImage";
import { PluginLaunchButton, PluginMenu } from "./PluginListItem.blocks";

interface PluginListItemProperties {
	onDelete?: (plugin: any) => void;
	onInstall: any;
	onLaunch?: (plugin: any) => void;
	onEnable?: (plugin: any) => void;
	onDisable?: (plugin: any) => void;
	onUpdate?: (plugin: any) => void;
	onClick?: (plugin: any) => void;
	isUpdating?: boolean;
	updatingProgress?: any;
	plugin: any;
	showCategory?: boolean;
}

export const PluginListItem = ({
	onDelete,
	onInstall,
	onEnable,
	onDisable,
	onLaunch,
	onUpdate,
	onClick,
	isUpdating,
	updatingProgress,
	plugin,
	showCategory,
}: PluginListItemProperties) => {
	const { t } = useTranslation();

	const { renderPluginIcon } = usePluginIcon();

	const handleInstall = () => {
		onInstall?.(plugin);
	};

	const renderPluginButtons = () => {
		if (!plugin.isInstalled) {
			return (
				<Button
					variant="secondary"
					onClick={handleInstall}
					data-testid="PluginListItem__install"
					className="flex-1"
				>
					{t("COMMON.INSTALL")}
				</Button>
			);
		}

		return (
			<div className="flex items-center w-full space-x-2">
				<PluginLaunchButton plugin={plugin} onLaunch={onLaunch} />
				<PluginMenu
					plugin={plugin}
					onDelete={onDelete}
					onEnable={onEnable}
					onDisable={onDisable}
					onUpdate={onUpdate}
				/>
			</div>
		);
	};

	return (
		<TableRow>
			<TableCell variant="start" innerClassName="space-x-5">
				<PluginImage
					size="sm"
					logoURL={plugin.logo}
					isExchange={plugin.category === "exchange"}
					isUpdating={isUpdating}
					updatingProgress={updatingProgress}
				/>

				<div className="flex items-center space-x-2 text-left">
					<span
						data-testid="PluginListItem__link"
						onClick={() => onClick?.(plugin)}
						className="font-semibold link truncate max-w-88"
					>
						{plugin.title}
					</span>

					{renderPluginIcon({
						isGrant: plugin.isGrant,
						isOfficial: plugin.isOfficial,
					})}

					{plugin.hasUpdateAvailable && plugin.isCompatible === false && (
						<Tooltip
							content={t("PLUGINS.MINIMUM_VERSION_NOT_SATISFIED", {
								minimumVersion: plugin.minimumVersion,
							})}
						>
							<span data-testid="PluginListItem__minimum-version-warning" className="ml-3 text-xl">
								<Icon name="AlertWarning" className="text-theme-warning-500" />
							</span>
						</Tooltip>
					)}
				</div>
			</TableCell>

			<TableCell>
				<span className="truncate w-50">{plugin.author}</span>
			</TableCell>

			{showCategory && (
				<TableCell>
					<span>{t(`PLUGINS.CATEGORIES.${plugin.category.toUpperCase()}`)}</span>
				</TableCell>
			)}

			<TableCell>
				<span className="truncate w-30">{plugin.version}</span>
			</TableCell>

			<TableCell>
				<span>{plugin.size}</span>
			</TableCell>

			<TableCell>
				{plugin.isInstalled ? (
					<>
						{plugin.isEnabled ? (
							<Tooltip content="Enabled">
								<div
									data-testid="PluginListItem__enabled"
									className="mx-auto text-2xl text-theme-success-500"
								>
									<Icon name="StatusOk" size="lg" />
								</div>
							</Tooltip>
						) : (
							<Tooltip content="Disabled">
								<div
									data-testid="PluginListItem__disabled"
									className="mx-auto text-2xl text-theme-danger-400"
								>
									<Icon name="StatusFailed" size="lg" />
								</div>
							</Tooltip>
						)}
					</>
				) : (
					<Tooltip content="Not installed">
						<div
							data-testid="PluginListItem__not-installed"
							className="flex justify-center items-center mx-auto w-6 h-6 text-theme-secondary-500"
						>
							<Icon name="Dash" size="lg" />
						</div>
					</Tooltip>
				)}
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				{renderPluginButtons()}
			</TableCell>
		</TableRow>
	);
};

PluginListItem.defaultProps = {
	updatingProgress: 0,
};
