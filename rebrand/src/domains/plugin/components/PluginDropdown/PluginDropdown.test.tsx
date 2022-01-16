import userEvent from "@testing-library/user-event";
import React from "react";

import { PluginDropdown } from "./PluginDropdown";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { render, screen } from "@/utils/testing-library";

describe("PluginDropdown", () => {
	it("should execute onUpdate callback", () => {
		const onUpdate = jest.fn();

		const plugin = {
			updateStatus: {
				isAvailable: true,
				isCompatible: true,
			},
		};

		render(<PluginDropdown plugin={plugin} onUpdate={onUpdate} />);

		expect(screen.getByTestId("PluginDropdown__update-badge")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__toggle"));
		userEvent.click(screen.getByText(commonTranslations.UPDATE));

		expect(onUpdate).toHaveBeenCalledWith(plugin);
	});

	it("should execute onDelete callback", () => {
		const onDelete = jest.fn();

		const plugin = {
			isInstalled: true,
			updateStatus: {},
		};

		render(<PluginDropdown plugin={plugin} onDelete={onDelete} />);

		userEvent.click(screen.getByTestId("dropdown__toggle"));
		userEvent.click(screen.getByText(commonTranslations.DELETE));

		expect(onDelete).toHaveBeenCalledWith(plugin);
	});

	it("should execute onEnable callback", () => {
		const onEnable = jest.fn();

		const plugin = {
			isEnabled: false,
			isInstalled: true,
			updateStatus: {},
		};

		render(<PluginDropdown plugin={plugin} onEnable={onEnable} />);

		userEvent.click(screen.getByTestId("dropdown__toggle"));
		userEvent.click(screen.getByText(commonTranslations.ENABLE));

		expect(onEnable).toHaveBeenCalledWith(plugin);
	});

	it("should execute onDisable callback", () => {
		const onDisable = jest.fn();

		const plugin = {
			isEnabled: true,
			isInstalled: true,
			updateStatus: {},
		};

		render(<PluginDropdown plugin={plugin} onDisable={onDisable} />);

		userEvent.click(screen.getByTestId("dropdown__toggle"));
		userEvent.click(screen.getByText(commonTranslations.DISABLE));

		expect(onDisable).toHaveBeenCalledWith(plugin);
	});
});
