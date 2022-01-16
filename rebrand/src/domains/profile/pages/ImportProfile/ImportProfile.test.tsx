/* eslint-disable @typescript-eslint/require-await */
import fs from "fs";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import React from "react";

import { EnvironmentProvider } from "@/app/contexts";
import { ImportProfile } from "@/domains/profile/pages/ImportProfile/ImportProfile";
import { env, fireEvent, render, screen, waitFor } from "@/utils/testing-library";

const passwordProtectedDwe = fs.readFileSync("src/tests/fixtures/profile/import/password-protected-profile.dwe");
const corruptedDwe = fs.readFileSync("src/tests/fixtures/profile/import/corrupted-profile.dwe");
const legacyJson = fs.readFileSync("src/tests/fixtures/profile/import/legacy-profile.json");
const darkThemeDwe = fs.readFileSync("src/tests/fixtures/profile/import/profile-dark-theme.dwe");
const lightThemeDwe = fs.readFileSync("src/tests/fixtures/profile/import/profile-light-theme.dwe");
const history = createMemoryHistory();

const importProfileURL = "/profiles/import";

const browseFiles = () => screen.getByTestId("SelectFile__browse-files");

const changeFileID = "SelectFileStep__change-file";
const submitID = "PasswordModal__submit-button";
const validPassword = "S3cUrePa$sword";
const wrongPassword = "wrong password";

const filePath = "path/to/sample-export.dwe";
const sampleFiles = [
	{ name: "profile-export.dwe", path: filePath },
	{ name: "profile.dwe", path: filePath },
];

describe("ImportProfile", () => {
	let consoleSpy: jest.SpyInstance;
	let fsMock: jest.SpyInstance;

	beforeAll(() => {
		consoleSpy = jest.spyOn(console, "log").mockImplementation(() => void 0);
		fsMock = jest.spyOn(fs, "readFileSync").mockReturnValue(passwordProtectedDwe);
	});

	afterAll(() => {
		consoleSpy.mockRestore();
		fsMock.mockRestore();
	});

	it("should render first step", async () => {
		const history = createMemoryHistory();
		history.push(importProfileURL);

		const { container } = render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should go back", async () => {
		history.push(importProfileURL);
		const historyMock = jest.spyOn(history, "push").mockReturnValue();

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectFileStep__back"));

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));
		historyMock.mockRestore();
	});

	it("should change file format", async () => {
		history.push(importProfileURL);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();

		userEvent.click(screen.getByTestId(changeFileID));

		await waitFor(() => expect(screen.queryByTestId(changeFileID)).not.toBeInTheDocument());
	});

	it("should select file and go to step 2", async () => {
		history.push(importProfileURL);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(0, 1),
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
	});

	it("should request and set password for importing password protected profile", async () => {
		history.push(importProfileURL);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(0, 1),
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), validPassword);

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(submitID));

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("CreateProfile__form")).resolves.toBeVisible();
	});

	it("should close password modal and go back to select file", async () => {
		history.push(importProfileURL);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(0, 1),
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		await expect(screen.findByTestId(changeFileID)).resolves.toBeVisible();
	});

	it("should successfully import profile and return to home screen", async () => {
		history.push(importProfileURL);
		const historyMock = jest.spyOn(history, "push").mockReturnValue();
		jest.spyOn(fs, "readFileSync").mockReturnValue(passwordProtectedDwe);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(1),
			},
		});

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), validPassword);
		await waitFor(() => expect(screen.getByTestId("PasswordModal__input")).toHaveValue(validPassword));

		userEvent.click(screen.getByTestId(submitID));

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("CreateProfile__form")).resolves.toBeVisible();

		expect(screen.queryByTestId("InputPassword")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));
	});

	it("should successfully import legacy profile and return to home screen", async () => {
		history.push(importProfileURL);
		const historyMock = jest.spyOn(history, "push").mockReturnValue();
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(legacyJson);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		userEvent.click(screen.getByTestId(changeFileID));

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [{ name: "legacy-profile.json", path: "path/to/legacy-profile.json" }],
			},
		});

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("CreateProfile__form")).resolves.toBeVisible();

		userEvent.paste(screen.getAllByTestId("Input")[0], "legacy profile");
		await waitFor(() => expect(screen.getAllByTestId("Input")[0]).toHaveValue("legacy profile"));

		userEvent.click(screen.getByTestId("CreateProfile__submit-button"));

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));
	});

	it.each([
		["dark", darkThemeDwe],
		["light", lightThemeDwe],
	])("should apply theme setting of imported profile regardless of OS preferences", async (theme, dweFile) => {
		history.push(importProfileURL);

		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(dweFile);

		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(1),
			},
		});

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("CreateProfile__form")).resolves.toBeVisible();

		expect(screen.getByRole("checkbox")).toHaveAttribute("name", "isDarkMode");

		if (theme === "dark") {
			expect(screen.getByRole("checkbox")).toBeChecked();
		} else {
			expect(screen.getByRole("checkbox")).not.toBeChecked();
		}

		expect(asFragment()).toMatchSnapshot();
	});

	it("should go to step 3 and back", async () => {
		history.push(importProfileURL);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(1),
			},
		});

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), validPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(validPassword);
		});

		userEvent.click(screen.getByTestId(submitID));

		expect(screen.getByTestId("ProcessingImport")).toBeVisible();

		await expect(screen.findByTestId("CreateProfile__form")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("CreateProfile__back-button"));

		await expect(screen.findByTestId(changeFileID)).resolves.toBeVisible();
	});

	it("should fail profile import and show error step", async () => {
		history.push(importProfileURL);
		const corruptedDweMock = jest.spyOn(fs, "readFileSync").mockReturnValue(corruptedDwe);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(0, 1),
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), wrongPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(wrongPassword);
		});

		userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		corruptedDweMock.mockRestore();
	});

	it("should fail profile import and retry", async () => {
		history.push(importProfileURL);
		const corruptedDweMock = jest.spyOn(fs, "readFileSync").mockReturnValue(corruptedDwe);

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(1),
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), wrongPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(wrongPassword);
		});

		userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ImportError__retry"));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		corruptedDweMock.mockRestore();
	});

	it("should fail profile import and go back to home screen", async () => {
		history.push(importProfileURL);
		const corruptedDweMock = jest.spyOn(fs, "readFileSync").mockReturnValue(corruptedDwe);
		const historyMock = jest.spyOn(history, "push").mockReturnValue();

		render(
			<EnvironmentProvider env={env}>
				<ImportProfile />
			</EnvironmentProvider>,
			{ history },
		);

		expect(screen.getByTestId(changeFileID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectFileStep__back")).toBeInTheDocument();

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles.slice(0, 1),
			},
		});

		await expect(screen.findByTestId("ProcessingImport")).resolves.toBeVisible();
		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordModal__input"), wrongPassword);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordModal__input")).toHaveValue(wrongPassword);
		});

		userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ImportError__back"));

		await expect(screen.findByTestId("ImportError")).resolves.toBeVisible();

		await waitFor(() => expect(historyMock).toHaveBeenCalledWith("/"));

		historyMock.mockRestore();
		corruptedDweMock.mockRestore();
	});
});
