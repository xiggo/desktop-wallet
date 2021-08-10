import { EmptyBlock } from "app/components/EmptyBlock";
import React from "react";
import { useTranslation } from "react-i18next";

import { ExchangeCard } from "../ExchangeCard";

interface ExchangeGridProperties {
	exchanges: any[];
	onClick: (exchange: any) => void;
}

export const ExchangeGrid = ({ exchanges, onClick }: ExchangeGridProperties) => {
	const { t } = useTranslation();

	if (exchanges.length === 0) {
		return (
			<EmptyBlock data-testid="ExchangeGrid__empty-message">
				{t("EXCHANGE.PAGE_EXCHANGES.EMPTY_MESSAGE")}
			</EmptyBlock>
		);
	}

	return (
		<div data-testid="ExchangeGrid" className="grid grid-cols-3 w-full gap-4.5">
			{exchanges.map((exchange: any) => (
				<ExchangeCard key={exchange.id} exchange={exchange} onClick={() => onClick(exchange)} />
			))}
		</div>
	);
};
