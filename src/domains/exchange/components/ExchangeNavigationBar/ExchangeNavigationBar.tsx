import React from "react";
import { useTranslation } from "react-i18next";
import { styled } from "twin.macro";

import { defaultStyle } from "./styles";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";

enum ExchangeView {
	Exchanges = "EXCHANGES",
	Transactions = "TRANSACTIONS",
}

const NavWrapper = styled.nav`
	${defaultStyle}
`;

interface ExchangeNavigationBarProperties {
	currentView: ExchangeView;
	exchangeTransactionsCount: number;
	onChange: (view: any) => void;
}

export const ExchangeNavigationBar = ({
	currentView,
	exchangeTransactionsCount,
	onChange,
}: ExchangeNavigationBarProperties) => {
	const { t } = useTranslation();

	return (
		<NavWrapper>
			<div className="container flex justify-between items-center px-10 mx-auto">
				<Tabs activeId={currentView} className="-mx-6 w-full" onChange={onChange}>
					<TabList className="w-full h-18" noBackground>
						<Tab tabId={ExchangeView.Exchanges}>{t("EXCHANGE.NAVIGATION.EXCHANGES")}</Tab>

						<Tab tabId={ExchangeView.Transactions} count={exchangeTransactionsCount}>
							{t("EXCHANGE.NAVIGATION.TRANSACTIONS")}
						</Tab>
					</TabList>
				</Tabs>
			</div>
		</NavWrapper>
	);
};
