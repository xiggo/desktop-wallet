import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import * as useWalletActionsModule from "domains/wallet/hooks/use-wallet-actions";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { WalletListItem } from "./WalletListItem";

import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import * as isFullySyncedModule from "@/domains/wallet/utils/is-fully-synced";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createMemoryHistory();

describe("WalletListItem", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		wallet.data().set(Contracts.WalletFlag.Starred, true);
		wallet.data().set(Contracts.WalletData.DerivationPath, "0");

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
		const { container } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={isCompact} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(screen.getByText(wallet.alias()!)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render with a N/A for fiat", () => {
		const isTestMock = jest.spyOn(wallet.network(), "isTest").mockReturnValue(true);

		const { asFragment } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByText("N/A")).toBeInTheDocument();

		isTestMock.mockRestore();
	});

	it("should render with default BTC as default exchangeCurrency", () => {
		const mockExchangeCurrency = jest.spyOn(wallet, "exchangeCurrency").mockReturnValue(undefined as any);

		const { container } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(screen.getByText(wallet.alias()!)).toBeInTheDocument();

		expect(container).toMatchSnapshot();

		mockExchangeCurrency.mockRestore();
	});

	it("should avoid click on TableRow when syncing", () => {
		const useWalletActionsReturn = {
			activeModal: "wallet-name",
			handleOpen: jest.fn(),
		} as unknown as ReturnType<typeof useWalletActionsModule.useWalletActions>;

		const isFullySyncedSpy = jest.spyOn(isFullySyncedModule, "isFullySynced").mockReturnValue(false);
		const useWalletActionsSpy = jest
			.spyOn(useWalletActionsModule, "useWalletActions")
			.mockReturnValue(useWalletActionsReturn);

		const { asFragment } = render(
			<table>
				<tbody>
					<Route path="/profiles/:profileId/dashboard">
						<WalletListItem wallet={wallet} isCompact={false} />
					</Route>
				</tbody>
			</table>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(asFragment).toMatchSnapshot();

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("TableRow"));

		expect(useWalletActionsReturn.handleOpen).not.toHaveBeenCalled();

		isFullySyncedSpy.mockRestore();
		useWalletActionsSpy.mockRestore();
	});
});
