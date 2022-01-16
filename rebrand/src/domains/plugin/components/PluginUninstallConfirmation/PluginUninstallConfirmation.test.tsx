import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { ipcRenderer } from "electron";
import { PluginController, PluginManager } from "plugins";
import React from "react";

import { PluginUninstallConfirmation } from "./PluginUninstallConfirmation";
import { PluginManagerProvider } from "@/plugins/context/PluginManagerProvider";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

describe("Plugin Uninstall Confirmation", () => {
	let profile: Contracts.IProfile;
	let manager: PluginManager;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		manager = new PluginManager();
	});

	it("should remove the plugin", async () => {
		const plugin = new PluginController({ name: "test-plugin" }, () => void 0, "/plugins/example");
		manager.plugins().push(plugin);

		const invokeMock = jest.spyOn(ipcRenderer, "invoke").mockResolvedValue([]);

		const onDelete = jest.fn();

		const { container } = render(
			<PluginManagerProvider manager={manager} services={[]}>
				<PluginUninstallConfirmation profile={profile} plugin={plugin} onDelete={onDelete} isOpen />
			</PluginManagerProvider>,
		);

		userEvent.click(screen.getByTestId("PluginUninstall__submit-button"));

		await waitFor(() => expect(invokeMock).toHaveBeenLastCalledWith("plugin:loader-fs.remove", "/plugins/example"));

		expect(manager.plugins().findById(plugin.config().id())).toBeUndefined();

		expect(onDelete).toHaveBeenCalledWith();
		expect(container).toMatchSnapshot();
	});

	it("should close on cancel", () => {
		const plugin = new PluginController({ name: "test-plugin" }, () => void 0, "/plugins/example");
		manager.plugins().push(plugin);

		const onClose = jest.fn();

		render(
			<PluginManagerProvider manager={manager} services={[]}>
				<PluginUninstallConfirmation profile={profile} plugin={plugin} onClose={onClose} isOpen />
			</PluginManagerProvider>,
		);

		userEvent.click(screen.getByTestId("PluginUninstall__cancel-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});
});
