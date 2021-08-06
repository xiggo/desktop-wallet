import { Header } from "app/components/Header";
import { Page, Section } from "app/components/Layout";
import { useActiveProfile } from "app/hooks";
import { PluginUninstallConfirmation } from "domains/plugin/components/PluginUninstallConfirmation/PluginUninstallConfirmation";
import { PluginController } from "plugins";
import { usePluginManagerContext } from "plugins/context/PluginManagerProvider";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { ExchangeGrid } from "../../components/ExchangeGrid";

export const Exchange = () => {
	const activeProfile = useActiveProfile();
	const history = useHistory();

	const [selectedExchange, setSelectedExchange] = useState<PluginController | undefined>(undefined);

	const { mapConfigToPluginData, pluginManager } = usePluginManagerContext();

	const { t } = useTranslation();

	const installedPlugins = pluginManager
		.plugins()
		.all()
		.map((item) => item.config())
		.map(mapConfigToPluginData.bind(null, activeProfile));

	const exchanges = installedPlugins.filter((plugin) => plugin.category === "exchange" && plugin.isEnabled);

	if (exchanges.length === 0 || exchanges.length < 3) {
		exchanges.push(...new Array(3 - exchanges.length).fill(undefined));
	}

	const handleLaunchExchange = (exchange: any) => {
		history.push(`/profiles/${activeProfile.id()}/exchange/view?pluginId=${exchange.id}`);
	};

	const handleDeleteExchange = (exchange: any) => {
		setSelectedExchange(pluginManager.plugins().findById(exchange.id));
	};

	const handleOpenExchangeDetails = (exchange: any) => {
		history.push(`/profiles/${activeProfile.id()}/plugins/details?pluginId=${exchange.id}`);
	};

	return (
		<>
			<Page profile={activeProfile} isBackDisabled={true} data-testid="Exchange">
				<Section border>
					<Header
						title={t("EXCHANGE.PAGE_EXCHANGES.TITLE")}
						subtitle={t("EXCHANGE.PAGE_EXCHANGES.SUBTITLE")}
					/>
				</Section>

				<Section>
					<ExchangeGrid
						exchanges={exchanges}
						onClick={handleLaunchExchange}
						onDelete={handleDeleteExchange}
						onOpenDetails={handleOpenExchangeDetails}
					/>
				</Section>
			</Page>

			{selectedExchange && (
				<PluginUninstallConfirmation
					isOpen={true}
					plugin={selectedExchange}
					profile={activeProfile}
					onClose={() => setSelectedExchange(undefined)}
					onDelete={() => setSelectedExchange(undefined)}
				/>
			)}
		</>
	);
};
