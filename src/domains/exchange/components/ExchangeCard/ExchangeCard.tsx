import { Card } from "app/components/Card";
import cn from "classnames";
import { Exchange } from "domains/exchange/contracts";
import React from "react";

interface ExchangeCardProperties {
	exchange: Exchange;
	onClick: any;
}

export const ExchangeCard = ({ exchange, onClick }: ExchangeCardProperties) => (
	<div data-testid={`ExchangeCard--${exchange.slug}`}>
		<Card onClick={exchange.isActive ? onClick : undefined}>
			<div className="flex items-center space-x-3">
				<div className="overflow-hidden flex-shrink-0 rounded-lg w-11 h-11">
					<img
						src={exchange.logo.thumbnail}
						alt={`${exchange.name} Logo`}
						className="object-cover w-full h-full"
					/>
				</div>

				<div className="flex flex-col truncate">
					<div
						className={cn(
							"truncate font-semibold text-lg",
							exchange.isActive ? "link" : "text-theme-primary-100 dark:text-theme-secondary-800",
						)}
					>
						{exchange.name}
					</div>
				</div>
			</div>
		</Card>
	</div>
);
