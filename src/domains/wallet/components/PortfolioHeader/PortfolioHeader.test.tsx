import { LSK } from "@payvo/sdk-lsk";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import * as filterWalletsHooks from "domains/dashboard/components/FilterWallets/hooks";
import { PortfolioHeader } from "domains/wallet/components/PortfolioHeader/PortfolioHeader";
import { WalletsGroupsList } from "domains/wallet/components/WalletsGroup";
import * as useDisplayWallets from "domains/wallet/hooks/use-display-wallets";
import { UseDisplayWallets } from "domains/wallet/hooks/use-display-wallets.contracts";
import * as useWalletAction from "domains/wallet/hooks/use-wallet-actions";
import { createMemoryHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import * as ledgerModule from "@/app/contexts/Ledger/Ledger";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations as dashboardTranslations, translations } from "@/domains/dashboard/i18n";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	waitFor,
	within,
} from "@/utils/testing-library";

const history = createMemoryHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

let profile: Contracts.IProfile;
let emptyProfile: Contracts.IProfile;

const useWalletActionReturn = {
	activeModal: undefined,
	handleConfirmEncryptionWarning: jest.fn(),
	handleCreate: jest.fn(),
	handleDelete: jest.fn(),
	handleImport: jest.fn(),
	handleImportLedger: jest.fn(),
	handleOpen: jest.fn(),
	handleSelectOption: jest.fn(),
	handleSend: jest.fn(),
	handleToggleStar: jest.fn(),
	setActiveModal: jest.fn(),
};

