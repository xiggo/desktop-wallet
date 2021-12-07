import React from "react";

import { TransactionExplorerLink } from "./TransactionExplorerLink";
import { translations } from "@/domains/transaction/i18n";
import { render } from "@/utils/testing-library";

describe("TransactionExplorerLink", () => {
	it("should render a transaction link", () => {
		const { container } = render(
			<TransactionExplorerLink
				// @ts-ignore
				transaction={{
					explorerLink: () => "transaction-link",
					id: () => "test-id",
				}}
			/>,
		);

		expect(container).toHaveTextContent(translations.ID);
		expect(container).toMatchSnapshot();
	});
});
