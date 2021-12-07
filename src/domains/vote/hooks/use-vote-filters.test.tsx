import { LSK } from "@payvo/sdk-lsk";
import { Contracts } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId } from "@/utils/testing-library";

import { useVoteFilters } from "./use-vote-filters";

let profile: Contracts.IProfile;

describe("Use Vote Filters", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should get wallets by coin", async () => {
		env.registerCoin("LSK", LSK);

		const { wallet: lskMainWallet } = await profile.walletFactory().generate({
			coin: "LSK",
			network: "lsk.mainnet",
		});
		const { wallet: lskTestWallet } = await profile.walletFactory().generate({
			coin: "LSK",
			network: "lsk.testnet",
		});
		const { wallet: arkMainWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(lskMainWallet);
		profile.wallets().push(lskTestWallet);
		profile.wallets().push(arkMainWallet);

		const wrapper = ({ children }: any) => (
			<EnvironmentProvider env={env}>
				<ConfigurationProvider>{children}</ConfigurationProvider>
			</EnvironmentProvider>
		);
		const {
			result: {
				current: { walletsByCoin },
			},
		} = renderHook(
			() => useVoteFilters({ filter: "all", hasWalletId: false, profile, wallet: profile.wallets().first() }),
			{ wrapper },
		);

		const networkIds = Object.keys(walletsByCoin);

		expect(networkIds).toHaveLength(4);
		expect(networkIds).toStrictEqual(["ark.devnet", "lsk.mainnet", "lsk.testnet", "ark.mainnet"]);
	});
});
