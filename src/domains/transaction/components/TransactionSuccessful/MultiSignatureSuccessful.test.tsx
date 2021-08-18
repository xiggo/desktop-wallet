import { Contracts } from "@payvo/profiles";
import React from "react";
import { env, getDefaultProfileId, render } from "testing-library";
import { TransactionFixture } from "tests/fixtures/transactions";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";

describe("MultiSignatureSuccessful", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", () => {
		jest.spyOn(wallet, "isResignedDelegate").mockReturnValue(true);
		const { asFragment } = render(
			<MultiSignatureSuccessful
				senderWallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
			>
				<div />
			</MultiSignatureSuccessful>,
		);

		expect(asFragment()).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should render with delegate wallet", () => {
		jest.spyOn(wallet, "isDelegate").mockReturnValue(true);
		jest.spyOn(wallet, "isResignedDelegate").mockReturnValue(false);

		const { asFragment } = render(
			<MultiSignatureSuccessful
				senderWallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
			>
				<div />
			</MultiSignatureSuccessful>,
		);

		expect(asFragment()).toMatchSnapshot();

		jest.restoreAllMocks();
	});
});
