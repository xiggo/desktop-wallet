/* eslint-disable @typescript-eslint/require-await */
import os from "os";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import electron from "electron";
import { createHashHistory, createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { useAccentColor, useTheme } from "@/app/hooks";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import { GeneralSettings } from "@/domains/setting/pages";
import { act, env, fireEvent, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";

const translations = buildTranslations();

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useHistory: () => ({
		go: jest.fn(),
		replace: jest.fn(),
	}),
}));

let profile: Contracts.IProfile;
let showOpenDialogMock: jest.SpyInstance;

const showOpenDialogParameters = {
	defaultPath: os.homedir(),
	filters: [{ extensions: ["png", "jpg", "jpeg", "bmp"], name: "" }],
	properties: ["openFile"],
};

describe("General Settings", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render with prompt paths", async () => {
		const history = createHashHistory();

		history.push(`/profiles/${profile.id()}/settings`);

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				// @ts-ignore
				history,
			},
		);

		// Idle
		history.push(`/profiles/${profile.id()}/dashboard`);

		userEvent.paste(screen.getByTestId("General-settings__input--name"), "My Profile");

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());

		// Dirty
		history.replace(`/profiles/${profile.id()}/dashboard`);

		// Reload
		history.replace(`/profiles/${profile.id()}/settings`);
	});

	it("should render", async () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should disable submit button when profile is not restored yet", async () => {
		const isProfileRestoredMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();

		isProfileRestoredMock.mockRestore();
	});

	it("should update the avatar when removing focus from name input", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const inputElement: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(inputElement).toHaveValue(profile.name()));

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		act(() => inputElement.focus());

		userEvent.clear(inputElement);
		fireEvent.blur(inputElement);

		userEvent.paste(inputElement, "t");
		fireEvent.blur(inputElement);

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		act(() => inputElement.focus());

		userEvent.clear(inputElement);

		await waitFor(() => expect(inputElement).not.toHaveValue());

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		act(() => inputElement.focus());

		userEvent.clear(inputElement);

		await waitFor(() => expect(inputElement).not.toHaveValue());

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		expect(screen.queryByTestId("SelectProfileImage__avatar")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show identicon when removing image if name is set", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: ["banner.png"],
		}));

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters));

		userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		expect(asFragment()).toMatchSnapshot();

		showOpenDialogMock.mockRestore();
	});

	it("should not update the uploaded avatar when removing focus from name input", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const inputElement: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(inputElement).toHaveValue(profile.name()));

		// Upload avatar image
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: ["banner.png"],
		}));

		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => {
			expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);
		});

		act(() => inputElement.focus());

		userEvent.clear(inputElement);

		await waitFor(() => {
			expect(inputElement).not.toHaveValue();
		});

		fireEvent.blur(inputElement);

		expect(screen.getByTestId("SelectProfileImage__avatar-image")).toBeInTheDocument();

		act(() => inputElement.focus());

		userEvent.paste(inputElement, "t");

		await waitFor(() => {
			expect(inputElement).toHaveValue("t");
		});

		userEvent.click(document.body);

		expect(screen.getByTestId("SelectProfileImage__avatar-image")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update profile", async () => {
		const toastSpy = jest.spyOn(toasts, "success");

		const profilesCount = env.profiles().count();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		// Upload avatar image
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: ["banner.png"],
		}));

		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => {
			expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);
		});

		userEvent.paste(screen.getByTestId("General-settings__input--name"), "test profile");

		// Toggle Screenshot Protection
		userEvent.click(screen.getByTestId("General-settings__toggle--screenshotProtection"));

		// change auto signout period
		expect(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("select-list__input"),
		).toHaveValue("15");

		userEvent.click(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("SelectDropdown__caret"),
		);

		const firstOption = within(screen.getByTestId("General-settings__auto-signout")).getByTestId(
			"SelectDropdown__option--0",
		);

		expect(firstOption).toBeInTheDocument();

		userEvent.click(firstOption);

		expect(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("select-list__input"),
		).toHaveValue("1");

		// Toggle Test Development Network
		userEvent.click(screen.getByTestId("General-settings__toggle--useTestNetworks"));

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.TITLE,
		);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.DESCRIPTION,
		);

		userEvent.click(screen.getByTestId("DevelopmentNetwork__continue-button"));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		// Toggle Test Development Network
		userEvent.click(screen.getByTestId("General-settings__toggle--useTestNetworks"));

		expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled();

		userEvent.click(screen.getByTestId("General-settings__submit-button"));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.SETTINGS.GENERAL.SUCCESS);
		});

		// Upload and remove avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		userEvent.paste(screen.getByTestId("General-settings__input--name"), "t");
		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
		userEvent.clear(screen.getByTestId("General-settings__input--name"));
		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());
		userEvent.paste(screen.getByTestId("General-settings__input--name"), "test profile 2");

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("General-settings__submit-button"));

		// Not upload avatar image
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: undefined,
		}));

		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => {
			expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);
		});

		expect(env.profiles().count()).toBe(profilesCount);
		expect(asFragment()).toMatchSnapshot();

		toastSpy.mockRestore();
	});

	it("should not update profile if name consists only of whitespace", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const nameInput: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(nameInput).toHaveValue(profile.name()));

		nameInput.select();
		userEvent.paste(nameInput, "     ");

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());
	});

	it("should not update profile if profile name exists", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const nameInput: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(nameInput).toHaveValue(profile.name()));

		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		nameInput.select();
		userEvent.paste(nameInput, otherProfile.settings().get(Contracts.ProfileSetting.Name));

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		nameInput.select();
		userEvent.paste(nameInput, "unique profile name");

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it("should not update profile if profile name exists (uppercase)", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const nameInput: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(nameInput).toHaveValue(profile.name()));
		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		nameInput.select();
		userEvent.paste(nameInput, otherProfile.settings().get(Contracts.ProfileSetting.Name).toUpperCase());

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		nameInput.select();
		userEvent.paste(nameInput, "unique profile name");

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it("should not update profile if profile name is too long", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const nameInput: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(nameInput).toHaveValue(profile.name()));

		nameInput.select();
		userEvent.paste(nameInput, "test profile".repeat(10));

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		nameInput.select();
		userEvent.paste(nameInput, "unique profile name");

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it("should not update profile if profile name exists (padded)", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const nameInput: HTMLInputElement = screen.getByTestId("General-settings__input--name");

		await waitFor(() => expect(nameInput).toHaveValue(profile.name()));
		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		nameInput.select();
		userEvent.paste(nameInput, `  ${otherProfile.settings().get(Contracts.ProfileSetting.Name)}  `);

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		nameInput.select();
		userEvent.paste(nameInput, "unique profile name");

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it.each([
		["close", "modal__close-btn"],
		["cancel", "DevelopmentNetwork__cancel-button"],
		["continue", "DevelopmentNetwork__continue-button"],
	])("should open & close development network modal (%s)", async (_, buttonId) => {
		const { container } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeInTheDocument();

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("General-settings__toggle--useTestNetworks"));

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.TITLE,
		);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.DESCRIPTION,
		);

		userEvent.click(screen.getByTestId(buttonId));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
	});

	it.each([
		["close", "modal__close-btn"],
		["cancel", "ResetProfile__cancel-button"],
		["reset", "ResetProfile__submit-button"],
	])("should open & close reset profile modal (%s)", async (_, buttonId) => {
		const { container } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeInTheDocument();

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(translations.COMMON.RESET_SETTINGS));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should reset fields on reset", async () => {
		const toastSpy = jest.spyOn(toasts, "success");

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		await waitFor(() => {
			expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled();
		});

		userEvent.type(screen.getByTestId("General-settings__input--name"), "new profile name");

		await waitFor(() => {
			expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("General-settings__submit-button"));

		await waitFor(() => {
			expect(screen.getByText(translations.COMMON.RESET_SETTINGS)).toBeInTheDocument();
		});

		userEvent.click(screen.getByText(translations.COMMON.RESET_SETTINGS));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ResetProfile__submit-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("ResetProfile__submit-button"));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.SETTINGS.GENERAL.SUCCESS);
		});

		toastSpy.mockRestore();
	});

	it("should reset appearance settings on reset", async () => {
		const toastSpy = jest.spyOn(toasts, "success");
		const { setAccentColor, getCurrentAccentColor } = useAccentColor();

		expect(getCurrentAccentColor()).toBe("green");
		expect(electron.remote.nativeTheme.themeSource).not.toBe("dark");

		setAccentColor("blue");
		useTheme().setTheme("dark");

		expect(getCurrentAccentColor()).toBe("blue");
		expect(electron.remote.nativeTheme.themeSource).toBe("dark");

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => {
			expect(screen.getByText(translations.COMMON.RESET_SETTINGS)).toBeInTheDocument();
		});

		userEvent.click(screen.getByText(translations.COMMON.RESET_SETTINGS));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await waitFor(() => {
			expect(screen.getByTestId("ResetProfile__submit-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("ResetProfile__submit-button"));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.PROFILE.MODAL_RESET_PROFILE.SUCCESS);
		});

		expect(getCurrentAccentColor()).toBe("green");
		expect(electron.remote.nativeTheme.themeSource).toBe("system");

		toastSpy.mockRestore();
	});

	it("should default to USD if market provider does not support the selected currency", async () => {
		const toastSpy = jest.spyOn(toasts, "warning").mockImplementation();

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		const currencyContainer: HTMLElement = screen.getAllByRole("combobox")[1];
		const marketPriceContainer: HTMLElement = screen.getAllByRole("combobox")[3];

		const getSelectInput = (type: "MARKET_PROVIDER" | "CURRENCY") => {
			let subject: any;

			if (type === "MARKET_PROVIDER") {
				subject = marketPriceContainer;
			} else {
				subject = currencyContainer;
			}

			return within(subject).getByRole("textbox");
		};

		expect(getSelectInput("MARKET_PROVIDER")).toHaveValue("CryptoCompare");
		expect(getSelectInput("CURRENCY")).toHaveValue("BTC (Ƀ)");

		userEvent.click(within(currencyContainer).getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText("EUR (€)")).resolves.toBeVisible();

		expect(screen.queryByText("VND (₫)")).not.toBeInTheDocument();

		userEvent.click(screen.getByText("EUR (€)"));

		await waitFor(() => expect(getSelectInput("CURRENCY")).toHaveValue("EUR (€)"));

		userEvent.click(within(marketPriceContainer).getByTestId("SelectDropdown__caret"));

		userEvent.click(screen.getByText("CoinGecko"));

		await waitFor(() => expect(getSelectInput("MARKET_PROVIDER")).toHaveValue("CoinGecko"));

		userEvent.click(within(currencyContainer).getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText("VND (₫)")).resolves.toBeVisible();

		userEvent.click(screen.getByText("VND (₫)"));

		await waitFor(() => expect(getSelectInput("CURRENCY")).toHaveValue("VND (₫)"));

		userEvent.click(within(marketPriceContainer).getByTestId("SelectDropdown__caret"));

		userEvent.click(screen.getByText("CryptoCompare"));

		await waitFor(() => expect(getSelectInput("MARKET_PROVIDER")).toHaveValue("CryptoCompare"));

		expect(toastSpy).toHaveBeenCalledWith(
			translations.SETTINGS.GENERAL.UNSUPPORTED_CURRENCY.replace("{{currency}}", "VND").replace(
				"{{provider}}",
				"CryptoCompare",
			),
		);

		expect(getSelectInput("CURRENCY")).toHaveValue("USD ($)");

		toastSpy.mockRestore();
	});

	it("should show confirmation modal when auto logoff field is changed", async () => {
		const settingsURL = `/profiles/${profile.id()}/settings`;

		profile.flushSettings();

		const history = createMemoryHistory();
		history.push(settingsURL);

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				history,
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		// change auto signout period
		expect(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("select-list__input"),
		).toHaveValue("15");

		userEvent.click(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("SelectDropdown__caret"),
		);

		const firstOption = within(screen.getByTestId("General-settings__auto-signout")).getByTestId(
			"SelectDropdown__option--0",
		);

		expect(firstOption).toBeInTheDocument();

		userEvent.click(firstOption);

		expect(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("select-list__input"),
		).toHaveValue("1");

		// change navigation
		history.push(`/profiles/${profile.id()}/dashboard`);

		await waitFor(() => expect(history.location.pathname).toBe(settingsURL));
	});
});