describe("Portfolio grouped networks", () => {
	beforeAll(async () => {
		jest.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);

		nock("https://neoscan.io/api/main_net/v1/")
			.get("/get_last_transactions_by_address/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX/1")
			.reply(200, []);

		emptyProfile = env.profiles().create("Empty");
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(wallet);

		await syncDelegates(profile);
	});

	beforeEach(() => {
		history.push(dashboardURL);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	it("should render list", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await expect(screen.findByTestId("NetworkWalletsGroupList")).resolves.toBeVisible();
		await expect(screen.findByTestId("Portfolio__Header")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without testnet wallets", () => {
		profile.settings().set(Contracts.ProfileSetting.UseTestNetworks, false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseTestNetworks, true);
	});

	it("should handle wallet creation", () => {
		const useWalletActionSpy = jest
			.spyOn(useWalletAction, "useWalletActions")
			.mockReturnValue(useWalletActionReturn);
		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(useWalletActionReturn.handleCreate).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		useWalletActionSpy.mockRestore();
	});

	it("should handle wallet import", () => {
		const useWalletActionSpy = jest
			.spyOn(useWalletAction, "useWalletActions")
			.mockReturnValue(useWalletActionReturn);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(useWalletActionReturn.handleImport).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		useWalletActionSpy.mockRestore();
	});

	it("should handle filter change", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByTestId("dropdown__toggle"));
		userEvent.click(screen.getByTestId("filter-wallets__wallets"));
		userEvent.click(screen.getByTestId("dropdown__option--1"));

		await waitFor(() =>
			expect(screen.getByTestId("filter-wallets__wallets")).toHaveTextContent(commonTranslations.STARRED),
		);

		userEvent.click(screen.getByTestId("filter-wallets__wallets"));
		userEvent.click(screen.getByTestId("dropdown__option--0"));

		await waitFor(() =>
			expect(screen.getByTestId("filter-wallets__wallets")).toHaveTextContent(commonTranslations.ALL),
		);
	});

	it("should render network selection with sorted network filters", async () => {
		env.registerCoin("LSK", LSK);

		const profile = env.profiles().create("test");
		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.UseTestNetworks, true);

		const { wallet: lskWallet } = await profile.walletFactory().generate({
			coin: "LSK",
			network: "lsk.testnet",
		});
		const { wallet: arkWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.devnet",
		});
		profile.wallets().push(lskWallet);
		profile.wallets().push(arkWallet);
		await env.wallets().syncByProfile(profile);

		const route = `/profiles/${profile.id()}/dashboard`;
		const history = createMemoryHistory();
		history.push(route);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [route],
			},
		);

		userEvent.click(within(screen.getByTestId("WalletControls")).getByTestId("dropdown__toggle"));

		expect(screen.getByTestId("NetworkOptions")).toBeInTheDocument();
		expect(screen.getByTestId("NetworkOption__ark.devnet")).toHaveTextContent("ark.svg");
	});

	it("should open and close ledger import modal", async () => {
		const transport = getDefaultLedgerTransport();
		const unsubscribe = jest.fn();
		const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce(() => ({ unsubscribe }));

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<ledgerModule.LedgerProvider transport={transport}>
					<PortfolioHeader />
					<WalletsGroupsList />
				</ledgerModule.LedgerProvider>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await expect(screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		await waitFor(() =>
			expect(screen.queryByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).not.toBeInTheDocument(),
		);

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await expect(screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		listenSpy.mockReset();
	});

	it("should apply ledger import", () => {
		const useWalletActionSpy = jest
			.spyOn(useWalletAction, "useWalletActions")
			.mockReturnValue(useWalletActionReturn);
		const useLedgerContextSpy = jest
			.spyOn(ledgerModule, "useLedgerContext")
			.mockReturnValue({ hasDeviceAvailable: true } as unknown as ReturnType<
				typeof ledgerModule.useLedgerContext
			>);

		const transport = getDefaultLedgerTransport();
		const unsubscribe = jest.fn();
		const listenSpy = jest.spyOn(transport, "listen").mockImplementationOnce(() => ({ unsubscribe }));

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<ledgerModule.LedgerProvider transport={transport}>
					<PortfolioHeader />
					<WalletsGroupsList />
				</ledgerModule.LedgerProvider>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		expect(useWalletActionReturn.handleImportLedger).toHaveBeenCalledWith();
		expect(asFragment()).toMatchSnapshot();

		listenSpy.mockReset();
		useLedgerContextSpy.mockRestore();
		useWalletActionSpy.mockRestore();
	});

	it("should show proper message when no wallets match the filters", () => {
		const useDisplayWalletsReturn = {
			availableWallets: [],
			filteredWalletsGroupedByNetwork: [],
			hasWalletsMatchingOtherNetworks: false,
		} as unknown as ReturnType<UseDisplayWallets>;

		const useWalletFiltersReturn = {
			walletsDisplayType: "all",
		} as unknown as ReturnType<typeof filterWalletsHooks.useWalletFilters>;
		const useDisplayWalletsSpy = jest
			.spyOn(useDisplayWallets, "useDisplayWallets")
			.mockReturnValue(useDisplayWalletsReturn);
		const useWalletFiltersSpy = jest
			.spyOn(filterWalletsHooks, "useWalletFilters")
			.mockReturnValue(useWalletFiltersReturn);

		useDisplayWalletsReturn.hasWalletsMatchingOtherNetworks = true;
		useWalletFiltersReturn.walletsDisplayType = "starred";
		const { rerender } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			translations.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE_FILTERED.replace(
				"<bold>{{type}}</bold>",
				commonTranslations.STARRED,
			),
		);

		useWalletFiltersReturn.walletsDisplayType = "ledger";
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			translations.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE_FILTERED.replace(
				"<bold>{{type}}</bold>",
				commonTranslations.LEDGER,
			),
		);

		useDisplayWalletsReturn.hasWalletsMatchingOtherNetworks = true;
		useWalletFiltersReturn.walletsDisplayType = "all";
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(translations.WALLET_CONTROLS.EMPTY_MESSAGE_FILTERED);

		useDisplayWalletsReturn.hasWalletsMatchingOtherNetworks = false;
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			translations.WALLET_CONTROLS.EMPTY_MESSAGE.replace("<1>Create</1>", commonTranslations.CREATE).replace(
				"<3>Import</3>",
				commonTranslations.IMPORT,
			),
		);

		useDisplayWalletsSpy.mockRestore();
		useWalletFiltersSpy.mockRestore();
	});

	it("should render empty profile wallets", async () => {
		history.push(`/profiles/${emptyProfile.id()}/dashboard`);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				routes: [`/profiles/${emptyProfile.id()}/dashboard`],
			},
		);

		const emptyBlock = await screen.findByTestId("EmptyBlock");

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(within(emptyBlock).getByText(commonTranslations.CREATE)).toBeInTheDocument();
		expect(within(emptyBlock).getByText(commonTranslations.IMPORT)).toBeInTheDocument();
	});
});
