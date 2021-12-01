/* eslint-disable @typescript-eslint/require-await */
import "jest-extended";

import { DateTime } from "@payvo/sdk-intl";
import { LSK } from "@payvo/sdk-lsk";
import { Contracts, DTO } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { buildTransferData } from "domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { createMemoryHistory } from "history";
import nock from "nock";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route, Router } from "react-router-dom";

import { LedgerProvider, minVersionList } from "@/app/contexts";
import { useProfileStatusWatcher } from "@/app/hooks";
import * as useFeesHook from "@/app/hooks/use-fees";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import transactionMultipleFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer-multiple.json";
import {
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	MNEMONICS,
	render,
	renderWithForm,
	screen,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";

import { FormStep } from "./FormStep";
import { NetworkStep } from "./NetworkStep";
import { ReviewStep } from "./ReviewStep";
import { SendTransfer } from "./SendTransfer";
import { SummaryStep } from "./SummaryStep";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();
const fixtureWalletId = getDefaultWalletId();

const createTransactionMultipleMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionMultipleFixture.data.amount / 1e8,
		data: () => ({ data: () => transactionMultipleFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${transactionFixture.data.id}`,
		fee: () => +transactionMultipleFixture.data.fee / 1e8,
		id: () => transactionMultipleFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => transactionMultipleFixture.data.recipient,
		recipients: () => [
			{
				address: transactionMultipleFixture.data.recipient,
				amount: +transactionMultipleFixture.data.amount / 1e8,
			},
		],
		sender: () => transactionMultipleFixture.data.sender,
		type: () => "multiPayment",
		usesMultiSignature: () => false,
	} as any);

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionFixture.data.amount / 1e8,
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${transactionFixture.data.id}`,
		fee: () => +transactionFixture.data.fee / 1e8,
		id: () => transactionFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => transactionFixture.data.recipient,
		recipients: () => [
			{
				address: transactionFixture.data.recipient,
				amount: +transactionFixture.data.amount / 1e8,
			},
		],
		sender: () => transactionFixture.data.sender,
		type: () => "transfer",
		usesMultiSignature: () => false,
	} as any);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
let getVersionSpy: jest.SpyInstance;

describe("SendTransfer", () => {
	beforeAll(async () => {
		env.registerCoin("LSK", LSK);

		profile = env.profiles().findById("b999d134-7a24-481e-a95d-bc47c543bfc9");

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		secondWallet = profile.wallets().last();

		getVersionSpy = jest
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		nock.disableNetConnect();

		nock("https://ark-test.payvo.com")
			.get("/api/transactions?address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/transactions?page=1&limit=20&senderId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, { data: [], meta: {} })
			.get("/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877")
			.reply(200, () => require("tests/fixtures/coins/ark/devnet/transactions.json"));

		await syncFees(profile);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	it("should render form step", async () => {
		const { asFragment } = renderWithForm(<FormStep deeplinkProps={{}} networks={[]} profile={profile} />, {
			defaultValues: {
				network: wallet.network(),
			},
			registerCallback: ({ register }) => {
				register("network");
				register("fee");
				register("fees");
			},
			withProviders: true,
		});

		expect(screen.getByTestId("SendTransfer__form-step")).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form step without test networks", async () => {
		const useNetworksMock = jest.spyOn(profile.settings(), "get").mockImplementation((setting) => {
			if (setting === Contracts.ProfileSetting.ExchangeCurrency) {
				return "USD";
			}

			return false;
		});

		const { asFragment } = renderWithForm(
			<FormStep deeplinkProps={{}} networks={env.availableNetworks()} profile={profile} />,
			{
				defaultValues: {
					network: wallet.network(),
				},
				registerCallback: ({ register }) => {
					register("network");
					register("fee");
					register("fees");
				},
				withProviders: true,
			},
		);

		expect(screen.getByTestId("SendTransfer__form-step")).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		expect(asFragment()).toMatchSnapshot();

		useNetworksMock.mockRestore();
	});

	it("should render network step without test networks", async () => {
		const useNetworksMock = jest.spyOn(profile.settings(), "get").mockReturnValue(false);

		const { asFragment } = renderWithForm(<NetworkStep networks={env.availableNetworks()} profile={profile} />);

		expect(screen.getByTestId("SendTransfer__network-step")).toBeInTheDocument();
		expect(screen.getAllByRole("listbox")[1]).toHaveClass("hidden");
		expect(asFragment()).toMatchSnapshot();

		useNetworksMock.mockRestore();
	});

	it("should render form step with deeplink values and use them", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "ark",
			memo: "ARK",
			method: "transfer",
			network: "ark.mainnet",
			recipient: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9",
		};

		const Component = () => {
			const form = useForm({
				defaultValues: {
					network: wallet.network(),
					senderAddress: wallet.address(),
				},
			});

			const { register } = form;

			useEffect(() => {
				register("network");
				register("fee");
				register("fees");
				register("inputFeeSettings");
				register("senderAddress");
			}, [register]);

			return (
				<FormProvider {...form}>
					<FormStep networks={[]} profile={profile} deeplinkProps={deeplinkProperties} />
				</FormProvider>
			);
		};

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<Component />
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 1st step with custom deeplink values and use them", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "ark",
			method: "transfer",
			network: "ark.mainnet",
			recipient: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9",
		};

		const Component = () => {
			const form = useForm({
				defaultValues: {
					network: wallet.network(),
					senderAddress: wallet.address(),
				},
			});

			const { register } = form;

			useEffect(() => {
				register("network");
				register("fee");
				register("fees");
				register("inputFeeSettings");
				register("senderAddress");
			}, [register]);

			return (
				<FormProvider {...form}>
					<FormStep networks={[]} profile={profile} deeplinkProps={deeplinkProperties} />
				</FormProvider>
			);
		};

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<Component />
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render review step", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "1",
					memo: "test memo",
					network: wallet.network(),
					recipients: [
						{
							address: wallet.address(),
							alias: wallet.alias(),
							amount: 1,
						},
					],
					senderAddress: wallet.address(),
				},
			}),
		);

		const { asFragment, container } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<FormProvider {...form.current}>
					<ReviewStep wallet={wallet} />
				</FormProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		expect(screen.getByTestId("SendTransfer__review-step")).toBeInTheDocument();
		expect(container).toHaveTextContent(wallet.network().name());
		expect(screen.getAllByTestId("Address__alias")).toHaveLength(2);
		expect(container).toHaveTextContent("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		expect(container).toHaveTextContent("test memo");

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([
		["with memo", "memo"],
		["without memo", undefined],
	])("should render review step with multiple recipients (%s)", async (_, memo) => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "1",
					memo,
					network: wallet.network(),
					recipients: [
						{
							address: wallet.address(),
							amount: 1,
						},
						{
							address: secondWallet.address(),
							amount: 1,
						},
					],
					senderAddress: wallet.address(),
				},
			}),
		);

		const { asFragment, container } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<FormProvider {...form.current}>
					<ReviewStep wallet={wallet} />
				</FormProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		expect(screen.getByTestId("SendTransfer__review-step")).toBeInTheDocument();
		expect(container).toHaveTextContent(wallet.network().name());
		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent(secondWallet.address());

		if (memo) {
			expect(container).toHaveTextContent(memo);
		}

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render summary step", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		await wallet.synchroniser().identity();

		const transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		const { asFragment } = renderWithForm(
			<Router history={history}>
				<Route path="/profiles/:profileId/send-transfer">
					<SummaryStep transaction={transaction} senderWallet={wallet} profile={profile} />
				</Route>
			</Router>,
			{
				defaultValues: {
					network: wallet.network(),
					senderAddress: wallet.address(),
				},
				registerCallback: ({ register }) => {
					register("network");
					register("fee");
					register("fees");
				},
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render network selection without selected wallet", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render network selection with sorted network", async () => {
		const profile = env.profiles().create("test");
		await env.profiles().restore(profile);

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

		profile.settings().set(Contracts.ProfileSetting.UseTestNetworks, true);

		const transferURL = `/profiles/${profile.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		expect(screen.getAllByTestId("SelectNetwork__NetworkIcon--container")).toHaveLength(2);
		expect(screen.getAllByTestId("SelectNetwork__NetworkIcon--container")[0]).toHaveTextContent("ark.svg");
		expect(screen.getAllByTestId("SelectNetwork__NetworkIcon--container")[1]).toHaveTextContent("lsk.svg");
	});

	it("should render form and use location state", async () => {
		const history = createMemoryHistory();
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet`;
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form and use location state without memo", async () => {
		const history = createMemoryHistory();

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?coin=ark&network=ark.devnet`;
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should trigger network connection warning when selecting unsynced wallet", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const walletMock = jest.spyOn(profile.wallets().first(), "hasSyncedWithNetwork").mockReturnValue(false);
		const onProfileSyncError = jest.fn();
		const Component = () => {
			useProfileStatusWatcher({ env, onProfileSyncError, profile });
			return (
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			);
		};

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<Component />
			</Route>,
			{
				history,
				routes: [transferURL],
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK Devnet"),
		);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(profile.wallets().first().address()),
		);

		await waitFor(() =>
			expect(onProfileSyncError).toHaveBeenCalledWith([expect.any(String)], expect.any(Function)),
		);
		walletMock.mockRestore();
	});

	it("should select cryptoasset", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		const input: HTMLInputElement = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "no match");
		await waitFor(() => expect(input).toHaveValue("no match"));

		expect(input).toHaveAttribute("aria-invalid", "true");

		input.select();
		userEvent.paste(input, "ARK Dev");
		await waitFor(() => expect(input).toHaveValue("ARK Dev"));

		expect(input).not.toHaveAttribute("aria-invalid");

		userEvent.clear(input);
		await waitFor(() => expect(input).not.toHaveValue());

		expect(input).toHaveAttribute("aria-invalid", "true");

		await expect(screen.findByTestId("NetworkIcon-ARK-ark.devnet")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() => expect(input).toHaveValue("ARK Devnet"));

		expect(input).not.toHaveAttribute("aria-invalid");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should reset fields when network changed", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue("ARK Devnet"));

		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK Devnet");

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Previous step
		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		// Change network
		// Unselect
		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).not.toHaveValue());
		// Select
		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue("ARK Devnet"));

		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		// Next step
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		// Memo
		expect(screen.getByTestId("Input__memo")).not.toHaveValue();

		// Fee
		expect(screen.getAllByRole("radio")[0]).not.toBeChecked();
	});

	it("should select a cryptoasset and select sender without wallet id param", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue("ARK Devnet"));

		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK Devnet");

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-1");

		userEvent.click(firstAddress);

		await waitFor(() => {
			expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});

	it("should update available amount after sender address changed", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__network-step")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue("ARK Devnet"));

		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK Devnet");

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		const secondAddress = screen.getByTestId("SearchWalletListItem__select-1");
		userEvent.click(secondAddress);

		expect(screen.getByText("57.60679402")).toBeInTheDocument();

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "55");

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");
		userEvent.click(firstAddress);

		expect(screen.getByText("33.67769203")).toBeInTheDocument();

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
	});

	it("should recalculate amount when fee changes and send all is selected", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.click(screen.getByTestId("AddRecipient__send-all"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"));

		expect(screen.getByTestId("AddRecipient__send-all")).toHaveClass("active");

		userEvent.click(screen.getByTestId("AddRecipient__send-all"));

		expect(screen.getByTestId("AddRecipient__send-all")).not.toHaveClass("active");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.07320598");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.1");
	});

	it("should keep the selected fee when user steps back", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "12");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("12"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Step 2
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		// Step 1 again
		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		// Thw fast fee should still be selected
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Go back to step 2 (the fast fee should still be the one used)
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		await expect(screen.findAllByTestId("Amount")).resolves.toBeArray();

		expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("0.1");
	});

	it("should handle fee change", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.07320598");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.1");

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1000000000");

		await waitFor(() => expect(inputElement).toHaveValue("1000000000"));

		goSpy.mockRestore();
	});

	it.each(["with keyboard", "without keyboard"])("should send a single transfer %s", async (inputMethod) => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		// remove focus from fee button
		userEvent.click(document.body);

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		if (inputMethod === "with keyboard") {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(screen.getByTestId("StepNavigation__continue-button"));
		}

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		if (inputMethod === "with keyboard") {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(screen.getByTestId("StepNavigation__continue-button"));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.keyboard("{enter}");
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
				"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
			),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
	});

	it("should correctly handle fees when network's fee type is size", async () => {
		const { wallet: lskWallet } = await profile.walletFactory().generate({
			coin: "LSK",
			network: "lsk.testnet",
		});

		jest.spyOn(lskWallet, "balance").mockReturnValue(10);
		jest.spyOn(lskWallet, "isDelegate").mockReturnValue(false);

		profile.wallets().push(lskWallet);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${lskWallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const useFeesMock = jest.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: 0.1, max: 0.1, min: 0.1, static: 0.1 }),
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue("Lisk Testnet"));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(lskWallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.paste(screen.getByTestId("SelectDropdown__input"), "lsksktujwqbak4azhj57sd8rtc58y7tjb5tgq8oyk");
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(
				"lsksktujwqbak4azhj57sd8rtc58y7tjb5tgq8oyk",
			),
		);

		// Set amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Assert that fee initial value is 0 and then it changes to 0.1 when loaded
		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0 LSK");

		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.1 LSK"));
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		// Continue to review step
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		expect(within(screen.getByTestId("SendTransfer__review-step")).getAllByTestId("Amount")[0]).toHaveTextContent(
			"1 LSK",
		);
		expect(within(screen.getByTestId("SendTransfer__review-step")).getAllByTestId("Amount")[1]).toHaveTextContent(
			"0.1 LSK",
		);
		expect(within(screen.getByTestId("SendTransfer__review-step")).getAllByTestId("Amount")[2]).toHaveTextContent(
			"1.1 LSK",
		);

		expect(backButton).not.toHaveAttribute("disabled");

		// Go back to form step
		userEvent.click(backButton);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.1 LSK"));

		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Continue to review step
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		expect(within(screen.getByTestId("SendTransfer__review-step")).getAllByTestId("Amount")[0]).toHaveTextContent(
			"1 LSK",
		);
		expect(within(screen.getByTestId("SendTransfer__review-step")).getAllByTestId("Amount")[1]).toHaveTextContent(
			"0.1 LSK",
		);
		expect(within(screen.getByTestId("SendTransfer__review-step")).getAllByTestId("Amount")[2]).toHaveTextContent(
			"1.1 LSK",
		);

		profile.wallets().forget(lskWallet.id());

		useFeesMock.mockRestore();
		goSpy.mockRestore();
	});

	it("should fail sending a single transfer", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Back to Step 1
		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		// Step 2
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [],
			//@ts-ignore
			errors: { [transactionFixture.data.id]: "ERROR" },

			rejected: [transactionFixture.data.id],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should send a single transfer and handle undefined expiration", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);
		const expirationMock = jest
			.spyOn(wallet.coin().transaction(), "estimateExpiration")
			.mockResolvedValue(undefined);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
				"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
			),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
		expirationMock.mockRestore();
	});

	it("should send a single transfer with a multisignature wallet", async () => {
		const isMultiSignatureSpy = jest.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		const multisignatureSpy = jest
			.spyOn(wallet.multiSignature(), "all")
			.mockReturnValue({ min: 2, publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!] });

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/transactions/:walletId/transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		await expect(screen.findByTestId("AddRecipient__send-all")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("AddRecipient__send-all"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
			"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
		);

		expect(signMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.anything(),
				fee: expect.any(Number),
				signatory: expect.any(Object),
			}),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		isMultiSignatureSpy.mockRestore();
		multisignatureSpy.mockRestore();
	});

	it("should send a single transfer with a ledger wallet", async () => {
		jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();
		jest.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);

		jest.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		jest.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));

		createTransactionMock(wallet);

		jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/transactions/:walletId/transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.click(screen.getByTestId("AddRecipient__send-all"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";

		jest.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key == Contracts.WalletData.Address) {
				return address;
			}
			if (key == Contracts.WalletData.Balance) {
				return balance;
			}

			if (key == Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		// Step 2
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		// Auto broadcast
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		jest.restoreAllMocks();
	});

	it("should return to form step by cancelling fee warning", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);
		userEvent.clear(screen.getByTestId("InputCurrency"));
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue());

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(inputElement).toHaveValue("1"));

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		// Step 2
		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		// Fee warning
		await expect(screen.findByTestId("FeeWarning__cancel-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));
		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());
	});

	it.each(["cancel", "continue"])(
		"should update the profile settings when dismissing the fee warning (%s)",
		async (action) => {
			const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

			const history = createMemoryHistory();
			history.push(transferURL);

			render(
				<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
					<LedgerProvider transport={getDefaultLedgerTransport()}>
						<SendTransfer />
					</LedgerProvider>
				</Route>,
				{
					history,
					routes: [transferURL],
				},
			);

			await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

			const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
			await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
			await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

			// Select recipient
			userEvent.click(
				within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
			);

			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

			userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
			await waitFor(() =>
				expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
			);

			// Amount
			userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
			await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

			// Memo
			userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
			await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

			// Fee
			userEvent.click(
				within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
			);

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			userEvent.paste(inputElement, "1");

			await waitFor(() => expect(inputElement).toHaveValue("1"));

			await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());

			userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

			// Review Step
			await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

			expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

			userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

			const profileSpy = jest.spyOn(profile.settings(), "set").mockImplementation();

			// Fee warning
			await expect(screen.findByTestId("FeeWarning__suppressWarning-toggle")).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("FeeWarning__suppressWarning-toggle"));
			userEvent.click(screen.getByTestId(`FeeWarning__${action}-button`));

			expect(profileSpy).toHaveBeenCalledWith(Contracts.ProfileSetting.DoNotShowFeeWarning, true);

			await expect(
				screen.findByTestId(action === "cancel" ? "SendTransfer__form-step" : "AuthenticationStep"),
			).resolves.toBeVisible();

			profileSpy.mockRestore();
		},
	);

	it.each([
		["high", "1"],
		["low", "0.000001"],
	])("should send a single transfer with a %s fee by confirming the fee warning", async (type, fee) => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, fee);

		await waitFor(() => expect(inputElement).toHaveValue(fee));

		await waitFor(() => expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		// Review Step
		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		// Fee warning
		await expect(screen.findByTestId("FeeWarning__continue-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Summary Step (skip ledger confirmation for now)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
				"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
			),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		pushSpy.mockRestore();
	});

	it("should error if wrong mnemonic", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address());

		// Amount
		userEvent.click(screen.getByTestId("AddRecipient__send-all"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		// Review Step
		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const inputElement: HTMLInputElement = screen.getByTestId("AuthenticationStep__mnemonic");

		userEvent.paste(inputElement, passphrase);
		await waitFor(() => expect(inputElement).toHaveValue(passphrase));

		expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled();

		inputElement.select();
		userEvent.paste(inputElement, MNEMONICS[0]);
		await waitFor(() => expect(inputElement).toHaveValue(MNEMONICS[0]));

		expect(screen.getByTestId("StepNavigation__send-button")).toBeDisabled();

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"This mnemonic does not correspond to your wallet",
		);
		expect(container).toMatchSnapshot();
	});

	it("should show error step and go back", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address());

		// Amount
		userEvent.click(screen.getByTestId("AddRecipient__send-all"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const historyMock = jest.spyOn(history, "push").mockReturnValue();

		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__wallet-button")).toBeInTheDocument();
		expect(screen.getByTestId("clipboard-button__wrapper")).toBeInTheDocument();
		expect(container).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__repeat-button"));

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		broadcastMock.mockRestore();
	});

	it("should send a multi payment", async () => {
		nock("https://ark-test.payvo.com")
			.get("/api/wallets/DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T.json"));

		nock("https://ark-test.payvo.com")
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json"));

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;

		expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel);

		// Select multiple type
		userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));
		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(1));

		// Select recipient #2
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));

		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));
		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(2));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.1");

		// Step 2
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const coin = profile.coins().set("ARK", "ark.devnet");
		const coinMock = jest.spyOn(coin.address(), "validate").mockReturnValue(true);

		const signMock = jest
			.spyOn(wallet.transaction(), "signMultiPayment")
			.mockReturnValue(Promise.resolve(transactionMultipleFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMultipleMock(wallet);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		coinMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should require amount if not set", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveAttribute("aria-invalid"));
	});

	it("should send a single transfer and show unconfirmed transactions modal", async () => {
		//@ts-ignore
		const sentTransactionsMock = jest.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
			Promise.resolve({
				items: () => [
					{
						convertedTotal: () => 0,
						isConfirmed: () => false,
						isMultiPayment: () => false,
						isSent: () => true,
						isTransfer: () => true,
						isUnvote: () => false,
						isVote: () => false,
						recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
						timestamp: () => DateTime.make(),
						total: () => 1,
						type: () => "transfer",
						wallet: () => wallet,
					},
					{
						convertedTotal: () => 0,
						isConfirmed: () => false,
						isMultiPayment: () => true,
						isSent: () => true,
						isTransfer: () => false,
						isUnvote: () => false,
						isVote: () => false,
						recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
						timestamp: () => DateTime.make(),
						total: () => 1,
						type: () => "multiPayment",
						wallet: () => wallet,
					},
				],
			}),
		);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ConfirmSendTransaction__cancel"));
		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());

		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));
		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
				"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
			),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
		sentTransactionsMock.mockRestore();
	});

	it("should display unconfirmed transactions modal when submitting with Enter", async () => {
		const sentTransactionsMock = jest.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
			Promise.resolve<any>({
				items: () => [
					{
						convertedTotal: () => 0,
						isConfirmed: () => false,
						isMultiPayment: () => false,
						isSent: () => true,
						isTransfer: () => true,
						isUnvote: () => false,
						isVote: () => false,
						recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
						timestamp: () => DateTime.make(),
						total: () => 1,
						type: () => "transfer",
						wallet: () => wallet,
					},
				],
			}),
		);

		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		// select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// enter amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		// proceed to step 2
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// proceed to step 3
		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		// enter mnemonic
		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());

		// submit form
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		// confirm within the modal
		userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));
		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
				"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
			),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		sentTransactionsMock.mockRestore();

		expect(container).toMatchSnapshot();
	});

	it("should send a single transfer using wallet with encryption password", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;
		const actsWithMnemonicMock = jest.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = jest.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const wifGetMock = jest.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const history = createMemoryHistory();
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(networkLabel));
		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		const backButton = screen.getByTestId("StepNavigation__back-button");

		expect(backButton).not.toHaveAttribute("disabled");

		userEvent.click(backButton);

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		userEvent.click(
			within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"),
		);

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357"));

		// Step 2
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Step 3
		expect(screen.getByTestId("StepNavigation__continue-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("StepNavigation__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__encryption-password"), "password");
		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(screen.getByTestId("StepNavigation__send-button")).not.toBeDisabled());
		userEvent.click(screen.getByTestId("StepNavigation__send-button"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent(
				"8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
			),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
	});

	it("should show initial step when reset=1 is added to route query params", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const history = createMemoryHistory();
		history.push(`${transferURL}?reset=1`);

		const replaceSpy = jest.spyOn(history, "replace").mockImplementation();

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider transport={getDefaultLedgerTransport()}>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [transferURL],
			},
		);

		await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith(transferURL));

		expect(screen.getByTestId("SendTransfer__network-step")).toBeInTheDocument();

		replaceSpy.mockRestore();
	});

	it("should buildTransferData return zero amount for empty multi recipients", async () => {
		const addresses = [wallet.address(), secondWallet.address()];

		const transferData = await buildTransferData({
			coin: wallet.coin(),
			memo: "any memo",
			recipients: [
				{
					address: addresses[0],
				},
				{
					address: addresses[1],
				},
			],
		});

		transferData.payments.map((payment, index) => {
			expect(payment.amount).toBe(0);
			expect(payment.to).toBe(addresses[index]);
		});
	});

	it("should buildTransferData return zero amount for empty single recipient", async () => {
		const transferData = await buildTransferData({
			coin: wallet.coin(),
			memo: "any memo",
			recipients: [
				{
					address: wallet.address(),
				},
			],
		});

		expect(transferData.amount).toBe(0);
		expect(transferData.to).toBe(wallet.address());
	});
});
