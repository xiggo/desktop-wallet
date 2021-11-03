import React from "react";
import { render } from "utils/testing-library";

import { ButtonSpinner } from "./ButtonSpinner";

describe("ButtonSpinner", () => {
	beforeAll(() => {
		jest.spyOn(console, "error").mockImplementation(() => null);
	});

	afterAll(() => {
		console.error.mockRestore();
	});

	it("should render", () => {
		const { container } = render(<ButtonSpinner />);

		expect(container).toMatchSnapshot();
	});

	it.each(["primary", "secondary", "danger", "transparent", "info", "reverse"])(
		"should render a %s variant",
		(variant) => {
			const { container } = render(<ButtonSpinner color={variant} />);

			expect(container).toMatchSnapshot();
		},
	);
});
