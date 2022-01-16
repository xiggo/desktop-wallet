import React from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";

interface Properties {
	isOpen: boolean;
	permissions: string[];
	onClose?: () => void;
}

export const PluginPermissionsModal = ({ isOpen, permissions, onClose }: Properties) => {
	const { t } = useTranslation();

	return (
		<Modal title={t("COMMON.PERMISSIONS")} isOpen={isOpen} onClose={onClose}>
			<section data-testid="PluginPermissionsModal">
				<p className="mt-4 text-lg font-semibold text-theme-secondary-text">
					{t("PLUGINS.MODAL_INSTALL_PLUGIN.DESCRIPTION")}
				</p>
				<div className="w-full">
					<ul className="mt-2 ml-5 leading-8 list-outside list-disc text-theme-secondary-text">
						{permissions.map((permission) => (
							<li key={permission}>{permission}</li>
						))}
					</ul>
				</div>
			</section>
		</Modal>
	);
};
