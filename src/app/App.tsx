import "focus-visible";

// import { TRX } from "@payvo/sdk-trx";
// import { XLM } from "@payvo/sdk-xlm";
// import { XRP } from "@payvo/sdk-xrp";
// import { ZIL } from "@payvo/sdk-zil";
import LedgerTransportNodeHID from "@ledgerhq/hw-transport-node-hid-singleton";
// import { LUNA } from "@payvo/sdk-luna";
// import { NANO } from "@payvo/sdk-nano";
// import { NEO } from "@payvo/sdk-neo";
import { Environment } from "@payvo/profiles";
// import { ADA } from "@payvo/sdk-ada";
import { ARK } from "@payvo/sdk-ark";
// import { ATOM } from "@payvo/sdk-atom";
// import { AVAX } from "@payvo/sdk-avax";
// import { BTC } from "@payvo/sdk-btc";
// import { DOT } from "@payvo/sdk-dot";
// import { EGLD } from "@payvo/sdk-egld";
// import { ETH } from "@payvo/sdk-eth";
import { LSK } from "@payvo/sdk-lsk";
import { Offline } from "domains/error/pages";
import { Splash } from "domains/splash/pages";
import { usePluginManagerContext } from "plugins/context/PluginManagerProvider";
import React, { useLayoutEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary";
import { I18nextProvider } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { StubStorage } from "tests/mocks";
import { setThemeSource, shouldUseDarkColors } from "utils/electron-utils";
import { bootEnvWithProfileFixtures, isE2E, isUnit } from "utils/test-helpers";

import { middlewares, RouterView, routes } from "../router";
import { ConfigurationProvider, EnvironmentProvider, LedgerProvider, useEnvironmentContext } from "./contexts";
import { useDeeplink, useNetworkStatus, useProfileSynchronizer } from "./hooks";
import { i18n as index18n } from "./i18n";
import { PluginProviders } from "./PluginProviders";
import { SentryProvider } from "./sentry/SentryProvider";
import { SentryRouterWrapper } from "./sentry/SentryRouterWrapper";
import { httpClient } from "./services";

const RouteWrappers = ({ children }: { children: React.ReactNode }) => (
	<SentryRouterWrapper>{children}</SentryRouterWrapper>
);

const Main = () => {
	const [showSplash, setShowSplash] = useState(true);
	const { env } = useEnvironmentContext();
	const { loadPlugins } = usePluginManagerContext();
	const isOnline = useNetworkStatus();
	const history = useHistory();

	useProfileSynchronizer({
		onProfileRestoreError: () => history.push("/"),
	});

	useDeeplink();

	useLayoutEffect(() => {
		setThemeSource("system");

		document.body.classList.remove(`theme-${shouldUseDarkColors() ? "light" : "dark"}`);
		document.body.classList.add(`theme-${shouldUseDarkColors() ? "dark" : "light"}`);
	}, []);

	const handleError = useErrorHandler();

	useLayoutEffect(() => {
		const boot = async () => {
			try {
				/* istanbul ignore next */
				if (isE2E() || isUnit()) {
					await bootEnvWithProfileFixtures({ env, shouldRestoreDefaultProfile: isUnit() });

					loadPlugins();
					setShowSplash(false);
					return;
				}

				/* istanbul ignore next */
				await env.verify();
				/* istanbul ignore next */
				await env.boot();
				/* istanbul ignore next */
				await loadPlugins();
			} catch (error) {
				handleError(error);
			}

			setShowSplash(false);
		};

		boot();
	}, [env, handleError, loadPlugins]);

	const renderContent = () => {
		if (showSplash) {
			return <Splash />;
		}

		if (!isOnline) {
			return <Offline />;
		}

		return <RouterView routes={routes} middlewares={middlewares} wrapper={RouteWrappers} />;
	};

	return (
		<main data-testid="Main">
			<ToastContainer closeOnClick={false} newestOnTop />

			{renderContent()}
		</main>
	);
};

export const App = () => {
	/**
	 * Ensure that the Environment object will not be recreated when the state changes,
	 * as the data is stored in memory by the `DataRepository`.
	 */

	/* istanbul ignore next */
	const storage = isE2E() || isUnit() ? new StubStorage() : "indexeddb";

	const [environment] = useState(
		() =>
			new Environment({
				coins: {
					// ADA,
					ARK,
					// ATOM,
					// AVAX,
					// BTC,
					// DOT,
					// ETH,
					// EGLD,
					LSK,
					// NEO,
					// NANO,
					// LUNA,
					// TRX,
					// XLM,
					// XRP,
					// ZIL,
				},
				httpClient,
				storage,
			}),
	);

	return (
		<I18nextProvider i18n={index18n}>
			<EnvironmentProvider env={environment}>
				<ConfigurationProvider defaultConfiguration={{ profileIsSyncingExchangeRates: true }}>
					<SentryProvider>
						<LedgerProvider transport={LedgerTransportNodeHID}>
							<PluginProviders>
								<Main />
							</PluginProviders>
						</LedgerProvider>
					</SentryProvider>
				</ConfigurationProvider>
			</EnvironmentProvider>
		</I18nextProvider>
	);
};
