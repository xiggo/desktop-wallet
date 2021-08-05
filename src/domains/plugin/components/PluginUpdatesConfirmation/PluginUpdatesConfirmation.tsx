import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { Image } from "app/components/Image";
import { Modal } from "app/components/Modal";
import { Table, TableCell, TableRow } from "app/components/Table";
import { Tooltip } from "app/components/Tooltip";
import { usePluginIcon } from "domains/plugin/hooks/use-plugin-icon";
import { ExtendedSerializedPluginConfigurationData } from "plugins/types";
import React from "react";
import { useTranslation } from "react-i18next";

import { PluginImage } from "../PluginImage";

interface Properties {
	isOpen: boolean;
	plugins: ExtendedSerializedPluginConfigurationData[];
	onClose?: () => void;
	onContinue?: () => void;
}

export const PluginUpdatesConfirmation = ({ isOpen, plugins, onClose, onContinue }: Properties) => {
	const { t } = useTranslation();

	const { renderPluginIcon } = usePluginIcon();

	const columns = [
		{
			Header: t("COMMON.NAME"),
			accessor: "name",
		},
		{
			Header: t("PLUGINS.STATUS.COMPATIBLE"),
			accessor: "updateStatus.isCompatible",
			cellWidth: "w-30",
			className: "justify-center",
			disableSortBy: true,
		},
		{
			Header: t("PLUGINS.REQUIRED_VERSION"),
			accessor: "updateStatus.minimumVersion",
			cellWidth: "w-36",
			className: "justify-end whitespace-nowrap",
		},
	];

	const initialState = {
		sortBy: [
			{
				id: "name",
			},
		],
	};

	const renderCompatibilityIcon = ({ updateStatus }: ExtendedSerializedPluginConfigurationData) => {
		if (updateStatus.isCompatible) {
			return (
				<Tooltip content={t("PLUGINS.STATUS.COMPATIBLE")}>
					<div data-testid="PluginUpdates__compatible" className="mx-auto text-2xl text-theme-success-500">
						<Icon name="StatusOk" size="lg" />
					</div>
				</Tooltip>
			);
		}

		return (
			<Tooltip content={t("PLUGINS.STATUS.INCOMPATIBLE")}>
				<div data-testid="PluginUpdates__incompatible" className="mx-auto text-2xl text-theme-danger-400">
					<Icon name="StatusFailed" size="lg" />
				</div>
			</Tooltip>
		);
	};

	return (
		<Modal
			title={t("PLUGINS.MODAL_UPDATES_CONFIRMATION.TITLE")}
			image={<Image name="GenericWarning" className="m-auto my-8 w-3/5" />}
			description={t("PLUGINS.MODAL_UPDATES_CONFIRMATION.DESCRIPTION")}
			isOpen={isOpen}
			onClose={onClose}
		>
			<div data-testid="PluginUpdatesConfirmation" className="mt-5">
				<Table data={plugins} columns={columns} initialState={initialState}>
					{(pluginData: ExtendedSerializedPluginConfigurationData) => (
						<TableRow>
							<TableCell variant="start" innerClassName="space-x-4">
								<PluginImage
									logoURL={pluginData.logo}
									isExchange={pluginData.category === "exchange"}
									size="xs"
								/>

								<div className="flex items-center space-x-2">
									<span
										data-testid="PluginUpdates__title"
										className="font-semibold link max-w-60 truncate"
									>
										{pluginData.title}
									</span>

									{renderPluginIcon({ isOfficial: pluginData.isOfficial })}
								</div>
							</TableCell>

							<TableCell>{renderCompatibilityIcon(pluginData)}</TableCell>

							<TableCell variant="end" innerClassName="justify-end">
								<span data-testid="PluginUpdates__minimum-version">
									{pluginData.updateStatus.minimumVersion}
								</span>
							</TableCell>
						</TableRow>
					)}
				</Table>

				<div className="flex justify-end mt-8 space-x-3">
					<Button variant="secondary" onClick={onClose} data-testid="PluginUpdates__cancel-button">
						{t("COMMON.CANCEL")}
					</Button>

					<Button onClick={onContinue} data-testid="PluginUpdates__continue-button">
						<span>{t("COMMON.CONTINUE")}</span>
					</Button>
				</div>
			</div>
		</Modal>
	);
};

PluginUpdatesConfirmation.defaultProps = {
	isOpen: false,
};
