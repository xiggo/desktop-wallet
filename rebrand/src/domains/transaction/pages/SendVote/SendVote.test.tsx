/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test
import "jest-extended";

import { Signatories } from "@payvo/sdk";
import { Contracts, ReadOnlyWallet } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import nock from "nock";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { SendVote } from "./SendVote";
import { LedgerProvider } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { data as delegateData } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import unvoteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/unvote.json";
import voteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/vote.json";
import {
	act,
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();

const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => voteFixture.data.amount / 1e8,
		data: () => ({ data: () => voteFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${voteFixture.data.id}`,
		fee: () => voteFixture.data.fee / 1e8,
		id: () => voteFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => voteFixture.data.recipient,
		sender: () => voteFixture.data.sender,
		type: () => "vote",
		usesMultiSignature: () => false,
	});

const createUnvoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => unvoteFixture.data.amount / 1e8,
		data: () => ({ data: () => voteFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${unvoteFixture.data.id}`,
		fee: () => unvoteFixture.data.fee / 1e8,
		id: () => unvoteFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => unvoteFixture.data.recipient,
		sender: () => unvoteFixture.data.sender,
		type: () => "unvote",
		usesMultiSignature: () => false,
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
const transport = getDefaultLedgerTransport();

const votingMockImplementation = () => [
	{
		amount: 10,
		wallet: new ReadOnlyWallet({
			address: delegateData[1].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: delegateData[1].publicKey,
			username: delegateData[1].username,
		}),
	},
];

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const backButton = () => screen.getByTestId("StepNavigation__back-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendVote__review-step";
const formStepID = "SendVote__form-step";

describe("SendVote", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		await wallet.synchroniser().identity();

		jest.spyOn(wallet, "isDelegate").mockImplementation(() => true);

		await syncDelegates(profile);
		await syncFees(profile);

		[0, 1].map((index) =>
			env.delegates().findByAddress(wallet.coinId(), wallet.networkId(), delegateData[index].address),
		);

		nock.disableNetConnect();

		nock("https://ark-test.payvo.com")
			.get("/api/transactions/d819c5199e323a62a4349948ff075edde91e509028329f66ec76b8518ad1e493")
			.reply(200, voteFixture)
			.get("/api/transactions/32e5278cb72f24f2c04c4797dbfbffa7072f6a30e016093fdd3f7660a2ee2faf")
			.reply(200, unvoteFixture)
			.persist();
	});

	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should return to the select a delegate page to vote", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Back to select a delegate page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		userEvent.click(backButton());

		expect(container).toMatchSnapshot();
	});

	it("should return to the select a delegate page to unvote", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		// Back to select a delegate page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		userEvent.click(backButton());

		expect(container).toMatchSnapshot();
	});

	it("should return to the select a delegate page to unvote/vote", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Back to select a delegate page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		userEvent.click(backButton());

		expect(container).toMatchSnapshot();
	});

	it("should send a unvote & vote transaction", async () => {
		const votesMock = jest.spyOn(wallet.voting(), "current").mockImplementation(votingMockImplementation);
		await wallet.synchroniser().votes();

		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signUnvoteMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(unvoteFixture.data.id));
		const broadcastUnvoteMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [unvoteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionUnvoteMock = createVoteTransactionMock(wallet);

		const signVoteMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));
		const broadcastVoteMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionVoteMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			userEvent.click(sendButton());
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		setTimeout(() => {
			votesMock.mockRestore();
		}, 3000);

		act(() => {
			jest.runOnlyPendingTimers();
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await waitFor(() => expect(setInterval).toHaveBeenCalledTimes(1));

		const historySpy = jest.spyOn(history, "push");

		// Go back to wallet
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();

		signUnvoteMock.mockRestore();
		broadcastUnvoteMock.mockRestore();
		transactionUnvoteMock.mockRestore();

		signVoteMock.mockRestore();
		broadcastVoteMock.mockRestore();
		transactionVoteMock.mockRestore();
	});

	it("should send a unvote & vote transaction and use split voting method", async () => {
		const votesMock = jest.spyOn(wallet.voting(), "current").mockImplementation(votingMockImplementation);
		await wallet.synchroniser().votes();

		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValueOnce(Promise.resolve(unvoteFixture.data.id))
			.mockReturnValueOnce(Promise.resolve(voteFixture.data.id));

		const broadcastMock = jest
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValueOnce({
				accepted: [unvoteFixture.data.id],
				errors: {},
				rejected: [],
			})
			.mockResolvedValueOnce({
				accepted: [voteFixture.data.id],
				errors: {},
				rejected: [],
			});

		const splitVotingMethodMock = jest.spyOn(wallet.network(), "votingMethod").mockReturnValue("split");

		const transactionUnvoteMock = createUnvoteTransactionMock(wallet);
		const transactionVoteMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			userEvent.click(sendButton());
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		setTimeout(() => {
			votesMock.mockRestore();
		}, 3000);

		act(() => {
			jest.runOnlyPendingTimers();
		});

		await waitFor(() => expect(setInterval).toHaveBeenCalledTimes(1));
		await waitFor(() => {
			expect(signMock).toHaveBeenNthCalledWith(1, {
				data: {
					unvotes: [
						{
							amount: 10,
							id: delegateData[1].publicKey,
						},
					],
				},
				fee: 0.01,
				signatory: expect.any(Signatories.Signatory),
			});
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenNthCalledWith(1, unvoteFixture.data.id));

		await waitFor(() =>
			expect(signMock).toHaveBeenNthCalledWith(2, {
				data: {
					votes: [
						{
							amount: 10,
							id: delegateData[0].publicKey,
						},
					],
				},
				fee: 0.01,
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenNthCalledWith(2, voteFixture.data.id));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionUnvoteMock.mockRestore();
		transactionVoteMock.mockRestore();
		splitVotingMethodMock.mockRestore();
	});

	it.each(["with keyboard", "without keyboard"])("should send a vote transaction %s", async (inputMethod) => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "0.1",
				},
			}),
		);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<FormProvider {...form.current}>
					<LedgerProvider transport={transport}>
						<SendVote />
					</LedgerProvider>
				</FormProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Fee
		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);

		expect(screen.getAllByRole("radio")[2]).toBeChecked();

		// remove focus from fee button
		userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		if (inputMethod === "with keyboard") {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		if (inputMethod === "with keyboard") {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);

		await waitFor(() => {
			expect(passwordInput).toHaveValue(passphrase);
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			if (inputMethod === "with keyboard") {
				userEvent.keyboard("{enter}");
			} else {
				userEvent.click(sendButton());
			}
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should keep the fee when user step back", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "0.02");

		await waitFor(() => expect(inputElement).toHaveValue("0.02"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		// Back to form
		userEvent.click(backButton());
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("0.02"));

		// Back to review step
		userEvent.click(continueButton());

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await expect(screen.findAllByTestId("Amount")).resolves.toBeArray();

		expect(screen.getAllByTestId("Amount")[3]).toHaveTextContent("0.02");
	});

	it("should move back and forth between steps", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "0.02");

		await waitFor(() => expect(inputElement).toHaveValue("0.02"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		// Back to form
		userEvent.click(backButton());
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("0.02"));

		// Back to review step
		userEvent.click(continueButton());

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Authentication Step
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		userEvent.click(backButton());

		// Back to Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Back to AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));
	});

	it("should send a unvote transaction", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(unvoteFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [unvoteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createUnvoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			userEvent.click(sendButton());
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should return to form step by cancelling fee warning", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__cancel-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should proceed to authentication step by confirming fee warning", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__continue-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
	});

	it("should show error if wrong mnemonic", async () => {
		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, "wrong passphrase");
		await waitFor(() => expect(passwordInput).toHaveValue("wrong passphrase"));

		await waitFor(() => expect(sendButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should show error step and go back", async () => {
		jest.useRealTimers();

		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		userEvent.click(continueButton());

		// AuthenticationStep
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		const historyMock = jest.spyOn(history, "push").mockReturnValue();
		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__wallet-button")).toBeInTheDocument();
		expect(container).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		broadcastMock.mockRestore();
	});

	it("should send a unvote transaction with a multisignature wallet", async () => {
		const isMultiSignatureSpy = jest.spyOn(wallet, "isMultiSignature").mockReturnValue(true);
		const multisignatureSpy = jest
			.spyOn(wallet.multiSignature(), "all")
			.mockReturnValue({ min: 2, publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!] });

		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		const signMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(unvoteFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [unvoteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createUnvoteTransactionMock(wallet);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await act(async () => {
			userEvent.click(continueButton());
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

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

	it("should send a vote transaction with a ledger wallet", async () => {
		jest.useFakeTimers();

		const isLedgerSpy = jest.spyOn(wallet, "isLedger").mockImplementation(() => true);

		const getPublicKeySpy = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionSpy = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));

		const voteTransactionMock = createVoteTransactionMock(wallet);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});

		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<LedgerProvider transport={transport}>
					<SendVote />
				</LedgerProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";
		const votes = wallet.voting().current();
		const publicKey = wallet.publicKey();

		const mockWalletData = jest.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key == Contracts.WalletData.Address) {
				return address;
			}
			if (key == Contracts.WalletData.Address) {
				return address;
			}

			if (key == Contracts.WalletData.Balance) {
				return balance;
			}

			if (key == Contracts.WalletData.PublicKey) {
				return publicKey;
			}

			if (key == Contracts.WalletData.Votes) {
				return votes;
			}

			if (key == Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await act(async () => {
			userEvent.click(continueButton());
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		getPublicKeySpy.mockRestore();
		signTransactionSpy.mockRestore();
		isLedgerSpy.mockRestore();
		broadcastMock.mockRestore();
		voteTransactionMock.mockRestore();
		mockWalletData.mockRestore();
	});

	it("should send a vote transaction using encryption password", async () => {
		jest.useRealTimers();

		const actsWithMnemonicMock = jest.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = jest.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const wifGetMock = jest.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const history = createMemoryHistory();
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams();

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: voteURL,
			search: `?${parameters}`,
		});

		// eslint-disable-next-line sonarjs/no-identical-functions
		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "0.1",
				},
			}),
		);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<FormProvider {...form.current}>
					<LedgerProvider transport={transport}>
						<SendVote />
					</LedgerProvider>
				</FormProvider>
			</Route>,
			{
				history,
				routes: [voteURL],
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = jest
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__encryption-password");
		userEvent.paste(passwordInput, "password");

		await waitFor(() => expect(passwordInput).toHaveValue("password"));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			userEvent.click(sendButton());
		});

		await expect(screen.findByTestId("TransactionSuccessful", undefined, { timeout: 4000 })).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();
	});
});
