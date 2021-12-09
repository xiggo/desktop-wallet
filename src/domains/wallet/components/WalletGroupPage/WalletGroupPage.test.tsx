import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import * as envHooks from "app/hooks/env";
import * as useDisplayWallets from "domains/wallet/hooks/use-display-wallets";
import { UseDisplayWallets } from "domains/wallet/hooks/use-display-wallets.contracts";
import { WalletGroupPage } from "domains/wallet/components/WalletGroupPage/WalletGroupPage";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render, screen, syncDelegates } from "utils/testing-library";

const history = createMemoryHistory();

describe("WalletGroupPage", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IReadWriteWallet[];
	let network: Networks.Network;

	let duplicateWallets: Contracts.IReadWriteWallet[];

	let useDisplayWalletsResult: Partial<ReturnType<UseDisplayWallets>>;
	let useDisplayWalletsSpy: jest.SpyInstance;

	let walletGroupURL: string;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallets = profile.wallets().valuesWithCoin();
		network = wallets[0].network();

		walletGroupURL = `/profiles/${profile.id()}/network/${network.id()}`;

		duplicateWallets = [];
		for (const _ of Array.from({ length: 16 })) {
			duplicateWallets.push(wallets[0]);
		}

		wallets = profile.wallets().values();

		await profile.sync();
		await syncDelegates(profile);

		history.push(walletGroupURL);

		jest.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		history.push(walletGroupURL);

		useDisplayWalletsResult = {
			availableNetworks: [wallets[0].network()],
			walletsGroupedByNetwork: new Map(),
		};
		useDisplayWalletsResult.walletsGroupedByNetwork?.set(wallets[0].network(), duplicateWallets);

		useDisplayWalletsSpy = jest.spyOn(useDisplayWallets, "useDisplayWallets").mockReturnValue({
			...useDisplayWalletsResult,
			availableWallets: duplicateWallets,
		} as ReturnType<UseDisplayWallets>);
	});

	afterEach(() => {
		useDisplayWalletsSpy.mockRestore();
	});

	it("should render page", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				routes: [walletGroupURL],
			},
		);

		expect(screen.getByTestId("WalletGroup__Page")).toBeInTheDocument();
		expect(screen.queryByTestId("NetworkGroup_Toggle")).not.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should paginate", () => {
		render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				routes: [walletGroupURL],
			},
		);

		expect(screen.getByTestId("Pagination")).toBeInTheDocument();
		expect(screen.getByTestId("Pagination__next")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getAllByTestId("TableRow")).toHaveLength(1);
	});

	it("should go to main page if no network", () => {
		history.push(`/profiles/${profile.id()}/network/undefined`);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				routes: [`/profiles/${profile.id()}/network/undefined`],
			},
		);

		expect(history.location.pathname).toBe("/");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty list if no wallets", () => {
		useDisplayWalletsResult.walletsGroupedByNetwork = new Map();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				routes: [walletGroupURL],
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
