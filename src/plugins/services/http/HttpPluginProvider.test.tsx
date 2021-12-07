import React from "react";

import { HttpPluginProvider } from "./HttpPluginProvider";
import { PluginManager } from "@/plugins/core";
import { render } from "@/utils/testing-library";

describe("HttpPluginProvider", () => {
	it("should render properly", () => {
		const pluginManager = new PluginManager();
		const { container } = render(
			<HttpPluginProvider manager={pluginManager}>
				<div>Test</div>
			</HttpPluginProvider>,
		);

		expect(container).toMatchSnapshot();
	});
});
