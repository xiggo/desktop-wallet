import React from "react";
import { render } from "testing-library";

import { ExchangeCard } from "./ExchangeCard";

const exchange = {
	id: "test-exchange",
	name: "Test Exchange",
};

describe("ExchangeCard", () => {
	it("should render", () => {
		const { container, getByText } = render(<ExchangeCard exchange={exchange} />);

		expect(getByText(exchange.name)).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});
});
