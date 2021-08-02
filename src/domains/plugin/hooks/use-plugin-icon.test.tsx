import React from "react";
import { render } from "utils/testing-library";

import { usePluginIcon } from "./use-plugin-icon";

const Component = (params: { isOfficial?: boolean }) => {
	const { renderPluginIcon } = usePluginIcon();

	return <span>{renderPluginIcon(params)}</span>;
};

describe("#usePluginIcon", () => {
	it("should render `official` icon", () => {
		const { container } = render(<Component isOfficial />);

		expect(container).toHaveTextContent("official-plugin.svg");
	});
});
