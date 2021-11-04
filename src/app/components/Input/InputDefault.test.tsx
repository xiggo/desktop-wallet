import React from "react";
import { render } from "utils/testing-library";

import { InputDefault } from "./InputDefault";

describe("InputDefault", () => {
	it("should render a default input", () => {
		const { asFragment } = render(<InputDefault />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a custom element", () => {
		const { getByTestId } = render(<InputDefault as="select" />);
		const input = getByTestId("Input");

		expect(input.tagName).toBe("SELECT");
	});
});
