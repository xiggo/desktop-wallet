import React from "react";
import { TransactionFixture } from "tests/fixtures/transactions";
import { renderWithRouter } from "utils/testing-library";

import { UnlockTokensSummary } from "./UnlockTokensSummary";

describe("UnlockTokensSummary", () => {
	it("should render", () => {
		const { asFragment } = renderWithRouter(
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
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
