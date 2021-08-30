import { Contracts } from "@payvo/profiles";
import { Button } from "app/components/Button";
import { Modal } from "app/components/Modal";
import { TabPanel, Tabs } from "app/components/Tabs";
import { toasts } from "app/services";
import { ipcRenderer } from "electron";
import { usePluginManagerContext } from "plugins/context/PluginManagerProvider";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { FirstStep } from "./Step1";
import { SecondStep } from "./Step2";
import { ThirdStep } from "./Step3";

interface InstallPluginProperties {
	isOpen: boolean;
	onClose?: () => void;
	onCancel?: () => void;
	plugin?: any;
	repositoryURL?: string;
	profile: Contracts.IProfile;
}

enum Step {
	PermissionsStep = 1,
	DownloadStep,
	InstallStep,
}

export const InstallPlugin = ({
	isOpen,
	onClose,
	onCancel,
	plugin,
	profile,
	repositoryURL,
}: InstallPluginProperties) => {
	const { t } = useTranslation();
	const { downloadPlugin, installPlugin } = usePluginManagerContext();
	const [activeStep, setActiveStep] = useState<Step>(Step.PermissionsStep);
	const [downloadProgress, setDownloadProgress] = useState<any>({ totalBytes: 0 });
	const [savedPath, setSavedPath] = useState<string>();
	const profileId = profile.id();

	const handleDownload = useCallback(async () => {
		setActiveStep(Step.DownloadStep);

		try {
			const savedPath = await downloadPlugin(plugin, repositoryURL);
			setSavedPath(savedPath);
			setTimeout(() => setActiveStep(Step.InstallStep), 500); // Animation delay
		} catch {
			toasts.error(t("PLUGINS.MODAL_INSTALL_PLUGIN.DOWNLOAD_FAILURE", { name: plugin.title }));
			onClose?.();
		}
	}, [downloadPlugin, plugin, onClose, repositoryURL, t]);

	const handleInstall = useCallback(async () => {
		try {
			await installPlugin(savedPath, plugin.id, profileId);
			toasts.success(t("PLUGINS.MODAL_INSTALL_PLUGIN.SUCCESS", { name: plugin.title }));
		} catch (error) {
			/* istanbul ignore next */
			toasts.error(t("PLUGINS.MODAL_INSTALL_PLUGIN.INSTALL_FAILURE", { msg: error.message, name: plugin.title }));
		} finally {
			onClose?.();
		}
	}, [installPlugin, plugin, onClose, savedPath, t, profileId]);

	const onModalClose = () => {
		if (activeStep === Step.InstallStep) {
			ipcRenderer.invoke("plugin:cancel-install", { savedPath });
			setActiveStep(Step.PermissionsStep);
			setSavedPath(undefined);
		}

		onClose?.();
	};

	useEffect(() => {
		// @ts-ignore
		const listener = (_, value: any) => setDownloadProgress(value);
		ipcRenderer.on("plugin:download-progress", listener);

		return () => {
			ipcRenderer.removeListener("plugin:download-progress", listener);
		};
	}, []);

	return (
		<Modal
			title={t(activeStep === Step.PermissionsStep ? "COMMON.ATTENTION" : "COMMON.DOWNLOADING")}
			size="lg"
			isOpen={isOpen}
			onClose={onModalClose}
		>
			<Tabs activeId={activeStep}>
				<TabPanel tabId={Step.PermissionsStep}>
					<FirstStep plugin={plugin} />
				</TabPanel>

				<TabPanel tabId={Step.DownloadStep}>
					<SecondStep plugin={plugin} downloadProgress={downloadProgress} />
				</TabPanel>

				<TabPanel tabId={Step.InstallStep}>
					<ThirdStep plugin={plugin} />
				</TabPanel>

				<div className="flex justify-end mt-8 space-x-3">
					{activeStep === Step.PermissionsStep && (
						<>
							<Button variant="secondary" onClick={onCancel} data-testid="InstallPlugin__cancel-button">
								{t("COMMON.CANCEL")}
							</Button>
							<Button onClick={handleDownload} data-testid="InstallPlugin__download-button">
								{t("COMMON.DOWNLOAD")}
							</Button>
						</>
					)}

					{activeStep === Step.InstallStep && (
						<>
							<Button
								variant="secondary"
								onClick={() => {
									ipcRenderer.invoke("plugin:cancel-install", { savedPath });
									setActiveStep(Step.PermissionsStep);
									setSavedPath(undefined);

									onCancel?.();
								}}
								data-testid="InstallPlugin__cancel-button"
							>
								{t("COMMON.CANCEL")}
							</Button>

							<Button onClick={handleInstall} data-testid="InstallPlugin__install-button">
								{t("COMMON.INSTALL")}
							</Button>
						</>
					)}
				</div>
			</Tabs>
		</Modal>
	);
};
