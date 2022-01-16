/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SearchWallet } from "./SearchWallet";
import { translations } from "@/domains/wallet/i18n";
import { act, env, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";

const history = createMemoryHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
let wallets: Contracts.IReadWriteWallet[];
let profile: Contracts.IProfile;

const walletAlias = "Sample Wallet";

describe.each([true, false])("SearchWallet uses fiat value = %s", (showConvertedValue) => {
	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallets = profile.wallets().values();
		wallets[0].settings().set(Contracts.WalletSetting.Alias, walletAlias);
	});

	it("should render", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with the default exchange currency enabled from profile settings", async () => {
		const walletWithExchangeCurrencyMock = jest
			.spyOn(wallets[0], "exchangeCurrency")
			.mockReturnValue(undefined as any);
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		expect(asFragment()).toMatchSnapshot();

		walletWithExchangeCurrencyMock.mockRestore();
	});

	it("should render with selected address", async () => {
		const onSelectWallet = jest.fn();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={onSelectWallet}
					selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		expect(screen.getByTestId("SearchWalletListItem__selected-0")).toBeInTheDocument();
		expect(screen.getByTestId("SearchWalletListItem__select-1")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SearchWalletListItem__selected-0"));

		expect(onSelectWallet).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				name: wallets[0].alias(),
				network: expect.any(Networks.Network),
			}),
		);

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-1"));

		expect(onSelectWallet).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				address: wallets[1].address(),
				name: wallets[1].alias(),
				network: expect.any(Networks.Network),
			}),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", () => {
		const onClose = jest.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					onClose={onClose}
					showConvertedValue={showConvertedValue}
					wallets={[]}
					title={"title"}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should filter wallets by address", async () => {
		jest.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "D8rr7B1d6TL6pf1");

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
		jest.useRealTimers();
	});

	it("should filter wallets by alias", async () => {
		jest.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, walletAlias);

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));

		jest.useRealTimers();
	});

	it("should reset wallet search", async () => {
		jest.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		// Search by wallet alias
		userEvent.paste(searchInput, walletAlias);

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));

		// Reset search
		userEvent.click(screen.getByTestId("header-search-bar__reset"));

		await waitFor(() => expect(searchInput).not.toHaveValue());
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		jest.useRealTimers();
	});

	it("should not find search wallet and show empty results screen", async () => {
		jest.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				routes: [dashboardURL],
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(screen.getByTestId("Input"), "non existent wallet name");

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.getByTestId("Input")).toHaveValue("non existent wallet name"));
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(0));

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();

		jest.useRealTimers();
	});

	it("should disable the `Select` button if the wallet fulfills the condition", async () => {
		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				showConvertedValue={showConvertedValue}
				disableAction={(wallet: Contracts.IReadWriteWallet) => wallet.alias() === walletAlias}
				onSelectWallet={() => void 0}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(2));

		expect(screen.getAllByTestId("TableRow")[0]).toHaveTextContent(walletAlias);
		expect(within(screen.getAllByTestId("TableRow")[0]).getByRole("button")).toBeDisabled();

		expect(screen.getAllByTestId("TableRow")[1]).not.toHaveTextContent(walletAlias);
		expect(within(screen.getAllByTestId("TableRow")[1]).getByRole("button")).not.toBeDisabled();
	});
});
