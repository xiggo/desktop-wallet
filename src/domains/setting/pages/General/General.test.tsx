/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/profiles";
import { within } from "@testing-library/react";
import { buildTranslations } from "app/i18n/helpers";
import { GeneralSettings } from "domains/setting/pages";
import electron from "electron";
import { createHashHistory } from "history";
import os from "os";
import React from "react";
import { Route } from "react-router-dom";
import { act, env, fireEvent, getDefaultProfileId, renderWithRouter, screen, waitFor } from "utils/testing-library";

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

jest.mock("fs", () => ({
	readFileSync: jest.fn(() => "avatarImage"),
	writeFileSync: jest.fn(),
}));

describe("General Settings", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render with prompt paths", async () => {
		const history = createHashHistory();

		history.push(`/profiles/${profile.id()}/settings`);

		renderWithRouter(
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

		fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "My Profile" } });

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());

		// Dirty
		history.replace(`/profiles/${profile.id()}/dashboard`);

		// Reload
		history.replace(`/profiles/${profile.id()}/settings`);

		await waitFor(() => expect(screen.getByTestId("General-settings__cancel-button")).toBeEnabled());

		fireEvent.click(screen.getByTestId("General-settings__cancel-button"));
	});

	it("should render", async () => {
		const { container, asFragment } = renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeTruthy();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should disable submit button when profile is not restored yet", async () => {
		const isProfileRestoredMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const { asFragment } = renderWithRouter(
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
		const { asFragment } = renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(screen.getByTestId("SelectProfileImage__avatar")).toBeTruthy();

		act(() => screen.getByTestId("General-settings__input--name").focus());

		await act(async () => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "t" } });
		});

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		expect(screen.getByTestId("SelectProfileImage__avatar")).toBeTruthy();

		expect(asFragment()).toMatchSnapshot();

		act(() => screen.getByTestId("General-settings__input--name").focus());

		await act(async () => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "" } });
		});

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		act(() => screen.getByTestId("General-settings__input--name").focus());

		await act(async () => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "" } });
		});

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		expect(() => screen.getByTestId("SelectProfileImage__avatar")).toThrow(/^Unable to find an element by/);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show identicon when removing image if name is set", async () => {
		const { asFragment } = renderWithRouter(
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
		await act(async () => {
			fireEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));
		});

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		await act(async () => {
			fireEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));
		});

		expect(asFragment()).toMatchSnapshot();

		showOpenDialogMock.mockRestore();
	});

	it("should not update the uploaded avatar when removing focus from name input", async () => {
		const { asFragment } = renderWithRouter(
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

		await act(async () => {
			fireEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));
		});

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		act(() => screen.getByTestId("General-settings__input--name").focus());

		await act(async () => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "" } });
		});

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		expect(screen.getByTestId("SelectProfileImage__avatar")).toBeTruthy();

		act(() => screen.getByTestId("General-settings__input--name").focus());

		await act(async () => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "t" } });
		});

		act(() => screen.getByTestId("General-settings__submit-button").focus());

		expect(screen.getByTestId("SelectProfileImage__avatar")).toBeTruthy();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update profile", async () => {
		const profilesCount = env.profiles().count();

		const { asFragment } = renderWithRouter(
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

		await act(async () => {
			fireEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));
		});

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "test profile" } });

		// Toggle Screenshot Protection
		fireEvent.click(screen.getByTestId("General-settings__toggle--screenshotProtection"));

		// change auto signout period
		expect(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("select-list__input"),
		).toHaveValue("15");

		fireEvent.click(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("SelectDropdown__caret"),
		);

		const firstOption = within(screen.getByTestId("General-settings__auto-signout")).getByTestId(
			"SelectDropdown__option--0",
		);

		expect(firstOption).toBeInTheDocument();

		act(() => {
			fireEvent.mouseDown(firstOption);
		});

		expect(
			within(screen.getByTestId("General-settings__auto-signout")).getByTestId("select-list__input"),
		).toHaveValue("1");

		// Toggle Test Development Network
		fireEvent.click(screen.getByTestId("General-settings__toggle--useTestNetworks"));

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.TITLE,
		);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.DESCRIPTION,
		);

		fireEvent.click(screen.getByTestId("DevelopmentNetwork__continue-button"));

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		// Toggle Test Development Network
		fireEvent.click(screen.getByTestId("General-settings__toggle--useTestNetworks"));

		await act(async () => {
			fireEvent.click(screen.getByTestId("General-settings__submit-button"));
		});

		// Upload and remove avatar image
		await act(async () => {
			fireEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));
		});

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "t" } });
		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
		fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "" } });
		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());
		fireEvent.input(screen.getByTestId("General-settings__input--name"), { target: { value: "test profile 2" } });
		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());

		await act(async () => {
			fireEvent.click(screen.getByTestId("General-settings__submit-button"));
		});

		// Not upload avatar image
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: undefined,
		}));

		await act(async () => {
			fireEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));
		});

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		expect(env.profiles().count()).toEqual(profilesCount);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should not update profile if name consists only of whitespace", async () => {
		renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));
		fireEvent.input(screen.getByTestId("General-settings__input--name"), {
			target: { value: "     " },
		});

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());
	});

	it("should not update profile if profile name exists", async () => {
		renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		fireEvent.input(screen.getByTestId("General-settings__input--name"), {
			target: { value: otherProfile.settings().get(Contracts.ProfileSetting.Name) },
		});

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		fireEvent.input(screen.getByTestId("General-settings__input--name"), {
			target: { value: "unique profile name" },
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it("should not update profile if profile name exists (uppercase)", async () => {
		renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));
		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		act(() => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), {
				target: { value: otherProfile.settings().get(Contracts.ProfileSetting.Name).toUpperCase() },
			});
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		act(() => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), {
				target: { value: "unique profile name" },
			});
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it("should not update profile if profile name is too long", async () => {
		renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));
		act(() => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), {
				target: { value: "test profile".repeat(10) },
			});
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		act(() => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), {
				target: { value: "unique profile name" },
			});
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it("should not update profile if profile name exists (padded)", async () => {
		renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));
		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		act(() => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), {
				target: { value: `  ${otherProfile.settings().get(Contracts.ProfileSetting.Name)}  ` },
			});
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeDisabled());

		act(() => {
			fireEvent.input(screen.getByTestId("General-settings__input--name"), {
				target: { value: "unique profile name" },
			});
		});

		await waitFor(() => expect(screen.getByTestId("General-settings__submit-button")).toBeEnabled());
	});

	it.each([
		["close", "modal__close-btn"],
		["cancel", "DevelopmentNetwork__cancel-button"],
		["continue", "DevelopmentNetwork__continue-button"],
	])("should open & close development network modal (%s)", async (_, buttonId) => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeTruthy();

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		act(() => {
			fireEvent.click(screen.getByTestId("General-settings__toggle--useTestNetworks"));
		});

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.TITLE,
		);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.SETTINGS.MODAL_DEVELOPMENT_NETWORK.DESCRIPTION,
		);

		await act(async () => {
			fireEvent.click(screen.getByTestId(buttonId));
		});

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
	});

	it.each([
		["close", "modal__close-btn"],
		["cancel", "ResetProfile__cancel-button"],
		["reset", "ResetProfile__submit-button"],
	])("should open & close reset profile modal (%s)", async (_, buttonId) => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeTruthy();

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		act(() => {
			fireEvent.click(screen.getByText(translations.COMMON.RESET_SETTINGS));
		});

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await act(async () => {
			fireEvent.click(screen.getByTestId(buttonId));
		});

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
	});

	it("should reset fields on reset", async () => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/settings`],
			},
		);

		await waitFor(() => expect(screen.getByTestId("General-settings__input--name")).toHaveValue(profile.name()));

		expect(container).toBeTruthy();

		await act(async () => {
			fireEvent.click(screen.getByTestId("General-settings__submit-button"));
		});

		act(() => {
			fireEvent.click(screen.getByText(translations.COMMON.RESET_SETTINGS));
		});

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await act(async () => {
			fireEvent.click(screen.getByTestId("ResetProfile__submit-button"));
		});
	});
});
