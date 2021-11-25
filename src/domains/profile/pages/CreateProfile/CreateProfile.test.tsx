/* eslint-disable @typescript-eslint/require-await */
import { ARK } from "@payvo/sdk-ark";
import userEvent from "@testing-library/user-event";
import electron from "electron";
import { getCurrency } from "locale-currency";
import os from "os";
import React from "react";

import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import * as utils from "@/utils/electron-utils";
import { act, env, fireEvent, render, screen, waitFor } from "@/utils/testing-library";

import { CreateProfile } from "./CreateProfile";

jest.mock("fs", () => ({
	readFileSync: jest.fn(() => "avatarImage"),
}));

jest.mock("locale-currency", () => ({
	getCurrency: jest.fn(() => "USD"),
}));

let showOpenDialogMock: jest.SpyInstance;

const showOpenDialogParameters = {
	defaultPath: os.homedir(),
	filters: [{ extensions: ["png", "jpg", "jpeg", "bmp"], name: "" }],
	properties: ["openFile"],
};

const baseSettings = {
	ACCENT_COLOR: "green",
	ADVANCED_MODE: false,
	AUTOMATIC_SIGN_OUT_PERIOD: 15,
	BIP39_LOCALE: "english",
	DASHBOARD_TRANSACTION_HISTORY: true,
	DO_NOT_SHOW_FEE_WARNING: false,
	ERROR_REPORTING: false,
	EXCHANGE_CURRENCY: "BTC",
	LOCALE: "en-US",
	MARKET_PROVIDER: "cryptocompare",
	NAME: "test profile",
	SCREENSHOT_PROTECTION: true,
	THEME: "dark",
	TIME_FORMAT: "h:mm A",
	USE_EXPANDED_TABLES: false,
	USE_NETWORK_WALLET_NAMES: false,
	USE_TEST_NETWORKS: false,
};

const renderComponent = async () => {
	const utils = render(<CreateProfile />);

	await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeDisabled());

	return utils;
};

jest.mock("fs", () => ({
	readFileSync: jest.fn(() => "avatarImage"),
}));

