import { snakeCase } from "@payvo/sdk-helpers";
import { ExtendedSerializedPluginConfigurationData } from "plugins";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { Button } from "@/app/components/Button";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Header } from "@/app/components/Header";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { Icon } from "@/app/components/Icon";
import { Page, Section } from "@/app/components/Layout";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { toasts } from "@/app/services";
import { InstallPlugin } from "@/domains/plugin/components/InstallPlugin";
import { ManualInstallationDisclaimer } from "@/domains/plugin/components/ManualInstallationDisclaimer";
import { PluginGrid } from "@/domains/plugin/components/PluginGrid";
import { PluginList } from "@/domains/plugin/components/PluginList";
import {
	PluginManagerNavigationBar,
	PluginManagerNavigationBarItem,
} from "@/domains/plugin/components/PluginManagerNavigationBar";
import { PluginManualInstallModal } from "@/domains/plugin/components/PluginManualInstallModal/PluginManualInstallModal";
import { PluginUninstallConfirmation } from "@/domains/plugin/components/PluginUninstallConfirmation/PluginUninstallConfirmation";
import { PluginUpdatesConfirmation } from "@/domains/plugin/components/PluginUpdatesConfirmation";
import { usePluginUpdateQueue } from "@/domains/plugin/hooks/use-plugin-update-queue";
import { PLUGIN_CATEGORIES } from "@/domains/plugin/plugin.constants";
import { PluginCategories } from "@/domains/plugin/plugin.contracts";
import { usePluginManagerContext } from "@/plugins/context/PluginManagerProvider";
import { IPluginController } from "@/plugins/core";
import { assertPluginController } from "@/utils/assertions";

type PluginActionType = (plugin: ExtendedSerializedPluginConfigurationData) => void;
export interface PluginActionsProperties {
	onDelete: PluginActionType;
	onDisable: PluginActionType;
	onEnable: PluginActionType;
	onInstall: PluginActionType;
	onLaunch: PluginActionType;
	onSelect: PluginActionType;
	onUpdate: PluginActionType;
}

type LatestPluginsProperties = {
	isLoading?: boolean;
	onCurrentViewChange: (view: string) => void;
	pluginsByCategory: Record<string, ExtendedSerializedPluginConfigurationData[]>;
	updatingStats?: Record<string, ExtendedSerializedPluginConfigurationData>;
	viewType: string;
	isCompact?: boolean;
} & PluginActionsProperties;

const LatestPlugins = ({
	isLoading,
	onCurrentViewChange,
	onDelete,
	onDisable,
	onEnable,
	onInstall,
	onLaunch,
	onSelect,
	onUpdate,
	pluginsByCategory,
	updatingStats,
	viewType,
	isCompact,
}: LatestPluginsProperties) => {
	const { t } = useTranslation();

	const renderPlugins = (plugins: ExtendedSerializedPluginConfigurationData[], category: PluginCategories) => {
		if (viewType === "grid") {
			const gridPlugins: ExtendedSerializedPluginConfigurationData[] = [...plugins];

			if (gridPlugins.length < 3) {
				gridPlugins.push(
					...Array.from(
						{ length: 3 - plugins.length },
						() => ({} as ExtendedSerializedPluginConfigurationData),
					),
				);
			}

			return (
				<PluginGrid
					category={category}
					isLoading={isLoading}
					onDelete={onDelete}
					onDisable={onDisable}
					onEnable={onEnable}
					onInstall={onInstall}
					onLaunch={onLaunch}
					onSelect={onSelect}
					onUpdate={onUpdate}
					plugins={gridPlugins}
					showPagination={false}
					updatingStats={updatingStats}
				/>
			);
		}

		return (
			<PluginList
				onClick={onSelect}
				onDelete={onDelete}
				onDisable={onDisable}
				onEnable={onEnable}
				onInstall={onInstall}
				onLaunch={onLaunch}
				onUpdate={onUpdate}
				plugins={plugins}
				showPagination={false}
				updatingStats={updatingStats}
				isCompact={isCompact}
			/>
		);
	};

	return (
		<>
			{PLUGIN_CATEGORIES.map((category) => {
				let plugins = pluginsByCategory[category] ?? [];
				const categoryCount = plugins.length;

				plugins = plugins.slice(0, 3);

				return (
					<Section key={category}>
						<div data-testid={`PluginManager__latest__${category}`}>
							<div className="flex justify-between items-center mb-6">
								<h2 className="mb-0 font-bold">{t(`PLUGINS.CATEGORIES.${category.toUpperCase()}`)}</h2>

								{categoryCount > plugins.length && !plugins.some((plugin) => !plugin) && (
									<span
										className="flex items-center space-x-2 font-semibold link"
										data-testid={`PluginManager__latest__${category}__view-all`}
										onClick={() => onCurrentViewChange(category)}
									>
										<span>{t("COMMON.VIEW_ALL")}</span>
										<Icon name="ChevronRight" size="sm" />
									</span>
								)}
							</div>

							{renderPlugins(plugins, category)}
						</div>
					</Section>
				);
			})}
		</>
	);
};

