import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { MessagePluginService } from "./MessagePluginService";
import { LedgerProvider } from "@/app/contexts";
import { IPluginController, PluginController, PluginManager } from "@/plugins/core";
import { PluginAPI } from "@/plugins/types";
import {
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

const pluginDescription = {
	"desktop-wallet": { permissions: ["MESSAGE"] },
	name: "test",
	version: "1.1",
};

describe("MessagePluginService", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let manager: PluginManager;
	let ctrl: IPluginController;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		manager = new PluginManager();
		manager.services().register([new MessagePluginService()]);
		manager.services().boot();
	});

	it("should sign a message", async () => {
		const fixture = (api: PluginAPI) => {
			const Component = () => {
				const [Modal, signResult, { open, close }] = api
					.message()
					.useSignMessageModal({ message: "My Plugin Message", walletId: wallet.id() });

				return (
					<div>
						{signResult && <span>Result {signResult?.signature}</span>}
						<button onClick={open}>Open Modal</button>
						<button onClick={close}>Close Modal</button>
						<Modal />;
					</div>
				);
			};

			render(
				<Route path="/profiles/:profileId/plugin">
					<LedgerProvider transport={getDefaultLedgerTransport()}>
						<Component />
					</LedgerProvider>
				</Route>,
				{
					routes: [`/profiles/${profile.id()}/plugin`],
				},
			);
		};

		ctrl = new PluginController(pluginDescription, fixture);
		ctrl.enable(profile);

		manager.plugins().push(ctrl);
		manager.plugins().runAllEnabled(profile);

		userEvent.click(screen.getByText("Open Modal"));

		await expect(screen.findByTestId("SignMessage")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("SignMessage__mnemonic-input"), getDefaultWalletMnemonic());

		await waitFor(() => expect(screen.getByTestId("SignMessage__submit-button")).toBeEnabled());

		userEvent.click(screen.getByTestId("SignMessage__submit-button"));

		await expect(screen.findByText("My Plugin Message")).resolves.toBeVisible();

		userEvent.click(screen.getByText("Close Modal"));

		await waitFor(() => expect(screen.queryByTestId("SignMessage")).not.toBeInTheDocument());

		expect(
			screen.getByText(
				"Result 33450f56b071f04d9d3306bdf0c9ffcc5e3d65443b560103a24d44b0ef9a4390f496216d31ccea1539ac0883ca2be5930e9f7070806e3824662ab233866c08e8",
			),
		).toBeInTheDocument();
	});
});
