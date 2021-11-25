import React from "react";

import { render } from "@/utils/testing-library";

import { OfficialPluginIcon } from "./OfficialPluginIcon";

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
