import { Contracts } from "@payvo/sdk-profiles";
import { screen } from "@testing-library/react";
import { LedgerProvider } from "app/contexts";
import * as envHooks from "app/hooks/env";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultLedgerTransport, getDefaultProfileId, render, syncDelegates } from "utils/testing-library";
import { WalletActionsModals } from "./WalletActionsModals";
import { translations as walletTranslations } from "@/domains/wallet/i18n";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createMemoryHistory();

describe("WalletActionsModals", () => {
	let profile: Contracts.IProfile;
	let mainnetWallet: Contracts.IReadWriteWallet;
	const setActiveModal = jest.fn();
	const transport = getDefaultLedgerTransport();

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(mainnetWallet);

		await syncDelegates(profile);

		jest.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		history.push(dashboardURL);
	});

	it("should render `sign-message` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"sign-message"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("SignMessage")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `verify-message` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"verify-message"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByText(walletTranslations.MODAL_VERIFY_MESSAGE.DESCRIPTION)).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `receive-funds` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"receive-funds"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("ReceiveFunds__address")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `wallet-name` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"wallet-name"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `delete-wallet` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"delete-wallet"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeleteResource__submit-button")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `second-signature` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"second-signature"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("WalletEncryptionWarning__submit-button")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `unlockable-balances` modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"unlockable-balances"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("UnlockTokensModal")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});
});
