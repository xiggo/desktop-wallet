/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Welcome } from "./Welcome";
import { EnvironmentProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { httpClient } from "@/app/services";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import { StubStorage } from "@/tests/mocks";
import {
	act,
	env,
	getDefaultPassword,
	getDefaultProfileId,
	getPasswordProtectedProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();
const profileDashboardUrl = `/profiles/${fixtureProfileId}/dashboard`;

const submitID = "SignIn__submit-button";

describe("Welcome", () => {
	it("should render with profiles", () => {
		const { container, asFragment, history } = render(<Welcome />);
		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.name()));

		expect(history.location.pathname).toBe(profileDashboardUrl);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to profile dashboard", () => {
		const { container, asFragment, history } = render(<Welcome />);

		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([
		["close", "modal__close-btn"],
		["cancel", "SignIn__cancel-button"],
	])("should open & close sign in modal (%s)", (_, buttonId) => {
		const { container } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(profileTranslations.MODAL_SIGN_IN.TITLE);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(profileTranslations.MODAL_SIGN_IN.DESCRIPTION);

		userEvent.click(screen.getByTestId(buttonId));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
	});

	it("should navigate to profile dashboard with correct password", async () => {
		const { asFragment, container, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(getPasswordProtectedProfileId());
		await env.profiles().restore(profile, getDefaultPassword());

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.paste(screen.getByTestId("SignIn__input--password"), "password");

		await waitFor(() => {
			expect(screen.getByTestId(submitID)).toBeEnabled();
		});

		userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to profile settings with correct password", async () => {
		const { asFragment, container, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		const profileCardMenu = screen.getAllByTestId("dropdown__toggle")[1];

		userEvent.click(profileCardMenu);

		const settingsOption = screen.getByTestId("dropdown__option--0");

		expect(settingsOption).toBeInTheDocument();
		expect(settingsOption).toHaveTextContent(commonTranslations.SETTINGS);

		userEvent.click(settingsOption);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("SignIn__input--password"), "password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/settings`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to profile settings from profile card menu", async () => {
		const { container, asFragment, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById(fixtureProfileId);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		const profileCardMenu = screen.getAllByTestId("dropdown__toggle")[0];

		userEvent.click(profileCardMenu);

		const settingsOption = screen.getByTestId("dropdown__option--0");

		expect(settingsOption).toBeInTheDocument();
		expect(settingsOption).toHaveTextContent(commonTranslations.SETTINGS);

		userEvent.click(settingsOption);

		await waitFor(() => {
			expect(history.location.pathname).toBe(`/profiles/${profile.id()}/settings`);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete profile from profile card menu", async () => {
		render(<Welcome />);

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(3));

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);

		const deleteOption = screen.getByTestId("dropdown__option--1");

		expect(deleteOption).toHaveTextContent(commonTranslations.DELETE);

		userEvent.click(deleteOption);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(screen.getAllByTestId("Card")).toHaveLength(2));
	});

	it("should not restart the timeout when closing the modal to retry the profile password", async () => {
		jest.useFakeTimers();

		const { container } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		for (const index of [1, 2, 3]) {
			userEvent.paste(screen.getByTestId("SignIn__input--password"), `wrong password ${index}`);

			// wait for form to be updated
			await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(submitID));

			// wait for form to be updated
			await expect(screen.findByTestId(submitID)).resolves.toBeVisible();
		}

		expect(screen.getByTestId(submitID)).toBeDisabled();
		expect(screen.getByTestId("SignIn__input--password")).toBeDisabled();

		act(() => {
			jest.advanceTimersByTime(15_000);
		});

		// Close
		userEvent.click(screen.getByTestId("SignIn__cancel-button"));

		// Reopen
		userEvent.click(screen.getByText(profile.settings().get(Contracts.ProfileSetting.Name)!));

		// Still disabled
		expect(screen.getByTestId(submitID)).toBeDisabled();

		act(() => {
			jest.advanceTimersByTime(50_000);
			jest.clearAllTimers();
		});

		// wait for form to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await waitFor(
			() => expect(screen.getByTestId("Input__error")).toHaveAttribute("data-errortext", "Password invalid"),
			{
				timeout: 10_000,
			},
		);

		jest.useRealTimers();
	});

	it("should change route to create profile", () => {
		const { container, asFragment, history } = render(<Welcome />);

		expect(container).toBeInTheDocument();

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).toBeInTheDocument();

		userEvent.click(screen.getByText(profileTranslations.CREATE_PROFILE));

		expect(history.location.pathname).toBe("/profiles/create");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without profiles", () => {
		env.reset({ coins: {}, httpClient, storage: new StubStorage() });

		const { container, asFragment } = render(
			<EnvironmentProvider env={env}>
				<Welcome />
			</EnvironmentProvider>,
		);

		expect(container).toBeInTheDocument();

		expect(screen.getByText(profileTranslations.PAGE_WELCOME.WITHOUT_PROFILES.TITLE)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
