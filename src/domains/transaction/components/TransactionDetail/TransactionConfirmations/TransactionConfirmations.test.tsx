import { BigNumber } from "@payvo/helpers";
import React from "react";
import { render } from "testing-library";

import { translations as transactionTranslations } from "../../../i18n";
import { TransactionConfirmations } from "./TransactionConfirmations";

describe("TransactionConfirmations", () => {
	it("should render when confirmed", () => {
		const { container } = render(
			<TransactionConfirmations
				// @ts-ignore
				transaction={{
					confirmations: () => BigNumber.ONE,
					isConfirmed: () => true,
				}}
			/>,
		);

		expect(container).toHaveTextContent("1");
		expect(container).not.toHaveTextContent(transactionTranslations.NOT_YET_CONFIRMED);
		expect(container).toHaveTextContent("circle-check-mark.svg");

		expect(container).toMatchSnapshot();
	});

	it("should render when not confirmed", () => {
		const { container } = render(
			<TransactionConfirmations
				// @ts-ignore
				transaction={{
					confirmations: () => BigNumber.ONE,
					isConfirmed: () => false,
				}}
			/>,
		);

		expect(container).not.toHaveTextContent("1");
		expect(container).toHaveTextContent(transactionTranslations.NOT_YET_CONFIRMED);
		expect(container).toHaveTextContent("clock.svg");

		expect(container).toMatchSnapshot();
	});
});
