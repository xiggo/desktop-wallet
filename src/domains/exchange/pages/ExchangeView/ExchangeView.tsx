import { Image } from "app/components/Image";
import { Page } from "app/components/Layout";
import { Spinner } from "app/components/Spinner";
import { useQueryParams } from "app/hooks";
import cn from "classnames";
import { ExchangeForm } from "domains/exchange/components/ExchangeForm";
import { useExchangeContext } from "domains/exchange/contexts/Exchange";
import { Exchange } from "domains/exchange/contracts";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { shouldUseDarkColors } from "utils/electron-utils";

export const ExchangeView = () => {
	const queryParameters = useQueryParams();

	const [logoUrl, setLogoUrl] = useState<string>();
	const [isReady, setIsReady] = useState<boolean>(false);

	const { provider: exchangeProvider, exchangeProviders, setProvider } = useExchangeContext();

	const exchangeId = queryParameters.get("exchangeId");
	const orderId = queryParameters.get("orderId") || undefined;

	useEffect(() => {
		const exchange = exchangeProviders?.find((exchange: Exchange) => exchange.slug === exchangeId);

		if (exchange) {
			setProvider(exchange);
		}
	}, [exchangeId, exchangeProviders, setProvider]);

	useLayoutEffect(() => {
		if (exchangeProvider) {
			/* istanbul ignore else */
			if (shouldUseDarkColors()) {
				setLogoUrl(exchangeProvider.logo.dark);
			} else {
				setLogoUrl(exchangeProvider.logo.light);
			}
		}
	}, [exchangeProvider]);

	const renderSpinner = () => {
		if (exchangeProvider !== undefined && !isReady) {
			return <Spinner size="lg" />;
		}

		return <></>;
	};

	const renderExchange = () => (
		<>
			<div className="h-25 mx-auto mb-8">
				{logoUrl && (
					<img
						src={logoUrl}
						alt={`${exchangeProvider?.name} Header Logo`}
						className="object-cover w-full h-full"
					/>
				)}
			</div>

			{!!exchangeProvider && <ExchangeForm orderId={orderId} onReady={() => setIsReady(true)} />}
		</>
	);

	return (
		<Page>
			<div className="flex flex-col items-center justify-center relative flex-1 w-full h-full py-20">
				<div className="absolute inset-0 flex items-center p-32" style={{ backgroundColor: "#3f4455" }}>
					<Image name="WorldMap" className="w-full h-full" />
				</div>

				{renderSpinner()}

				<div
					className={cn(
						"w-full max-w-3xl relative flex-col p-10 shadow-2xl rounded-2.5xl bg-theme-background",
						isReady ? "flex" : "hidden",
					)}
				>
					{renderExchange()}
				</div>
			</div>
		</Page>
	);
};
