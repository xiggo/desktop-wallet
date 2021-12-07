import React from "react";

import { StepIndicator } from "./StepIndicator";
import { render } from "@/utils/testing-library";

describe("StepIndicator", () => {
	it("should render", () => {
		const { container, asFragment } = render(<StepIndicator />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
