import React from "react";
import { act, fireEvent, render, screen } from "utils/testing-library";

import { translations as transactionTranslations } from "../../../i18n";
import { TransactionAmount } from "./TransactionAmount";

describe("TransactionAmount", () => {
	it("should render", () => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" />);

		expect(container).toMatchSnapshot();
	});

	it("should render currency amount", () => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" />);

		expect(container).toHaveTextContent("1 DARK");
		expect(container).toMatchSnapshot();
	});

	it("should render converted currency amount", () => {
		const { container } = render(
			<TransactionAmount amount={1} convertedAmount={1} currency="DARK" exchangeCurrency="ARK" />,
		);

		expect(container).toHaveTextContent("1 DARK");
		expect(container).toHaveTextContent("1 ARK");
	});

	it.each([false, true])("should render label for multiple recipients", (isMultiPayment) => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" isMultiPayment={isMultiPayment} />);

		expect(container).toHaveTextContent(
			isMultiPayment ? transactionTranslations.TOTAL_AMOUNT : transactionTranslations.AMOUNT,
		);
		expect(container).toMatchSnapshot();
	});

	it.each(["Sent", "Received"])("should render '%s' icon", (type) => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" isSent={type === "Sent"} />);

		expect(container).toHaveTextContent(`${type.toLowerCase()}.svg`);
	});

	it.each(["Sent", "Received"])("should render info indicator for '%s'", (type) => {
		render(
			<TransactionAmount amount={2} returnedAmount={1} isMultiPayment currency="DARK" isSent={type === "Sent"} />,
		);

		expect(screen.getByTestId("TransactionAmount__Hint_Amount")).toBeInTheDocument();
		expect(screen.getByText("hint-small.svg")).toBeInTheDocument();

		act(() => {
			fireEvent.mouseEnter(screen.getByTestId("TransactionAmount__Hint_Amount"));
		});

		expect(screen.getByText("Excluding 1 DARK sent to itself")).toBeInTheDocument();
	});
});
