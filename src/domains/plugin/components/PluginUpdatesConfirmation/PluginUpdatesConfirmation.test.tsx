import React from "react";
import { render, screen } from "utils/testing-library";

import { PluginUpdatesConfirmation } from "./PluginUpdatesConfirmation";

describe("Plugin Updates Confirmation", () => {
	const plugins = [
		{
			isOfficial: true,
			logo: "https://payvo.com/logo.png",
			title: "ARK Explorer",
			updateStatus: {
				isAvailable: true,
				isCompatible: true,
				minimumVersion: "3.0.5",
			},
		},
		{
			title: "Animal Avatars",
			updateStatus: {
				isAvailable: true,
				isCompatible: false,
				minimumVersion: "3.1.0",
			},
		},
	];

	it("should render", () => {
		const { container } = render(<PluginUpdatesConfirmation isOpen plugins={plugins} />);

		expect(screen.getAllByRole("row")).toHaveLength(3);
		expect(screen.getByText("ARK Explorer")).toBeInTheDocument();
		expect(screen.getByText("3.1.0")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});
});
