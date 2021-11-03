import React from "react";
import { render } from "utils/testing-library";

import { CircularProgressBar } from "./CircularProgressBar";

describe("CircularProgressBar", () => {
	it("should render", () => {
		const { container, asFragment, getByTestId } = render(<CircularProgressBar value={50} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
		expect(getByTestId("CircularProgressBar__percentage")).toHaveTextContent("50%");
	});

	it("should render without text content", () => {
		const { container, asFragment } = render(<CircularProgressBar showValue={false} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
