import React from "react";
import { render } from "utils/testing-library";

import { FTXAd } from "./FTXAd";

describe("FTXAd", () => {
	it("should render", () => {
		const { container, asFragment } = render(<FTXAd />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
