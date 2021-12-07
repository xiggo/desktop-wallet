import React from "react";

import { TransactionNetwork } from "./TransactionNetwork";
import { translations } from "@/domains/transaction/i18n";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { render } from "@/utils/testing-library";

describe("TransactionNetwork", () => {
	it("should render", () => {
		const network = availableNetworksMock.find((network) => network.id() === "ark.devnet");

		const { container } = render(<TransactionNetwork network={network!} />);

		expect(container).toHaveTextContent(translations.CRYPTOASSET);
		expect(container).toHaveTextContent("ark.svg");

		expect(container).toMatchSnapshot();
	});
});
