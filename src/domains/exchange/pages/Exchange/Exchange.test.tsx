/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/profiles";
import { translations as commonTranslations } from "app/i18n/common/i18n";
import { translations as pluginTranslations } from "domains/plugin/i18n";
import { createMemoryHistory } from "history";
import { LaunchPluginService, PluginController } from "plugins";
import React from "react";
import { Route } from "react-router-dom";
import { env, fireEvent, getDefaultProfileId, pluginManager, renderWithRouter, waitFor, within } from "testing-library";

import { translations } from "../../i18n";
import { Exchange } from "./Exchange";

let profile: Contracts.IProfile;
const history = createMemoryHistory();

const exchangeURL = `/profiles/${getDefaultProfileId()}/exchange`;

describe("Exchange", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		for (const plugin of pluginManager.plugins().all()) {
			pluginManager.plugins().removeById(plugin.config().id(), profile);
		}

		history.push(exchangeURL);
	});

	it("should render empty", () => {
		const { container, getByTestId } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		expect(getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		expect(getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		expect(getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render with exchanges", () => {
		const onEnabled = jest.fn();

		const plugin = new PluginController(
			{ "desktop-wallet": { categories: ["exchange"] }, name: "test-exchange" },
			onEnabled,
		);
		pluginManager.plugins().push(plugin);

		plugin.enable(profile, { autoRun: true });

		const { container, getByTestId, getByText } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		expect(getByTestId("header__title")).toHaveTextContent(translations.PAGE_EXCHANGES.TITLE);
		expect(getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_EXCHANGES.SUBTITLE);

		expect(getByText(plugin.config().title())).toBeTruthy();

		expect(container).toMatchSnapshot();
	});

	it("should launch exchange", async () => {
		const plugin = new PluginController(
			{ "desktop-wallet": { categories: ["exchange"], permissions: ["LAUNCH"] }, name: "test-exchange" },
			(api) => api.launch().render(<h1>My Exchange View</h1>),
		);

		pluginManager.services().register([new LaunchPluginService()]);
		pluginManager.plugins().push(plugin);

		plugin.enable(profile, { autoRun: true });

		const { getAllByTestId, getByTestId } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		await waitFor(() => expect(getAllByTestId("Card")).toHaveLength(1));
		await waitFor(() => expect(within(getByTestId("ExchangeGrid")).getByTestId("dropdown__toggle")).toBeTruthy());

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		fireEvent.click(within(getByTestId("ExchangeGrid")).getAllByTestId("Card")[0]);

		const redirectUrl = `/profiles/${profile.id()}/exchange/view?pluginId=test-exchange`;
		await waitFor(() => expect(historySpy).toHaveBeenCalledWith(redirectUrl));

		historySpy.mockRestore();
	});

	it("should go to plugin details", async () => {
		const onEnabled = jest.fn();

		const plugin = new PluginController(
			{ "desktop-wallet": { categories: ["exchange"] }, name: "test-exchange" },
			onEnabled,
		);

		pluginManager.plugins().push(plugin);

		plugin.enable(profile, { autoRun: true });

		const { getAllByTestId, getByTestId, getByText } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		await waitFor(() => expect(getAllByTestId("Card")).toHaveLength(1));
		await waitFor(() => expect(within(getByTestId("ExchangeGrid")).getByTestId("dropdown__toggle")).toBeTruthy());

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		fireEvent.click(within(getByTestId("ExchangeGrid")).getAllByTestId("dropdown__toggle")[0]);

		fireEvent.click(getByText(commonTranslations.DETAILS));

		const redirectUrl = `/profiles/${profile.id()}/plugins/details?pluginId=test-exchange`;
		await waitFor(() => expect(historySpy).toHaveBeenCalledWith(redirectUrl));

		historySpy.mockRestore();
	});

	it("should delete exchange", async () => {
		const onEnabled = jest.fn();

		const plugin = new PluginController(
			{ "desktop-wallet": { categories: ["exchange"] }, name: "test-exchange" },
			onEnabled,
		);

		pluginManager.services().register([new LaunchPluginService()]);
		pluginManager.plugins().push(plugin);

		plugin.enable(profile, { autoRun: true });

		const { getAllByTestId, getByTestId, getByText } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		await waitFor(() => expect(getAllByTestId("Card")).toHaveLength(1));
		await waitFor(() => expect(within(getByTestId("ExchangeGrid")).getByTestId("dropdown__toggle")).toBeTruthy());

		fireEvent.click(within(getByTestId("ExchangeGrid")).getAllByTestId("dropdown__toggle")[0]);

		fireEvent.click(getByText(commonTranslations.DELETE));

		await waitFor(() =>
			expect(getByTestId("modal__inner")).toHaveTextContent(pluginTranslations.MODAL_UNINSTALL.TITLE),
		);

		fireEvent.click(getByTestId("PluginUninstall__submit-button"));

		await waitFor(() => expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/));

		expect(getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();
	});

	it("should open & close uninstall exchange modal", async () => {
		const onEnabled = jest.fn();

		const plugin = new PluginController(
			{ "desktop-wallet": { categories: ["exchange"] }, name: "test-exchange" },
			onEnabled,
		);

		pluginManager.services().register([new LaunchPluginService()]);
		pluginManager.plugins().push(plugin);

		plugin.enable(profile, { autoRun: true });

		const { getAllByTestId, getByTestId, getByText } = renderWithRouter(
			<Route path="/profiles/:profileId/exchange">
				<Exchange />
			</Route>,
			{
				history,
				routes: [exchangeURL],
			},
		);

		await waitFor(() => expect(getAllByTestId("Card")).toHaveLength(1));
		await waitFor(() => expect(within(getByTestId("ExchangeGrid")).getByTestId("dropdown__toggle")).toBeTruthy());

		fireEvent.click(within(getByTestId("ExchangeGrid")).getAllByTestId("dropdown__toggle")[0]);

		fireEvent.click(getByText(commonTranslations.DELETE));

		expect(getByTestId("modal__inner")).toHaveTextContent(pluginTranslations.MODAL_UNINSTALL.TITLE);

		fireEvent.click(getByTestId("modal__close-btn"));

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
	});
});
