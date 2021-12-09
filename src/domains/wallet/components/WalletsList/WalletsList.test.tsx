import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import * as envHooks from "app/hooks/env";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { WalletsList } from "./WalletsList";
import { env, getDefaultProfileId, render, screen, syncDelegates } from "@/utils/testing-library";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createMemoryHistory();

describe("WalletsList", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IReadWriteWallet[];
	let network: Networks.Network;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallets = profile.wallets().valuesWithCoin();

		network = wallets[0].network();

		wallets = wallets.filter((wallet) => wallet.network() === network);

		await profile.sync();
		await syncDelegates(profile);

		history.push(dashboardURL);

		jest.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	it("should render", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsList wallets={wallets} />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(screen.getByTestId("WalletsList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty skeleton block", () => {
		const { asFragment } = render(<WalletsList wallets={[]} />);

		expect(screen.getByTestId("WalletsList")).toBeInTheDocument();
		expect(screen.getAllByTestId("TableRow")).toHaveLength(3);

		expect(asFragment()).toMatchSnapshot();
	});
});