const UpdateAllBanner = ({
	hasUpdateAvailableCount,
	hasCompatibleUpdateAvailableCount,
	isUpdatingAll,
	onUpdateAll,
}: {
	hasUpdateAvailableCount: number;
	hasCompatibleUpdateAvailableCount: number;
	isUpdatingAll: boolean;
	onUpdateAll: () => void;
}) => {
	const { t } = useTranslation();

	if (hasUpdateAvailableCount === 0) {
		return <></>;
	}

	const renderText = () => {
		if (!hasCompatibleUpdateAvailableCount) {
			return <span>{t("PLUGINS.UPDATE_ALL_NOTICE_INCOMPATIBLE", { count: hasUpdateAvailableCount })}</span>;
		}

		return <span>{t("PLUGINS.UPDATE_ALL_NOTICE", { count: hasUpdateAvailableCount })}</span>;
	};

	return (
		<EmptyBlock size="sm" className="mb-6">
			<div className="flex justify-between items-center w-full">
				{renderText()}

				<Button
					disabled={!hasCompatibleUpdateAvailableCount || isUpdatingAll}
					className="-mr-1"
					data-testid="PluginManager__update-all"
					onClick={onUpdateAll}
				>
					{isUpdatingAll ? t("COMMON.UPDATING") : t("PLUGINS.UPDATE_ALL")}
				</Button>
			</div>
		</EmptyBlock>
	);
};

