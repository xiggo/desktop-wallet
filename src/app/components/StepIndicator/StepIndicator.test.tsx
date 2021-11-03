import React from "react";
import { render } from "utils/testing-library";

import { StepIndicator } from "./StepIndicator";

describe("StepIndicator", () => {
	it("should render", () => {
		const { container, asFragment } = render(<StepIndicator />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
