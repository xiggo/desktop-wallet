/* eslint-disable @typescript-eslint/require-await */
import { Observer } from "@ledgerhq/hw-transport";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import { LedgerProvider } from "@/app/contexts/Ledger/Ledger";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as dashboardTranslations } from "@/domains/dashboard/i18n";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	act,
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	useDefaultNetMocks,
	waitFor,
	within,
} from "@/utils/testing-library";

const history = createMemoryHistory();
let profile: Contracts.IProfile;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const transport = getDefaultLedgerTransport();

describe("Dashboard", () => {
	beforeAll(async () => {
		useDefaultNetMocks();

		nock("https://ark-test.payvo.com")
			.get("/api/transactions")
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data: data.slice(0, 2),
					meta,
				};
			})
			.persist();

		nock("https://neoscan.io/api/main_net/v1/")
			.get("/get_last_transactions_by_address/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX/1")
			.reply(200, []);

		profile = env.profiles().findById(fixtureProfileId);
		await env.profiles().restore(profile);
		await profile.sync();

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(wallet);

		await syncDelegates(profile);

		jest.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);
	});

	it("should render", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		await waitFor(() => {
			expect(screen.getByTestId("Balance__value")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show introductory tutorial", async () => {
		const mockHasCompletedTutorial = jest.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		expect(screen.getByText(profileTranslations.MODAL_WELCOME.STEP_1_TITLE)).toBeInTheDocument();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should navigate to import ledger page", async () => {
		const unsubscribe = jest.fn();
		let observer: Observer<any>;
		const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});
		profile.markIntroductoryTutorialAsComplete();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider transport={transport}>
					<Dashboard />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(9));

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await expect(screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		await waitFor(() =>
			expect(screen.queryByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).not.toBeInTheDocument(),
		);

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await expect(screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).resolves.toBeVisible();

		act(() => {
			observer!.next({ descriptor: "", type: "add" });
		});

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import`);
		expect(asFragment()).toMatchSnapshot();

		listenSpy.mockReset();
	});

	it("should navigate to create wallet page", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 5000 },
		);

		userEvent.click(screen.getByText("Create"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/create`);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to import wallet page", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 5000 },
		);

		userEvent.click(screen.getByText("Import"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import`);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading state when profile is syncing", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
			{ timeout: 4000 },
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should display empty block when there are no transactions", async () => {
		const mockTransactionsAggregate = jest.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getByRole("rowgroup")).toBeVisible(),
			{ timeout: 4000 },
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		mockTransactionsAggregate.mockRestore();
	});

	it("should open modal when click on a transaction", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				routes: [dashboardURL],
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
	});
});
