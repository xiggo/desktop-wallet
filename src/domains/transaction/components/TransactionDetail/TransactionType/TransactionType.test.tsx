import React from "react";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { render } from "@/utils/testing-library";

describe("TransactionType", () => {
	it("should render", () => {
		const { container } = render(<TransactionType type="multiPayment" />);

		expect(container).toHaveTextContent("multipayment.svg");
		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.MULTI_PAYMENT);

		expect(container).toMatchSnapshot();
	});
});
