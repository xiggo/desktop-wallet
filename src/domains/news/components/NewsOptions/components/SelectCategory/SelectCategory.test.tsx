import React from "react";
import { render } from "utils/testing-library";

import { SelectCategory } from "./SelectCategory";

describe("SelectCategory", () => {
	it("should render", () => {
		const { container, asFragment } = render(<SelectCategory name="category">#All</SelectCategory>);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
