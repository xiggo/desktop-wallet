import { EmptyBlock } from "app/components/EmptyBlock";
import React from "react";
import { useTranslation } from "react-i18next";

import { ExchangeCard } from "../ExchangeCard";

interface ExchangeGridProperties {
	exchanges: any[];
	onClick: any;
	onDelete: any;
	onOpenDetails: any;
}

export const ExchangeGrid = ({ exchanges, onClick, onDelete, onOpenDetails }: ExchangeGridProperties) => {
	const { t } = useTranslation();

	const actions = [
		{ label: t("COMMON.DETAILS"), value: "open-details" },
		{ label: t("COMMON.DELETE"), value: "delete" },
	];

	const handleExchangeAction = (exchange: any, action: any) => {
		switch (action?.value) {
			case "delete":
				onDelete(exchange);
				break;
			case "open-details":
				onOpenDetails(exchange);
				break;
		}
	};

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
				<ExchangeCard
					key={exchange.id}
					actions={actions}
					exchange={exchange}
					onClick={() => onClick(exchange)}
					onSelect={(action: any) => handleExchangeAction(exchange, action)}
				/>
			))}
		</div>
	);
};
