import React from "react";

import { Box } from "./Box";
import { render } from "@/utils/testing-library";

describe("Shared Box", () => {
	it("should render", () => {
		const { container } = render(<Box styled={{ color: "black" }} />);

		expect(container).toMatchInlineSnapshot(`
		<div>
		  <div
		    class="sc-dkPtRN jCIFcz"
		  />
		</div>
	`);
	});
});
