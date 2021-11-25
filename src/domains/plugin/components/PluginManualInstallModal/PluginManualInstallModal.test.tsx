/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import nock from "nock";
import { PluginManager } from "plugins";
import React from "react";

import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import { PluginManagerProvider } from "@/plugins/context/PluginManagerProvider";
import { render, screen, waitFor } from "@/utils/testing-library";

import { PluginManualInstallModal } from "./PluginManualInstallModal";

const translations = buildTranslations();

describe("PluginManualInstallModal", () => {
	let manager: PluginManager;

	beforeAll(() => {
		manager = new PluginManager();
	});

	it("should render properly", async () => {
		nock("https://github.com/")
			.get("/arkecosystem/fail-plugin/raw/master/package.json")
			.replyWithError("Failed")
			.get("/arkecosystem/test-plugin/raw/master/package.json")
			.reply(200, { keywords: ["@payvo", "wallet-plugin"], name: "test-plugin" });

		const toastSpy = jest.spyOn(toasts, "error").mockImplementation();

		const onSuccess = jest.fn();

		render(
			<PluginManagerProvider manager={manager} services={[]}>
				<PluginManualInstallModal onSuccess={onSuccess} isOpen />
			</PluginManagerProvider>,
		);

		await waitFor(async () => {
			expect(screen.getByTestId("PluginManualInstallModal__submit-button")).toBeDisabled();
		});

		const inputElement: HTMLInputElement = screen.getByRole("textbox");

		userEvent.paste(inputElement, "https://");

		await waitFor(async () => {
			expect(inputElement).toHaveAttribute("aria-invalid", "true");
		});

		inputElement.select();
		userEvent.paste(inputElement, "https://github.com/arkecosystem/fail-plugin");

		await waitFor(async () => expect(screen.getByTestId("PluginManualInstallModal__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("PluginManualInstallModal__submit-button"));

		await waitFor(() =>
			expect(toastSpy).toHaveBeenCalledWith(translations.PLUGINS.MODAL_MANUAL_INSTALL_PLUGIN.ERROR),
		);

		inputElement.select();
		userEvent.paste(inputElement, "https://github.com/arkecosystem/test-plugin");

		userEvent.click(screen.getByTestId("PluginManualInstallModal__submit-button"));

		await waitFor(() =>
			expect(onSuccess).toHaveBeenCalledWith({
				pluginId: "test-plugin",
				repositoryURL: "https://github.com/arkecosystem/test-plugin",
			}),
		);
	});
});
