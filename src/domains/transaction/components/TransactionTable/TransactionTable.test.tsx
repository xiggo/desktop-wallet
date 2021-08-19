import { sortByDesc } from "@arkecosystem/utils";
import { Contracts, DTO } from "@payvo/profiles";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as useRandomNumberHook from "app/hooks/use-random-number";
import nock from "nock";
import React from "react";
import { env, getDefaultProfileId, getDefaultWalletId, renderWithRouter, waitFor } from "utils/testing-library";

import { TransactionTable } from "./TransactionTable";

describe("TransactionTable", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transactions: DTO.ExtendedConfirmedTransactionData[];

	beforeAll(() => {
		nock("https://ark-test.payvo.com/api")
			.get("/transactions")
			.query(true)
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"));
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		const allTransactions = await wallet.transactionIndex().all();
		transactions = allTransactions.items();
	});

	it("should render", () => {
		const { asFragment } = renderWithRouter(<TransactionTable transactions={transactions} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with currency", () => {
		renderWithRouter(<TransactionTable transactions={transactions} exchangeCurrency="BTC" />);

		expect(screen.getAllByTestId("TransactionRow__currency")).toHaveLength(transactions.length);
	});

	it("should render with memo", () => {
		const mockMemo = jest.spyOn(transactions[0], "memo").mockReturnValue("memo");

		renderWithRouter(<TransactionTable transactions={transactions} showMemoColumn />);

		expect(screen.getAllByTestId("TransactionRowMemo__vendorField")).toHaveLength(1);

		mockMemo.mockRestore();
	});

	it("should render compact", () => {
		const { asFragment } = renderWithRouter(<TransactionTable transactions={transactions} isCompact />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	describe("loading state", () => {
		let useRandomNumberSpy: jest.SpyInstance;

		beforeAll(() => {
			useRandomNumberSpy = jest.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
		});

		afterAll(() => {
			useRandomNumberSpy.mockRestore();
		});

		it("should render", () => {
			const { asFragment } = renderWithRouter(
				<TransactionTable transactions={[]} isLoading skeletonRowsLimit={5} />,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render with currency column", () => {
			const { asFragment } = renderWithRouter(
				<TransactionTable transactions={[]} isLoading exchangeCurrency="BTC" skeletonRowsLimit={5} />,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render with memo column", () => {
			const { asFragment } = renderWithRouter(
				<TransactionTable transactions={[]} isLoading showMemoColumn skeletonRowsLimit={5} />,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render compact", () => {
			const { asFragment } = renderWithRouter(
				<TransactionTable transactions={[]} isLoading isCompact skeletonRowsLimit={5} />,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});
	});

	it("should emit action on the row click", () => {
		const onClick = jest.fn();
		const sortedByDateDesc = sortByDesc(transactions, (transaction) => transaction.timestamp());

		renderWithRouter(<TransactionTable transactions={sortedByDateDesc} onRowClick={onClick} />);

		userEvent.click(screen.getAllByTestId("TableRow")[0]);

		expect(onClick).toHaveBeenCalledWith(sortedByDateDesc[0]);
	});

	it("should emit action on the compact row click", async () => {
		const onClick = jest.fn();

		renderWithRouter(<TransactionTable transactions={transactions} onRowClick={onClick} isCompact />);

		userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(transactions[1]));
	});
});
