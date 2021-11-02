import { Contracts } from "@payvo/profiles";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render } from "utils/testing-library";

import { useActiveProfile, useActiveWallet } from "./env";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("useActiveProfile", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];
	});

	const TestProfile: React.FC = () => {
		const profile = useActiveProfile();

		return <h1>{profile?.name() ?? "No profile found"}</h1>;
	};

	const TestWallet: React.FC = () => {
		const wallet = useActiveWallet();

		return <h1>{wallet.address()}</h1>;
	};

	it("should return profile", () => {
		const { getByText } = render(
			<Route path="/profiles/:profileId">
				<TestProfile />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}`],
			},
		);

		expect(getByText(profile.name())).toBeInTheDocument();
	});

	it("should return undefined when findById throws error", () => {
		const { getByText } = render(
			<Route path="/profiles/:profileId">
				<TestProfile />
			</Route>,
			{
				routes: [`/profiles/any_undefined_profile`],
			},
		);

		expect(getByText("No profile found")).toBeTruthy();
	});

	it("should return wallet", () => {
		const { getByText } = render(
			<Route path="/profiles/:profileId/wallets/:walletId">
				<TestWallet />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}/wallets/${wallet.id()}`],
			},
		);

		expect(getByText(wallet.address())).toBeInTheDocument();
	});
});
