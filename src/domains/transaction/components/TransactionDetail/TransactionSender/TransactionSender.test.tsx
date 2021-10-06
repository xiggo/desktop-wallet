import { Contracts } from "@payvo/profiles";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, renderWithRouter } from "utils/testing-library";

import { TransactionSender } from "./TransactionSender";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("TransactionSender", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];
	});

	it("should render", () => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId">
				<TransactionSender wallet={wallet} />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}`],
			},
		);

		expect(container).toHaveTextContent(wallet.address());
		expect(container).toMatchSnapshot();
	});

	it("should render with address", () => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId">
				<TransactionSender address="test-address" />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}`],
			},
		);

		expect(container).toHaveTextContent("test-address");
		expect(container).toMatchSnapshot();
	});

	it("should render with alias", () => {
		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId">
				<TransactionSender wallet={wallet} />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}`],
			},
		);

		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent("ARK Wallet 1");
		expect(container).toMatchSnapshot();
	});

	it("should not render delegate icon", () => {
		const delegateMock = jest.spyOn(env.delegates(), "findByAddress").mockReturnValue({
			username: () => "delegate username",
		} as any);

		const { container } = renderWithRouter(
			<Route path="/profiles/:profileId">
				<TransactionSender wallet={wallet} />
			</Route>,
			{
				routes: [`/profiles/${profile.id()}`],
			},
		);

		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent("delegate-registration.svg");
		expect(container).toMatchSnapshot();

		delegateMock.mockRestore();
	});
});