export const PluginManager = () => {
	const { t } = useTranslation();
	const {
		allPlugins,
		isFetchingPackages,
		trigger,
		updatingStats,
		filters,
		filterBy,
		fetchPluginPackages,
		hasFilters,
		searchResults,
		resetFilters,
	} = usePluginManagerContext();

	const activeProfile = useActiveProfile();
	const history = useHistory();
	const { pluginManager, mapConfigToPluginData, updatePlugin } = usePluginManagerContext();
	const { persist } = useEnvironmentContext();
	const { startUpdate, isUpdating: isUpdatingAll } = usePluginUpdateQueue(activeProfile);

	const [currentViewValue, setCurrentViewValue] = useState("latest");
	const [viewType, setViewType] = useState("grid");

	const currentView = useMemo(() => {
		if (hasFilters) {
			return "search";
		}
		return currentViewValue;
	}, [currentViewValue, hasFilters]);

	const [isOpenDisclaimer, setIsOpenDisclaimer] = useState(false);

	const [updatesConfirmationPlugins, setUpdatesConfirmationPlugins] = useState<any[]>([]);
	const [isManualInstallModalOpen, setIsManualInstallModalOpen] = useState(false);
	const [uninstallSelectedPlugin, setUninstallSelectedPlugin] = useState<IPluginController | undefined>(undefined);
	const [installSelectedPlugin, setInstallSelectedPlugin] = useState<
		ExtendedSerializedPluginConfigurationData | undefined
	>(undefined);

	const plugins = allPlugins.map(mapConfigToPluginData.bind(undefined, activeProfile));
	const searchResultsData = searchResults.map(mapConfigToPluginData.bind(undefined, activeProfile));

	const useCompactTables = !activeProfile.appearance().get("useExpandedTables");

	const updateCounts = {
		available: 0,
		compatible: 0,
	};

	for (const plugin of plugins) {
		if (plugin.updateStatus.isAvailable) {
			updateCounts.available++;
		}

		if (plugin.updateStatus.isCompatible) {
			updateCounts.compatible++;
		}
	}

	const { available: hasUpdateAvailableCount, compatible: hasCompatibleUpdateAvailableCount } = updateCounts;

	const pluginsByCategory = useMemo(() => {
		const result: Record<string, ExtendedSerializedPluginConfigurationData[]> = {};

		for (const plugin of plugins) {
			/* istanbul ignore else */
			if (!result[plugin.category]) {
				result[plugin.category] = [];
			}

			result[plugin.category].push(plugin);
		}

		return result;
	}, [plugins]);

	useEffect(() => {
		fetchPluginPackages();
	}, [fetchPluginPackages]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const filteredPackages = useMemo(() => pluginsByCategory[currentView] || [], [currentView, pluginsByCategory]);

	const installedPlugins = pluginManager
		.plugins()
		.all()
		.map((item) => item.config())
		.map(mapConfigToPluginData.bind(undefined, activeProfile));

	const setCurrentView = (value: string) => {
		resetFilters();
		setCurrentViewValue(value);
	};

	const handleSelectPlugin = (pluginData: any) =>
		history.push(`/profiles/${activeProfile.id()}/plugins/details?pluginId=${pluginData.id}`);

	const handleEnablePlugin = async (plugin: ExtendedSerializedPluginConfigurationData) => {
		const pluginController = pluginManager.plugins().findById(plugin.id);

		assertPluginController(pluginController);

		try {
			pluginController.enable(activeProfile, { autoRun: true });
			await persist();
			toasts.success(t("PLUGINS.ENABLE_SUCCESS", { name: plugin.title }));
		} catch (error) {
			toasts.error(t("PLUGINS.ENABLE_FAILURE", { msg: error.message, name: plugin.title }));
		}
	};

	const handleDisablePlugin = async (plugin: ExtendedSerializedPluginConfigurationData) => {
		const pluginController = pluginManager.plugins().findById(plugin.id);

		assertPluginController(pluginController);

		pluginController.disable(activeProfile);
		await persist();
	};

	const handleDeletePlugin = (plugin: ExtendedSerializedPluginConfigurationData) => {
		setUninstallSelectedPlugin(pluginManager.plugins().findById(plugin.id));
	};

	const handleLaunchPlugin = (plugin: ExtendedSerializedPluginConfigurationData) => {
		history.push(`/profiles/${activeProfile.id()}/plugins/view?pluginId=${plugin.id}`);
	};

	const handleManualInstall = ({ pluginId, repositoryURL }: { pluginId: string; repositoryURL: string }) => {
		setIsManualInstallModalOpen(false);
		history.push(
			`/profiles/${activeProfile.id()}/plugins/details?pluginId=${pluginId}&repositoryURL=${repositoryURL}`,
		);
	};

	const handleUpdate = (plugin: ExtendedSerializedPluginConfigurationData) => {
		updatePlugin(plugin, activeProfile.id());
	};

	const openInstallPluginModal = (pluginData: ExtendedSerializedPluginConfigurationData) => {
		setInstallSelectedPlugin(pluginData);
	};

	const openManualInstallPluginModal = () => {
		const shouldShowDisclaimer = !activeProfile.hasAcceptedManualInstallationDisclaimer();

		if (shouldShowDisclaimer) {
			setIsOpenDisclaimer(true);
		} else {
			setIsManualInstallModalOpen(true);
		}
	};

	const handleDisclaimer = (isAccepted: boolean, rememberChoice?: boolean) => {
		setIsOpenDisclaimer(false);

		if (isAccepted) {
			setIsManualInstallModalOpen(true);

			if (rememberChoice) {
				activeProfile.markManualInstallationDisclaimerAsAccepted();
			}
		}
	};

	const onDeletePlugin = () => {
		setUninstallSelectedPlugin(undefined);
		trigger();
	};

	const viewPlugins = useMemo(() => {
		const views = {
			all: () => plugins,
			default: () => filteredPackages,
			"my-plugins": () => installedPlugins,
			search: () => searchResultsData,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (views[currentView as keyof typeof views] || views.default)();
	}, [currentView, installedPlugins, plugins, filteredPackages, searchResultsData]);

	const handleUpdateAll = () => {
		const pluginsWithAvailableUpdate = plugins.filter((item) => item.updateStatus.isAvailable);
		setUpdatesConfirmationPlugins(pluginsWithAvailableUpdate);
	};

	const handleUpdateConfirmation = () => {
		const pluginsWithCompatibleUpdate = updatesConfirmationPlugins.filter((item) => item.updateStatus.isCompatible);

		setUpdatesConfirmationPlugins([]);

		startUpdate(pluginsWithCompatibleUpdate);
	};

	const menu = (["latest", "all", ...PLUGIN_CATEGORIES] as const).map((name) => {
		const menuItem: PluginManagerNavigationBarItem = {
			name,
			title: t(`PLUGINS.PAGE_PLUGIN_MANAGER.VIEW.${name.toUpperCase()}`),
		};

		if (name !== "latest" && name !== "all") {
			menuItem.count = allPlugins.filter((package_) => package_.hasCategory(name)).length;
		}

		return menuItem;
	});

	const emptyMessage = useMemo(() => {
		if (currentView === "my-plugins") {
			return t("PLUGINS.PAGE_PLUGIN_MANAGER.NO_PLUGINS_INSTALLED");
		}

		if (currentView === "search") {
			return t("PLUGINS.PAGE_PLUGIN_MANAGER.NO_PLUGINS_FOUND", {
				query: filters.query,
			});
		}
	}, [currentView, filters.query, t]);

	return (
		<>
			<Page isBackDisabled={true}>
				<Section>
					<Header
						title={t("PLUGINS.PAGE_PLUGIN_MANAGER.TITLE")}
						subtitle={t("PLUGINS.PAGE_PLUGIN_MANAGER.DESCRIPTION")}
						extra={
							<div className="flex justify-end items-top text-theme-primary-200">
								<HeaderSearchBar
									defaultQuery={filters.query}
									label={t("COMMON.SEARCH")}
									onSearch={(query) => {
										filterBy({ query });
									}}
									resetFields={filters.query === ""}
								/>

								<div className="pl-8 my-auto ml-5 h-10 border-l border-theme-secondary-300 dark:border-theme-secondary-800" />

								<Button
									data-testid="PluginManager_header--install"
									onClick={openManualInstallPluginModal}
								>
									<div className="flex items-center space-x-2 whitespace-nowrap">
										<Icon name="File" />
										<span>{t("PLUGINS.MODAL_MANUAL_INSTALL_PLUGIN.TITLE")}</span>
									</div>
								</Button>
							</div>
						}
					/>
				</Section>

				<PluginManagerNavigationBar
					hasUpdatesAvailable={hasUpdateAvailableCount > 0}
					installedPluginsCount={installedPlugins.length}
					menu={menu}
					selectedView={currentView}
					selectedViewType={viewType}
					onChange={setCurrentView}
					onSelectGridView={() => setViewType("grid")}
					onSelectListView={() => setViewType("list")}
				/>

				{currentView === "latest" && (
					<LatestPlugins
						isLoading={isFetchingPackages}
						updatingStats={updatingStats}
						viewType={viewType}
						pluginsByCategory={pluginsByCategory}
						onCurrentViewChange={setCurrentView}
						onInstall={openInstallPluginModal}
						onEnable={handleEnablePlugin}
						onDisable={handleDisablePlugin}
						onDelete={handleDeletePlugin}
						onSelect={handleSelectPlugin}
						onLaunch={handleLaunchPlugin}
						onUpdate={handleUpdate}
						isCompact={useCompactTables}
					/>
				)}

				<Section>
					{currentView !== "latest" && (
						<>
							<h2 className="mb-6 font-bold">
								{t(`PLUGINS.PAGE_PLUGIN_MANAGER.VIEW.${snakeCase(currentView)?.toUpperCase()}` as any)}
							</h2>

							{currentView === "my-plugins" && (
								<UpdateAllBanner
									hasUpdateAvailableCount={hasUpdateAvailableCount}
									hasCompatibleUpdateAvailableCount={hasCompatibleUpdateAvailableCount}
									isUpdatingAll={isUpdatingAll}
									onUpdateAll={handleUpdateAll}
								/>
							)}

							<div data-testid={`PluginManager__container--${currentView}`}>
								{viewType === "grid" && (
									<PluginGrid
										plugins={viewPlugins}
										updatingStats={updatingStats}
										emptyMessage={emptyMessage}
										isLoading={isFetchingPackages}
										onDelete={handleDeletePlugin}
										onDisable={handleDisablePlugin}
										onEnable={handleEnablePlugin}
										onInstall={openInstallPluginModal}
										onLaunch={handleLaunchPlugin}
										onSelect={handleSelectPlugin}
										onUpdate={handleUpdate}
									/>
								)}

								{viewType === "list" && (
									<PluginList
										emptyMessage={emptyMessage}
										onUpdate={handleUpdate}
										plugins={viewPlugins}
										showCategory={["my-plugins", "search", "all"].includes(currentView)}
										updatingStats={updatingStats}
										onClick={handleSelectPlugin}
										onDelete={handleDeletePlugin}
										onDisable={handleDisablePlugin}
										onEnable={handleEnablePlugin}
										onInstall={openInstallPluginModal}
										onLaunch={handleLaunchPlugin}
										isCompact={useCompactTables}
									/>
								)}
							</div>
						</>
					)}
				</Section>
			</Page>

			<ManualInstallationDisclaimer
				isOpen={isOpenDisclaimer}
				onClose={() => handleDisclaimer(false)}
				onDecline={() => handleDisclaimer(false)}
				onAccept={(rememberChoice) => handleDisclaimer(true, rememberChoice)}
			/>

			{installSelectedPlugin && (
				<InstallPlugin
					profile={activeProfile}
					plugin={installSelectedPlugin}
					isOpen={true}
					onClose={() => setInstallSelectedPlugin(undefined)}
					onCancel={() => setInstallSelectedPlugin(undefined)}
				/>
			)}

			<PluginManualInstallModal
				isOpen={isManualInstallModalOpen}
				onClose={() => setIsManualInstallModalOpen(false)}
				onSuccess={handleManualInstall}
			/>

			<PluginUpdatesConfirmation
				isOpen={updatesConfirmationPlugins.length > 0}
				plugins={updatesConfirmationPlugins}
				onClose={() => setUpdatesConfirmationPlugins([])}
				onContinue={handleUpdateConfirmation}
			/>

			{uninstallSelectedPlugin && (
				<PluginUninstallConfirmation
					isOpen={true}
					plugin={uninstallSelectedPlugin}
					profile={activeProfile}
					onClose={() => setUninstallSelectedPlugin(undefined)}
					onDelete={onDeletePlugin}
				/>
			)}
		</>
	);
};
