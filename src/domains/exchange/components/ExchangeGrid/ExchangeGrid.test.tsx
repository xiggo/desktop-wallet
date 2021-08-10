import React from "react";
import { fireEvent, render, screen } from "utils/testing-library";

import { ExchangeGrid } from "./ExchangeGrid";

describe("ExchangeGrid", () => {
	it("should render", () => {
		const { asFragment } = render(<ExchangeGrid exchanges={[{ id: "exchange" }]} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty", () => {
		const { asFragment } = render(<ExchangeGrid exchanges={[]} />);

		expect(screen.getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onClick callback", () => {
		const onClick = jest.fn();

		render(<ExchangeGrid exchanges={[{ id: "exchange" }]} onClick={onClick} />);

		fireEvent.click(screen.getByTestId("Card"));

		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: "exchange" }));
	});
});
