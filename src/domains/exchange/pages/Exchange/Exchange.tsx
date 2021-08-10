import { Header } from "app/components/Header";
import { Page, Section } from "app/components/Layout";
import { useActiveProfile } from "app/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { ExchangeGrid } from "../../components/ExchangeGrid";

export const Exchange = () => {
	const activeProfile = useActiveProfile();
	const history = useHistory();

	const { t } = useTranslation();

	const exchanges: any[] = [];

	/* istanbul ignore next */
	const handleLaunchExchange = (exchange: any) => {
		history.push(`/profiles/${activeProfile.id()}/exchange/view?exchangeId=${exchange.id}`);
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
					<ExchangeGrid exchanges={exchanges} onClick={handleLaunchExchange} />
				</Section>
			</Page>
		</>
	);
};
