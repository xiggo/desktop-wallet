import { Contracts } from "@payvo/profiles";
import React from "react";
import { env, fireEvent, getDefaultProfileId, renderWithRouter, screen, waitFor } from "utils/testing-library";

import { translations } from "../../i18n";
import { DeleteExchangeTransaction } from "./DeleteExchangeTransaction";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

const onDelete = jest.fn();

describe("DeleteExchangeTransaction", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "inputAddress",
				amount: 1,
				ticker: "btc",
			},
			orderId: "orderId",
			output: {
				address: "outputAddress",
				amount: 100,
				ticker: "ark",
			},
			provider: "provider",
		});
	});

	afterEach(() => {
		onDelete.mockRestore();
	});

	it("should not render if not open", () => {
		const { asFragment } = renderWithRouter(
			<DeleteExchangeTransaction
				exchangeTransaction={exchangeTransaction}
				profile={profile}
				onDelete={onDelete}
			/>,
		);

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = renderWithRouter(
			<DeleteExchangeTransaction
				isOpen={true}
				exchangeTransaction={exchangeTransaction}
				profile={profile}
				onDelete={onDelete}
			/>,
		);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.MODAL_DELETE_EXCHANGE_TRANSACTION.TITLE,
		);
		expect(screen.getByTestId("modal__inner")).toHaveTextContent(
			translations.MODAL_DELETE_EXCHANGE_TRANSACTION.DESCRIPTION,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete exchange transaction", async () => {
		renderWithRouter(
			<DeleteExchangeTransaction
				isOpen={true}
				exchangeTransaction={exchangeTransaction}
				profile={profile}
				onDelete={onDelete}
			/>,
		);

		fireEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(onDelete).toHaveBeenCalled());

		expect(() => profile.exchangeTransactions().findById(exchangeTransaction.id())).toThrowError("Failed to find");
	});
});