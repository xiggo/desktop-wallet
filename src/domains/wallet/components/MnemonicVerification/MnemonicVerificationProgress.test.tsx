import React from "react";
import { render } from "utils/testing-library";

import { MnemonicVerificationProgress } from "./MnemonicVerificationProgress";

describe("MnemonicVerificationProgress", () => {
	it("should render tabs", () => {
		const positions = [1, 2, 3];
		const { getAllByTestId, asFragment } = render(
			<MnemonicVerificationProgress activeTab={1} wordPositions={positions} />,
		);
		const tabs = getAllByTestId("MnemonicVerificationProgress__Tab");

		expect(tabs).toHaveLength(positions.length);
		expect(asFragment()).toMatchSnapshot();
	});
});
