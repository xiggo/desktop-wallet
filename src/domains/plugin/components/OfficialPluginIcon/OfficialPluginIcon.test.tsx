import React from "react";

import { OfficialPluginIcon } from "./OfficialPluginIcon";
import { render } from "@/utils/testing-library";

describe("OfficialPluginIcon", () => {
	it("should render", () => {
		const { container } = render(<OfficialPluginIcon />);

		expect(container).toHaveTextContent("shield-check-mark.svg");
	});

	it("should render with size", () => {
		const { container } = render(<OfficialPluginIcon size="lg" />);

		expect(container).toHaveTextContent("shield-check-mark.svg");
	});
});
