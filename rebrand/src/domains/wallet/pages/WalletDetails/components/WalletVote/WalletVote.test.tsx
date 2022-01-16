import { Contracts, ReadOnlyWallet } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";

import { WalletVote } from "./WalletVote";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;
let defaultDelegate: {
	address: string;
	publicKey?: string;
	explorerLink: string;
	isDelegate: boolean;
	isResignedDelegate: boolean;
	governanceIdentifier: string;
};

const smallIcon = () => screen.getByText("hint-small.svg");

const multivote = "WALLETS.PAGE_WALLET_DETAILS.VOTES.MULTIVOTE";

describe("WalletVote", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		defaultDelegate = {
			address: wallet.address(),
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: false,
			isResignedDelegate: false,
			publicKey: wallet.publicKey(),
		};

		await syncDelegates(profile);
		await wallet.synchroniser().votes();
	});

	it("should render", async () => {
		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without votes", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([]);

		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByText(t("COMMON.LEARN_MORE"))).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should render disabled vote button", async () => {
		const balanceSpy = jest.spyOn(wallet, "balance").mockReturnValue(0);

		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByRole("button")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();

		balanceSpy.mockRestore();
	});

	it("should disable vote button when balance is less than votesAmountStep", async () => {
		const usesLockedBalance = jest.spyOn(wallet.network(), "usesLockedBalance").mockReturnValue(true);
		const votesAmountStepSpy = jest.spyOn(wallet.network(), "votesAmountStep").mockReturnValue(10);
		const balanceSpy = jest.spyOn(wallet, "balance").mockReturnValue(5);

		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByRole("button")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();

		usesLockedBalance.mockRestore();
		votesAmountStepSpy.mockRestore();
		balanceSpy.mockRestore();
	});

	it("should handle wallet votes error", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const walletSpy = jest.spyOn(wallet.voting(), "current").mockImplementation(() => {
			throw new Error("delegate error");
		});

		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByText(t("COMMON.LEARN_MORE"))).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should handle delegate sync error", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const delegateSyncSpy = jest.spyOn(env.delegates(), "sync").mockImplementation(() => {
			throw new Error("delegate error");
		});
		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([]);

		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(screen.getByText(t("COMMON.LEARN_MORE"))).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		delegateSyncSpy.mockRestore();
		walletSpy.mockRestore();
	});

	it("should render the maximum votes", async () => {
		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([]);
		const maxVotesSpy = jest.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101);

		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();
		await expect(screen.findByText("0/101")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		walletSpy.mockRestore();
		maxVotesSpy.mockRestore();
	});

	describe("single vote networks", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		it("should render a vote for an active delegate", async () => {
			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 10,
						username: "arkx",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			const delegate = wallet.voting().current()[0];

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(delegate.wallet!.username()!)).toBeInTheDocument();
			expect(screen.getByText(`#${delegate.wallet!.rank()}`)).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for a standby delegate", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 52,
						username: "arkx",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			const delegate = wallet.voting().current()[0];

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(delegate.wallet!.username()!)).toBeInTheDocument();
			expect(screen.getByText(`#${delegate.wallet!.rank()}`)).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: 1 }))).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for a delegate without rank", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: false,
						username: "arkx",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			const delegate = wallet.voting().current()[0];

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(delegate.wallet!.username()!)).toBeInTheDocument();
			expect(screen.getByText(t("COMMON.NOT_AVAILABLE"))).toBeInTheDocument();

			expect(screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: 1 }))).toBeInTheDocument();

			expect(smallIcon()).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});
	});

	describe("multi vote networks", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		let maxVotesSpy: jest.SpyInstance;

		beforeEach(() => (maxVotesSpy = jest.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(101)));

		afterEach(() => maxVotesSpy.mockRestore());

		it("should render a vote for multiple active delegates", async () => {
			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 2,
						username: "arky",
					}),
				},
			];

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue(votes);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();
			expect(
				screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE", { count: votes.length })),
			).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for multiple standby delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const votes = [
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						username: "arky",
					}),
				},
			];

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue(votes);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();
			expect(
				screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY", { count: votes.length })),
			).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for multiple active and standby delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						username: "arky",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();
			expect(
				screen.getByText(t("WALLETS.PAGE_WALLET_DETAILS.VOTES.ACTIVE_COUNT", { count: 1 })),
			).toBeInTheDocument();
			expect(
				screen.getByText(`/ ${t("WALLETS.PAGE_WALLET_DETAILS.VOTES.STANDBY_COUNT", { count: 1 })}`),
			).toBeInTheDocument();

			expect(smallIcon()).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for multiple active and resigned delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: true,
						username: "arky",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();

			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Active 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Resigned 1");

			expect(smallIcon()).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for multiple standby and resigned delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: true,
						username: "arky",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();

			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Standby 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Resigned 1");

			expect(smallIcon()).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});

		it("should render a vote for multiple active, standby and resigned delegates", async () => {
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						rank: 1,
						username: "arkx",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						username: "arky",
					}),
				},
				{
					amount: 0,
					wallet: new ReadOnlyWallet({
						...defaultDelegate,
						isDelegate: true,
						isResignedDelegate: true,
						username: "arkz",
					}),
				},
			]);

			const { asFragment } = render(
				<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
			);

			await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

			expect(screen.getByText(t(multivote))).toBeInTheDocument();

			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Active 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Standby 1");
			expect(screen.getByTestId("WalletVote")).toHaveTextContent("Resigned 1");

			expect(smallIcon()).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			walletSpy.mockRestore();
		});
	});

	it("should emit action on multivote click", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 1,
					username: "arkx",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					rank: 2,
					username: "arky",
				}),
			},
		]);

		const onButtonClick = jest.fn();

		render(<WalletVote profile={profile} wallet={wallet} onButtonClick={onButtonClick} env={env} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		userEvent.click(screen.getByText(t(multivote)));

		expect(onButtonClick).toHaveBeenCalledWith("current");

		walletSpy.mockRestore();
	});

	it("should emit action on button click", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();
		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([]);

		const onButtonClick = jest.fn();

		render(<WalletVote profile={profile} wallet={wallet} onButtonClick={onButtonClick} env={env} />);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("WalletVote")).not.toBeDisabled());

		userEvent.click(screen.getByText(t("COMMON.VOTE")));

		expect(onButtonClick).toHaveBeenCalledWith();

		walletSpy.mockRestore();
	});

	it("should render as all resigned", async () => {
		const walletSpy = jest.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					isDelegate: true,
					isResignedDelegate: true,
					username: "arky",
				}),
			},
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					...defaultDelegate,
					isDelegate: true,
					isResignedDelegate: true,
					username: "arky",
				}),
			},
		]);
		const { asFragment } = render(
			<WalletVote profile={profile} wallet={wallet} onButtonClick={jest.fn()} env={env} />,
		);

		await expect(screen.findByTestId("WalletVote")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		walletSpy.mockRestore();
	});
});
