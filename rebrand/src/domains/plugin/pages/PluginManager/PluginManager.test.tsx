/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { ipcRenderer } from "electron";
import { createMemoryHistory } from "history";
import nock from "nock";
import { LaunchPluginService, PluginController } from "plugins";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { PluginManager } from "./PluginManager";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { toasts } from "@/app/services";
import { translations } from "@/domains/plugin/i18n";
import { usePluginManagerContext } from "@/plugins/context/PluginManagerProvider";
import { env, getDefaultProfileId, pluginManager, render, screen, waitFor, within } from "@/utils/testing-library";

let profile: Contracts.IProfile;
const history = createMemoryHistory();

const fixtureProfileId = getDefaultProfileId();
const pluginsURL = `/profiles/${fixtureProfileId}/plugins`;
const pluginName = "@dated/delegate-calculator-wallet-plugin";
const pluginTitle = "ARK Delegate Calculator";

const Component = () => {
	const { fetchPluginPackages } = usePluginManagerContext();

	useEffect(() => {
		fetchPluginPackages();
	}, []);

	return <PluginManager />;
};

const downloadPluginCalled = (ipcRendererSpy) =>
	expect(ipcRendererSpy).toHaveBeenLastCalledWith("plugin:download", {
		name: pluginName,
		url: `https://registry.npmjs.org/${pluginName}/-/delegate-calculator-wallet-plugin-1.0.0.tgz`,
	});

const pluginGridToBeVisible = () =>
	expect(within(screen.getByTestId("PluginManager__latest__gaming")).getByTestId("PluginGrid")).toBeVisible();

const myPlugins = () => screen.getByTestId("PluginManager__container--my-plugins");
const installPlugin = () => screen.getByTestId("PluginManager_header--install");
const myPluginsTab = () => screen.getByTestId("tabs__tab-button-my-plugins");
const listLayout = () => screen.getByTestId("LayoutControls__list--icon");

const updateAll = "PluginManager__update-all";
const testPluginName = "test-plugin";

