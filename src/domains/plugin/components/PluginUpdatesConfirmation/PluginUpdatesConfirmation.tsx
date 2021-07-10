import { Button } from "app/components/Button";
import { Image } from "app/components/Image";
import { Modal } from "app/components/Modal";
import { Table, TableCell, TableRow } from "app/components/Table";
import { usePluginIcon } from "domains/plugin/hooks/use-plugin-icon";
import React from "react";
import { useTranslation } from "react-i18next";

import { PluginImage } from "../PluginImage";

interface Properties {
	isOpen: boolean;
	plugins: any[];
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
			Header: t("PLUGINS.REQUIRED_VERSION"),
			accessor: "minimumVersion",
			className: "justify-end",
		},
	];

	return (
		<Modal
			title={t("PLUGINS.MODAL_UPDATES_CONFIRMATION.TITLE")}
			image={<Image name="GenericWarning" className="m-auto my-8 w-3/5" />}
			description={t("PLUGINS.MODAL_UPDATES_CONFIRMATION.DESCRIPTION")}
			size="xl"
			isOpen={isOpen}
			onClose={onClose}
		>
			<div data-testid="PluginUpdatesConfirmation" className="mt-5">
				<Table data={plugins} columns={columns}>
					{(pluginData: any) => (
						<TableRow>
							<TableCell variant="start" innerClassName="space-x-4" style={{ width: "70%" }}>
								<PluginImage
									logoURL={pluginData.logo}
									isExchange={pluginData.category === "exchange"}
									size="sm"
								/>

								<div className="flex items-center space-x-2">
									<span
										data-testid="PluginUpdates__title"
										className="flex items-center font-semibold link important:px-0"
									>
										{pluginData.title}
									</span>

									{renderPluginIcon({
										isGrant: pluginData.isGrant,
										isOfficial: pluginData.isOfficial,
									})}
								</div>
							</TableCell>

							<TableCell variant="end" innerClassName="justify-end">
								<span data-testid="PluginUpdates__minimum-version">{pluginData.minimumVersion}</span>
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
