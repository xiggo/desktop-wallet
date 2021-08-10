import { Card } from "app/components/Card";
import React from "react";

interface ExchangeCardProperties {
	exchange: any;
	onClick: any;
}

export const ExchangeCard = ({ exchange, onClick }: ExchangeCardProperties) => (
	<div data-testid={`ExchangeCard--${exchange.id}`}>
		<Card onClick={onClick}>
			<div className="flex items-center space-x-3">
				<div className="overflow-hidden flex-shrink-0 rounded-lg w-11 h-11">
					<img src={exchange.logo} alt={`${exchange.name} Logo`} className="object-cover w-full h-full" />
				</div>

				<div className="flex flex-col truncate">
					<div className="truncate link font-semibold text-lg">{exchange.name}</div>
				</div>
			</div>
		</Card>
	</div>
);
