import { render, screen } from "@testing-library/react";
import React from "react";

import { TransactionRowMemo } from "./TransactionRowMemo";

describe("TransactionRowMemo", () => {
	it("should show memo", () => {
		const { rerender, asFragment } = render(<TransactionRowMemo memo="memo" />);

		expect(screen.getByTestId("TransactionRowMemo__vendorField")).toBeInTheDocument();

		rerender(<TransactionRowMemo memo={undefined} />);

		expect(screen.queryByTestId("TransactionRowMemo__vendorField")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
