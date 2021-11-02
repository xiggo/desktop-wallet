import React from "react";
import { Route } from "react-router-dom";
import { TransactionFixture } from "tests/fixtures/transactions";
import { getDefaultProfileId, render } from "utils/testing-library";

import { UnlockTokensSummary } from "./UnlockTokensSummary";

const fixtureProfileId = getDefaultProfileId();

describe("UnlockTokensSummary", () => {
	it("should render", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<UnlockTokensSummary
					transaction={{
						...TransactionFixture,
						wallet: () => ({
							...TransactionFixture.wallet(),
							currency: () => "LSK",
							network: () => ({
								coin: () => "LSK",
								displayName: () => "LISK Testnet",
								id: () => "lsk.testnet",
								isLive: () => false,
								isTest: () => true,
								ticker: () => "LSK",
							}),
						}),
					}}
				/>
			</Route>,
			{
				routes: [`/profiles/${fixtureProfileId}`],
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