const BASE64_REGEX = /(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?/g;

describe("CreateProfile", () => {
	beforeAll(() => {
		env.reset({ coins: { ARK }, httpClient, storage: new StubStorage() });
	});

	beforeEach(() => {
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: ["banner.png"],
		}));
	});

	it("should render", async () => {
		const { asFragment } = await renderComponent();

		userEvent.click(screen.getByText("Back"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select currency based on locale", async () => {
		getCurrency.mockReturnValueOnce("EUR");

		await renderComponent();

		await waitFor(() => expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("EUR (€)"));
	});

	it("should fall back USD if currency is not available", async () => {
		getCurrency.mockReturnValueOnce("FOOBAR");

		await renderComponent();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("USD ($)");
	});

	it("should store profile", async () => {
		await renderComponent();

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters));

		userEvent.paste(screen.getAllByTestId("Input")[0], "test profile 1");

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.clear(selectDropdown);
		await waitFor(() => expect(selectDropdown).not.toHaveValue());

		userEvent.paste(selectDropdown, "BTC");
		await waitFor(() => expect(selectDropdown).toHaveValue("BTC"));

		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		await waitFor(() => expect(env.profiles().count()).toBe(1));

		const profile = env.profiles().first();

		expect(profile.name()).toBe("test profile 1");
		expect(profile.settings().all()).toStrictEqual({
			...baseSettings,
			AVATAR: expect.stringMatching(BASE64_REGEX),
			NAME: "test profile 1",
			THEME: "light",
		});
		expect(profile.usesPassword()).toBe(false);
	});

	it("should not be able to create new profile if name already exists", async () => {
		const name = "test profile";
		const profile = env.profiles().create(name);

		await renderComponent();

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0] as HTMLInputElement;

		inputElement.select();
		userEvent.paste(inputElement, "t");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		inputElement.select();
		userEvent.paste(inputElement, name);

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();

		env.profiles().forget(profile.id());
	});

	it("should not be able to create new profile if name consists only of whitespace", async () => {
		await renderComponent();

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0] as HTMLInputElement;

		inputElement.select();
		userEvent.paste(inputElement, "t");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		inputElement.select();
		userEvent.paste(inputElement, "     ");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should not be able to create new profile if name is too long", async () => {
		await renderComponent();

		userEvent.paste(screen.getAllByTestId("Input")[0], "t");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).not.toHaveAttribute("disabled"));

		userEvent.paste(screen.getAllByTestId("Input")[0], "test profile".repeat(10));

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should store profile with password", async () => {
		await renderComponent();

		userEvent.paste(screen.getAllByTestId("Input")[0], "test profile 3");
		userEvent.paste(screen.getAllByTestId("InputPassword")[0], "S3cUrePa$sword.test");
		userEvent.paste(screen.getAllByTestId("InputPassword")[1], "S3cUrePa$sword.test");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		await waitFor(() => expect(env.profiles().last().usesPassword()).toBe(true));
	});

	it("should fail password confirmation", async () => {
		await renderComponent();

		userEvent.paste(screen.getAllByTestId("Input")[0], "asdasdas");

		const passwordInput: HTMLInputElement = screen.getAllByTestId("InputPassword")[0] as HTMLInputElement;
		const passwordConfirmationInput: HTMLInputElement = screen.getAllByTestId(
			"InputPassword",
		)[1] as HTMLInputElement;

		userEvent.paste(passwordInput, "S3cUrePa$sword.test");
		userEvent.paste(passwordConfirmationInput, "S3cUrePa$sword.wrong");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		passwordInput.select();
		userEvent.paste(passwordInput, "S3cUrePa$sword");

		passwordConfirmationInput.select();
		userEvent.paste(passwordConfirmationInput, "S3cUrePa$sword");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).not.toHaveAttribute("disabled"));

		passwordConfirmationInput.select();
		userEvent.paste(passwordConfirmationInput, "S3cUrePa$sword.test");

		passwordInput.select();
		userEvent.paste(passwordInput, "S3cUrePa$sword.wrong");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should update the avatar when removing focus from name input", async () => {
		await renderComponent();

		expect(() => screen.getByTestId("SelectProfileImage__avatar-identicon")).toThrow(
			/^Unable to find an element by/,
		);

		const inputElement: HTMLInputElement = screen.getByTestId("Input");

		userEvent.type(inputElement, "t");
		await waitFor(() => expect(inputElement).toHaveValue("t"));

		expect(inputElement).toHaveFocus();

		fireEvent.blur(inputElement);

		await screen.findByTestId("SelectProfileImage__avatar-identicon");

		inputElement.select();
		userEvent.paste(inputElement, "test profile");
		await waitFor(() => expect(inputElement).toHaveValue("test profile"));

		expect(inputElement).toHaveFocus();

		fireEvent.blur(inputElement);

		await screen.findByTestId("SelectProfileImage__avatar-identicon");

		userEvent.clear(inputElement);
		await waitFor(() => expect(inputElement).not.toHaveValue());

		expect(inputElement).toHaveFocus();

		fireEvent.blur(inputElement);

		expect(() => screen.getByTestId("SelectProfileImage__avatar-identicon")).toThrow(
			/^Unable to find an element by/,
		);
	});

	it("should not update the uploaded avatar when removing focus from name input", async () => {
		await renderComponent();

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters));

		act(() => screen.getAllByTestId("Input")[0].focus());

		userEvent.clear(screen.getAllByTestId("Input")[0]);

		await waitFor(() => expect(screen.getAllByTestId("Input")[0]).not.toHaveValue());

		act(() => screen.getAllByTestId("InputPassword")[1].focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-image")).toBeInTheDocument();
	});

	it("should upload and remove avatar image", async () => {
		await renderComponent();

		const profileCount = env.profiles().count();

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters));

		userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		userEvent.paste(screen.getAllByTestId("Input")[0], "test profile 4");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		await waitFor(() => expect(env.profiles().count()).toBe(profileCount + 1));
	});

	it("should show identicon when removing image if name is set", async () => {
		await renderComponent();

		userEvent.paste(screen.getAllByTestId("Input")[0], "test profile 1");

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters));

		userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();
	});

	it("should not upload avatar image", async () => {
		await renderComponent();

		const profileCount = env.profiles().count();

		// Not upload avatar image
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: undefined,
		}));

		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));
		await waitFor(() => expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters));

		userEvent.paste(screen.getAllByTestId("Input")[0], "test profile 5");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		await waitFor(() => expect(env.profiles().count()).toBe(profileCount + 1));
	});

	it.each([true, false])("should set dark mode toggle based on system preferences", async (shouldUseDarkColors) => {
		const shouldUseDarkColorsSpy = jest.spyOn(utils, "shouldUseDarkColors").mockReturnValue(shouldUseDarkColors);

		await renderComponent();

		const toggle = screen.getByRole("checkbox");

		if (shouldUseDarkColors) {
			expect(toggle).toBeChecked();
		} else {
			expect(toggle).not.toBeChecked();
		}

		expect(document.body).toHaveClass(`theme-${shouldUseDarkColors ? "dark" : "light"}`);

		shouldUseDarkColorsSpy.mockRestore();
	});
});
