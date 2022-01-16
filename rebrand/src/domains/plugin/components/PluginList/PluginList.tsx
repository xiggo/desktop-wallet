import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Pagination } from "@/app/components/Pagination";
import { Table } from "@/app/components/Table";
import { PluginListItem } from "@/domains/plugin/components/PluginListItem";

interface PluginListProperties {
	className?: string;
	emptyMessage?: string;
	plugins: any[];
	pluginsPerPage?: number;
	showCategory?: boolean;
	showPagination?: boolean;
	updatingStats?: any;
	onClick?: (plugin: any) => void;
	onDelete: any;
	onDisable?: (plugin: any) => void;
	onEnable?: (plugin: any) => void;
	onInstall: any;
	onLaunch?: (plugin: any) => void;
	onUpdate?: (plugin: any) => void;
	isCompact?: boolean;
}

export const PluginList = ({
	className,
	emptyMessage,
	plugins,
	pluginsPerPage = 10,
	showCategory,
	showPagination = true,
	updatingStats,
	onClick,
	onDelete,
	onDisable,
	onEnable,
	onInstall,
	onLaunch,
	onUpdate,
	isCompact = false,
}: PluginListProperties) => {
	const { t } = useTranslation();

	const [currentPage, setCurrentPage] = React.useState(1);

	const initialState = {
		sortBy: [
			{
				id: "title",
			},
		],
	};

	const columns = [
		{
			Header: t("COMMON.NAME"),
			accessor: "title",
		},
		{
			Header: t("COMMON.AUTHOR"),
			accessor: "author",
			cellWidth: "w-56",
		},
		{
			Header: t("COMMON.VERSION"),
			accessor: "version",
			cellWidth: "w-36",
		},
		{
			Header: t("COMMON.SIZE"),
			accessor: "size",
			cellWidth: "w-24",
		},
		{
			Header: t("COMMON.STATUS"),
			accessor: "isInstalled",
			cellWidth: "w-20",
			className: "justify-center",
			disableSortBy: true,
		},
		{
			Header: "Actions",
			cellWidth: "w-44",
			className: "hidden no-border",
			disableSortBy: true,
		},
	];

	if (showCategory) {
		columns.splice(2, 0, {
			Header: t("COMMON.CATEGORY"),
			accessor: "category",
			cellWidth: "w-36",
		});
	}

	if (plugins.length === 0) {
		return (
			<EmptyBlock data-testid="PluginList__empty-message">
				<Trans>{emptyMessage || t("PLUGINS.PAGE_PLUGIN_MANAGER.NO_PLUGINS_AVAILABLE")}</Trans>
			</EmptyBlock>
		);
	}

	return (
		<div data-testid="PluginList" className={className}>
			<Table
				columns={columns}
				data={plugins}
				initialState={initialState}
				rowsPerPage={pluginsPerPage}
				currentPage={currentPage}
			>
				{(plugin: any) => (
					<PluginListItem
						plugin={plugin}
						onClick={onClick}
						onLaunch={onLaunch}
						onInstall={onInstall}
						onDelete={onDelete}
						onEnable={onEnable}
						onDisable={onDisable}
						onUpdate={onUpdate}
						isUpdating={plugin && updatingStats?.[plugin.id]?.percent !== undefined}
						updatingProgress={plugin && updatingStats?.[plugin.id]?.percent}
						showCategory={showCategory}
						isCompact={isCompact}
					/>
				)}
			</Table>

			{showPagination && (
				<div className="flex justify-center mt-10 w-full">
					<Pagination
						currentPage={currentPage}
						itemsPerPage={pluginsPerPage}
						totalCount={plugins.length}
						onSelectPage={setCurrentPage}
					/>
				</div>
			)}
		</div>
	);
};
