/* eslint-disable @typescript-eslint/require-await */
import os from "os";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import electron from "electron";
import { createMemoryHistory } from "history";
import React from "react";

import { EnvironmentProvider } from "@/app/contexts";
import { ImportProfileForm } from "@/domains/profile/pages/ImportProfile/ProfileFormStep";
import * as utils from "@/utils/electron-utils";
import { act, env, fireEvent, render, screen, waitFor } from "@/utils/testing-library";
let profile: Contracts.IProfile;

let showOpenDialogMock: jest.SpyInstance;
const showOpenDialogParameters = {
	defaultPath: os.homedir(),
	filters: [{ extensions: ["png", "jpg", "jpeg", "bmp"], name: "" }],
	properties: ["openFile"],
};

jest.mock("fs", () => ({
	readFileSync: jest.fn(() => "avatarImage"),
}));

describe("Import Profile - Profile Form Step", () => {
	beforeAll(() => {
		profile = env.profiles().first();
	});

	beforeEach(() => {
		//@ts-ignore
		showOpenDialogMock = jest.spyOn(electron.remote.dialog, "showOpenDialog").mockImplementation(() => ({
			filePaths: ["filePath"],
		}));
	});

	it("should render profile form", async () => {
		const history = createMemoryHistory();
		history.push(`/profiles/import`);

		const { container } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={profile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		expect(container).toMatchSnapshot();
	});

	it("should render profile form with hidden fields", async () => {
		const history = createMemoryHistory();
		history.push(`/profiles/import`);

		const { container } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={profile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		expect(container).toMatchSnapshot();
	});

	it("should render profile form with empty profile", async () => {
		const history = createMemoryHistory();
		const emptyProfile = env.profiles().create("test2");
		history.push(`/profiles/import`);

		const { container } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		expect(container).toMatchSnapshot();
	});

	it("should store profile", async () => {
		const emptyProfile = env.profiles().create("test3");
		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		expect(showOpenDialogMock).toHaveBeenCalledWith(showOpenDialogParameters);

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0];

		userEvent.paste(inputElement, "test profile 1");

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await waitFor(() => {
			expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		expect(emptyProfile.usesPassword()).toBe(false);

		inputElement.select();
		userEvent.paste(inputElement, "test profile 2");

		userEvent.click(screen.getByRole("checkbox"));

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		const newProfile = env.profiles().findById(emptyProfile.id());

		await waitFor(() => expect(newProfile.name()).toBe("test profile 2"));

		expect(newProfile.usesPassword()).toBe(false);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should fail password confirmation", async () => {
		const emptyProfile = env.profiles().create("test4");
		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		userEvent.paste(screen.getAllByTestId("Input")[0], "asdasdas");

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		const passwordInput: HTMLInputElement = screen.getAllByTestId("InputPassword")[0] as HTMLInputElement;
		const passwordConfirmationInput: HTMLInputElement = screen.getAllByTestId(
			"InputPassword",
		)[1] as HTMLInputElement;

		userEvent.paste(passwordInput, "753lk6JD!&");
		userEvent.paste(passwordConfirmationInput, "753lk6JD!");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeDisabled());

		passwordConfirmationInput.select();
		userEvent.paste(passwordConfirmationInput, "753lk6JD!&");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		passwordInput.select();
		userEvent.paste(passwordInput, "753lk6JD!");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeDisabled());

		passwordConfirmationInput.select();
		userEvent.paste(passwordConfirmationInput, "753lk6JD!");

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toBeEnabled());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update the avatar when removing focus from name input", async () => {
		const emptyProfile = env.profiles().create("test6");
		const shouldUseDarkColorsSpy = jest.spyOn(utils, "shouldUseDarkColors").mockReturnValue(false);

		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={true}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("CreateProfile__submit-button")).toHaveAttribute("disabled"));

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0] as HTMLInputElement;

		act(() => inputElement.focus());

		fireEvent.blur(inputElement);

		inputElement.select();
		userEvent.paste(inputElement, "t");

		act(() => screen.getAllByTestId("InputPassword")[1].focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		inputElement.select();
		userEvent.paste(inputElement, "te");

		act(() => screen.getAllByTestId("InputPassword")[0].focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		act(() => inputElement.focus());

		inputElement.select();
		userEvent.paste(inputElement, "test profile");

		await waitFor(() => {
			expect(inputElement).toHaveValue("test profile");
		});

		act(() => screen.getAllByTestId("InputPassword")[0].focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		act(() => inputElement.focus());

		userEvent.clear(inputElement);

		await waitFor(() => {
			expect(inputElement).not.toHaveValue();
		});

		act(() => screen.getAllByTestId("InputPassword")[0].focus());

		expect(screen.queryByTestId("SelectProfileImage__avatar")).not.toBeInTheDocument();

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		expect(() => screen.getByTestId("SelectProfileImage__avatar")).toBeTruthy();

		act(() => inputElement.focus());

		inputElement.select();
		userEvent.paste(inputElement, "t");

		await waitFor(() => {
			expect(inputElement).toHaveValue("t");
		});

		fireEvent.blur(inputElement);

		expect(asFragment()).toMatchSnapshot();

		shouldUseDarkColorsSpy.mockRestore();
	});
});