describe("PluginManager", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		history.push(pluginsURL);
	});

	it.each([true, false])("should render when useExpandedTables = %s", async (isExpandedTables: boolean) => {
		const profileAppearanceMock = jest.spyOn(profile.appearance(), "get").mockReturnValue(isExpandedTables);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.PAGE_PLUGIN_MANAGER.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.PAGE_PLUGIN_MANAGER.DESCRIPTION);

		await waitFor(() =>
			expect(within(screen.getByTestId("PluginManager__latest__utility")).getAllByText(pluginTitle)).toHaveLength(
				1,
			),
		);

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(9));

		expect(asFragment()).toMatchSnapshot();

		profileAppearanceMock.mockRestore();
	});

	it("should toggle between list and grid on latest", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		// eslint-disable-next-line sonarjs/no-identical-functions
		await waitFor(() =>
			expect(within(screen.getByTestId("PluginManager__latest__utility")).getAllByText(pluginTitle)).toHaveLength(
				1,
			),
		);

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(9));

		expect(
			within(screen.getByTestId("PluginManager__latest__utility")).getByTestId("PluginGrid"),
		).toBeInTheDocument();

		userEvent.click(listLayout());

		expect(
			within(screen.getByTestId("PluginManager__latest__utility")).getByTestId("PluginList"),
		).toBeInTheDocument();

		userEvent.click(screen.getByTestId("LayoutControls__grid--icon"));

		expect(
			within(screen.getByTestId("PluginManager__latest__utility")).getByTestId("PluginGrid"),
		).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should toggle between list and grid on all", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(screen.getByTestId("tabs__tab-button-all"));

		await waitFor(() =>
			expect(within(screen.getByTestId("PluginManager__container--all")).getAllByText(pluginTitle)).toHaveLength(
				1,
			),
		);

		userEvent.click(listLayout());

		expect(
			within(screen.getByTestId("PluginManager__container--all")).getByTestId("PluginList"),
		).toBeInTheDocument();

		userEvent.click(screen.getByTestId("LayoutControls__grid--icon"));

		expect(
			within(screen.getByTestId("PluginManager__container--all")).getByTestId("PluginGrid"),
		).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should toggle between list and grid on a category tab", async () => {
		const category = "utility";

		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(() =>
			expect(
				within(screen.getByTestId(`PluginManager__latest__${category}`)).getByTestId("PluginGrid"),
			).toBeInTheDocument(),
		);

		userEvent.click(screen.getByTestId(`tabs__tab-button-${category}`));

		expect(
			within(screen.getByTestId(`PluginManager__container--${category}`)).getByTestId("PluginGrid"),
		).toBeInTheDocument();

		userEvent.click(listLayout());

		expect(
			within(screen.getByTestId(`PluginManager__container--${category}`)).getByTestId("PluginList"),
		).toBeInTheDocument();

		userEvent.click(screen.getByTestId("LayoutControls__grid--icon"));

		expect(
			within(screen.getByTestId(`PluginManager__container--${category}`)).getByTestId("PluginGrid"),
		).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should switch to category by clicking on view all link", async () => {
		// add plugins to fill category
		const plugins = Array.from({ length: 5 }).map((_, index) => {
			const plugin = new PluginController(
				{ "desktop-wallet": { categories: ["other"] }, name: `test-plugin-${index}` },
				() => void 0,
			);

			pluginManager.plugins().push(plugin);

			return plugin;
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(() => {
			for (const plugin of plugins.slice(0, 3)) {
				expect(
					within(screen.getByTestId("PluginManager__latest__other")).getAllByText(plugin.config().title()),
				).toHaveLength(1);
			}
		});

		userEvent.click(screen.getByTestId("PluginManager__latest__other__view-all"));

		expect(screen.getByTestId("PluginManager__container--other")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		// remove plugins
		for (const plugin of plugins) {
			pluginManager.plugins().removeById(plugin.config().id(), profile);
		}
	});

	it.skip("should download & install plugin on latest", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(pluginGridToBeVisible);

		userEvent.click(listLayout());

		userEvent.click(screen.getAllByTestId("PluginListItem__install")[0]);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_INSTALL_PLUGIN.DESCRIPTION);

		userEvent.click(screen.getByTestId("InstallPlugin__download-button"));

		await expect(screen.findByTestId("InstallPlugin__continue-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("InstallPlugin__continue-button"));

		await expect(screen.findByTestId("InstallPlugin__enable-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("InstallPlugin__enable-button"));

		await expect(screen.findByTestId("InstallPlugin__step--third")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should open and accept disclaimer", async () => {
		const mockAcceptedManualInstallation = jest
			.spyOn(profile, "hasAcceptedManualInstallationDisclaimer")
			.mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(installPlugin());

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MANUAL_INSTALLATION_DISCLAIMER.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.MANUAL_INSTALLATION_DISCLAIMER.DISCLAIMER.replace(/\n\n/g, " "),
		);

		userEvent.click(screen.getByTestId("ManualInstallationDisclaimer__accept-button"));
		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(
				translations.MODAL_MANUAL_INSTALL_PLUGIN.TITLE,
			),
		);

		mockAcceptedManualInstallation.mockRestore();
	});

	it("should open, accept disclaimer and remember choice", async () => {
		const mockAcceptedManualInstallation = jest
			.spyOn(profile, "hasAcceptedManualInstallationDisclaimer")
			.mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(installPlugin());

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MANUAL_INSTALLATION_DISCLAIMER.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.MANUAL_INSTALLATION_DISCLAIMER.DISCLAIMER.replace(/\n\n/g, " "),
		);

		userEvent.click(screen.getByTestId("ManualInstallationDisclaimer__rememberChoice-toggle"));

		userEvent.click(screen.getByTestId("ManualInstallationDisclaimer__accept-button"));

		// eslint-disable-next-line sonarjs/no-identical-functions
		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(
				translations.MODAL_MANUAL_INSTALL_PLUGIN.TITLE,
			),
		);

		userEvent.click(screen.getByTestId("modal__close-btn"));

		mockAcceptedManualInstallation.mockRestore();

		userEvent.click(installPlugin());

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_MANUAL_INSTALL_PLUGIN.TITLE);
	});

	it.each([
		["close", "modal__close-btn"],
		["decline", "ManualInstallationDisclaimer__decline-button"],
	])("should open and %s disclaimer", async (_, buttonId) => {
		const mockAcceptedManualInstallation = jest
			.spyOn(profile, "hasAcceptedManualInstallationDisclaimer")
			.mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(installPlugin());

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MANUAL_INSTALLATION_DISCLAIMER.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.MANUAL_INSTALLATION_DISCLAIMER.DISCLAIMER.replace(/\n\n/g, " "),
		);

		userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());

		mockAcceptedManualInstallation.mockRestore();
	});

	it("should install plugin from header install button", async () => {
		const mockAcceptedManualInstallation = jest
			.spyOn(profile, "hasAcceptedManualInstallationDisclaimer")
			.mockReturnValue(true);

		nock("https://github.com/")
			.get("/arkecosystem/test-plugin/raw/master/package.json")
			.reply(200, { keywords: ["@payvo", "wallet-plugin"], name: testPluginName });

		render(
			<Route path="/profiles/:profileId/plugins">
				<PluginManager />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		// Open and close
		userEvent.click(installPlugin());

		await expect(screen.findByTestId("PluginManualInstallModal")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		// Open and type
		userEvent.click(installPlugin());

		await expect(screen.findByTestId("PluginManualInstallModal")).resolves.toBeVisible();

		userEvent.paste(
			screen.getByTestId("PluginManualInstallModal__input"),
			"https://github.com/arkecosystem/test-plugin",
		);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await waitFor(async () => {
			expect(screen.getByTestId("PluginManualInstallModal__submit-button")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("PluginManualInstallModal__submit-button"));

		const redirectUrl = `/profiles/${fixtureProfileId}/plugins/details?pluginId=test-plugin&repositoryURL=https://github.com/arkecosystem/test-plugin`;
		await waitFor(() => expect(historySpy).toHaveBeenCalledWith(redirectUrl));

		historySpy.mockRestore();

		mockAcceptedManualInstallation.mockRestore();
	});

	it("should cancel install plugin", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(pluginGridToBeVisible);

		userEvent.click(listLayout());
		await waitFor(() => expect(screen.getAllByTestId("PluginListItem__install")[0]).toBeInTheDocument());

		userEvent.click(screen.getAllByTestId("PluginListItem__install")[0]);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_INSTALL_PLUGIN.DESCRIPTION);

		userEvent.click(screen.getByTestId("InstallPlugin__cancel-button"));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should search for plugin", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(pluginGridToBeVisible);

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		const inputElement: HTMLInputElement = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId(
			"Input",
		);

		expect(inputElement).toBeInTheDocument();

		userEvent.paste(inputElement, pluginTitle);

		await expect(screen.findByText(translations.PAGE_PLUGIN_MANAGER.VIEW.SEARCH)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByTestId("PluginImage")).toHaveLength(1));

		inputElement.select();
		userEvent.paste(inputElement, "unknown search query");

		await expect(screen.findByTestId("PluginGrid__empty-message")).resolves.toBeVisible();

		// Switch to list view
		userEvent.click(listLayout());

		await expect(screen.findByTestId("PluginList__empty-message")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should download plugin", async () => {
		const ipcRendererSpy = jest.spyOn(ipcRenderer, "invoke").mockImplementation((channel) => {
			if (channel === "plugin:download") {
				return "/plugins/new-plugin";
			}
		});

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(pluginGridToBeVisible);

		userEvent.click(listLayout());
		userEvent.click(screen.getAllByTestId("PluginListItem__install")[0]);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_INSTALL_PLUGIN.DESCRIPTION),
		);

		userEvent.click(screen.getByTestId("InstallPlugin__allow-button"));

		await waitFor(() => downloadPluginCalled(ipcRendererSpy));

		ipcRendererSpy.mockRestore();
	});

	it("should fail to download plugin", async () => {
		const ipcRendererSpy = jest.spyOn(ipcRenderer, "invoke").mockRejectedValue("Failed");
		const toastSpy = jest.spyOn(toasts, "error");

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await waitFor(pluginGridToBeVisible);

		userEvent.click(listLayout());
		userEvent.click(screen.getAllByTestId("PluginListItem__install")[0]);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_INSTALL_PLUGIN.DESCRIPTION),
		);

		userEvent.click(screen.getByTestId("InstallPlugin__allow-button"));

		await waitFor(() => downloadPluginCalled(ipcRendererSpy));

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Failed to download/)));

		ipcRendererSpy.mockRestore();
		toastSpy.mockRestore();
	});

	it("should select plugin on latest grids", async () => {
		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await expect(screen.findByText(pluginTitle)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(9));

		userEvent.click(within(screen.getByTestId("PluginManager__latest__utility")).getAllByText(pluginTitle)[0]);

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/plugins/details`);
		expect(history.location.search).toBe("?pluginId=@dated/delegate-calculator-wallet-plugin");
	});

	it("should open the plugin view page", async () => {
		const plugin = new PluginController(
			{ "desktop-wallet": { permissions: ["LAUNCH"] }, name: testPluginName },
			(api) => api.launch().render(<h1>My Plugin View</h1>),
		);

		pluginManager.services().register([new LaunchPluginService()]);
		pluginManager.plugins().push(plugin);

		plugin.enable(profile, { autoRun: true });

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		userEvent.click(screen.getByTestId("PluginListItem__launch"));

		const redirectUrl = `/profiles/${profile.id()}/plugins/view?pluginId=test-plugin`;
		await waitFor(() => expect(historySpy).toHaveBeenCalledWith(redirectUrl));

		plugin.disable(profile);

		pluginManager.plugins().removeById(plugin.config().id(), profile);

		historySpy.mockRestore();
	});

	it("should enable plugin on my-plugins", async () => {
		const onEnabled = jest.fn();
		const plugin = new PluginController({ name: testPluginName }, onEnabled);
		pluginManager.plugins().push(plugin);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await expect(screen.findByText(pluginTitle)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(9));

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		expect(screen.getByTestId("PluginListItem__disabled")).toBeInTheDocument();

		userEvent.click(within(myPlugins()).getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(within(myPlugins()).getByText(commonTranslations.ENABLE));

		await expect(screen.findByTestId("PluginListItem__enabled")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		expect(onEnabled).toHaveBeenCalledWith(expect.any(Object));

		pluginManager.plugins().removeById(plugin.config().id(), profile);
	});

	it("should fail to enable", async () => {
		const toastSpy = jest.spyOn(toasts, "error").mockImplementation();
		const plugin = new PluginController({ name: testPluginName }, { incompatible: true });
		pluginManager.plugins().push(plugin);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		await expect(screen.findByText(pluginTitle)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(9));

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		expect(screen.getByTestId("PluginListItem__disabled")).toBeInTheDocument();

		userEvent.click(within(myPlugins()).getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(within(myPlugins()).getByText(commonTranslations.ENABLE));

		expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Failed to enable/));

		pluginManager.plugins().removeById(plugin.config().id(), profile);
	});

	it("should disable plugin on my-plugins", async () => {
		const onEnabled = jest.fn();
		const plugin = new PluginController({ name: testPluginName }, onEnabled);
		pluginManager.plugins().push(plugin);
		plugin.enable(profile);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		expect(screen.getByTestId("PluginListItem__enabled")).toBeInTheDocument();

		userEvent.click(within(myPlugins()).getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(within(myPlugins()).getByText(commonTranslations.DISABLE));

		await expect(screen.findByTestId("PluginListItem__disabled")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		pluginManager.plugins().removeById(plugin.config().id(), profile);
	});

	it("should update plugin on my-plugins", async () => {
		const ipcRendererSpy = jest.spyOn(ipcRenderer, "invoke").mockRejectedValue("Failed");

		const plugin = new PluginController({ name: pluginName, version: "0.0.1" }, () => void 0);
		pluginManager.plugins().push(plugin);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		await expect(screen.findByTestId("PluginDropdown__update-badge")).resolves.toBeVisible();

		userEvent.click(within(myPlugins()).getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(within(myPlugins()).getByText(commonTranslations.UPDATE));

		await waitFor(() => downloadPluginCalled(ipcRendererSpy));

		expect(asFragment()).toMatchSnapshot();

		pluginManager.plugins().removeById(plugin.config().id(), profile);
	});

	it("should close confirmation window", async () => {
		const onEnabled = jest.fn();
		const plugin = new PluginController({ name: testPluginName }, onEnabled);
		pluginManager.plugins().push(plugin);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		userEvent.click(within(myPlugins()).getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(within(myPlugins()).getByText(commonTranslations.DELETE));

		await expect(screen.findByTestId("PluginUninstallConfirmation")).resolves.toBeVisible();

		const invokeMock = jest.spyOn(ipcRenderer, "invoke").mockResolvedValue([]);
		userEvent.click(screen.getByTestId("PluginUninstall__cancel-button"));

		expect(screen.queryByTestId("PluginUninstallConfirmation")).not.toBeInTheDocument();

		pluginManager.plugins().removeById(plugin.config().id(), profile);

		invokeMock.mockRestore();
	});

	it("should delete plugin on my-plugins", async () => {
		const onEnabled = jest.fn();

		const plugin = new PluginController({ name: testPluginName }, onEnabled);
		pluginManager.plugins().push(plugin);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		userEvent.click(within(myPlugins()).getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(within(myPlugins()).getByText(commonTranslations.DELETE));

		await expect(screen.findByTestId("PluginUninstallConfirmation")).resolves.toBeVisible();

		const invokeMock = jest.spyOn(ipcRenderer, "invoke").mockResolvedValue([]);
		userEvent.click(screen.getByTestId("PluginUninstall__submit-button"));

		await waitFor(() => expect(pluginManager.plugins().findById(plugin.config().id())).toBeUndefined());

		expect(screen.queryByTestId("PluginUninstallConfirmation")).not.toBeInTheDocument();

		invokeMock.mockRestore();
	});

	it("should show update all banner", async () => {
		const plugin = new PluginController({ name: pluginName, version: "0.0.1" }, () => void 0);
		pluginManager.plugins().push(plugin);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		await expect(screen.findByTestId(updateAll)).resolves.toBeVisible();

		expect(screen.getByTestId(updateAll)).not.toBeDisabled();

		pluginManager.plugins().removeById(plugin.config().id(), profile);
	});

	it("should show and close the update confirmation modal", async () => {
		const plugin = new PluginController({ name: pluginName, version: "0.0.1" }, () => void 0);
		pluginManager.plugins().push(plugin);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		await expect(screen.findByTestId(updateAll)).resolves.toBeVisible();

		expect(screen.getByTestId(updateAll)).not.toBeDisabled();

		userEvent.click(screen.getByTestId(updateAll));

		await expect(screen.findByTestId("PluginUpdatesConfirmation")).resolves.toBeVisible();

		expect(screen.getByText("1.0.0")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("PluginUpdates__cancel-button"));

		expect(screen.queryByTestId("PluginUpdatesConfirmation")).not.toBeInTheDocument();

		pluginManager.plugins().removeById(plugin.config().id(), profile);
	});

	it("should show and continue the update confirmation modal", async () => {
		let downloadsCount = 0;
		let installCount = 0;

		jest.spyOn(ipcRenderer, "invoke").mockImplementation((channel) => {
			if (channel === "plugin:download") {
				downloadsCount++;
				return "/plugins/new-plugin";
			}

			if (channel === "plugin:install") {
				installCount++;
				return "/plugins/test-plugin";
			}
		});

		pluginManager.plugins().push(new PluginController({ name: pluginName, version: "0.0.1" }, () => void 0));

		pluginManager
			.plugins()
			.push(new PluginController({ name: "@payvo/ark-explorer-wallet-plugin", version: "0.0.1" }, () => void 0));

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		await expect(screen.findByTestId(updateAll)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(updateAll));

		await expect(screen.findByTestId("PluginUpdatesConfirmation")).resolves.toBeVisible();

		expect(screen.getByText("1.0.0")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("PluginUpdates__continue-button"));

		await waitFor(() => expect(downloadsCount).toBe(2));
		await waitFor(() => expect(installCount).toBe(2));
	});

	it("should show disabled update all banner if all updates are incompatible", async () => {
		process.env.REACT_APP_PLUGIN_MINIMUM_VERSION = "100.0.0";

		const plugin = new PluginController({ name: pluginName, version: "0.0.1" }, () => void 0);
		pluginManager.plugins().push(plugin);

		render(
			<Route path="/profiles/:profileId/plugins">
				<Component />
			</Route>,
			{
				history,
				routes: [pluginsURL],
			},
		);

		userEvent.click(myPluginsTab());
		userEvent.click(listLayout());

		await expect(screen.findByTestId(updateAll)).resolves.toBeVisible();

		expect(screen.getByTestId(updateAll)).toBeDisabled();

		pluginManager.plugins().removeById(plugin.config().id(), profile);

		process.env.REACT_APP_PLUGIN_MINIMUM_VERSION = undefined;
	});
});
