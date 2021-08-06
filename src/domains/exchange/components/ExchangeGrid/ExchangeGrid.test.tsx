import React from "react";
import { render, screen } from "utils/testing-library";

import { ExchangeGrid } from "./ExchangeGrid";

describe("ExchangeGrid", () => {
	it("should render", () => {
		const { asFragment } = render(<ExchangeGrid exchanges={[{ id: "exchange", updateStatus: {} }]} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty", () => {
		const { asFragment } = render(<ExchangeGrid exchanges={[]} />);

		expect(screen.getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
