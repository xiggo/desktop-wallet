import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";

import { PluginUpdatesConfirmation } from "./PluginUpdatesConfirmation";
import { render, screen } from "@/utils/testing-library";

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

	it("should render with compatible updates", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const { container } = render(<PluginUpdatesConfirmation isOpen plugins={[plugins[0]]} />);

		expect(screen.getAllByRole("row")).toHaveLength(2);
		expect(container).toHaveTextContent(t("PLUGINS.MODAL_UPDATES_CONFIRMATION.DESCRIPTION_COMPATIBLE"));
		expect(screen.getByText(plugins[0].title)).toBeInTheDocument();
		expect(screen.getByText(plugins[0].updateStatus.minimumVersion)).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render with compatible and incompatible updates", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const { container } = render(<PluginUpdatesConfirmation isOpen plugins={plugins} />);

		expect(screen.getAllByRole("row")).toHaveLength(3);
		expect(container).toHaveTextContent(t("PLUGINS.MODAL_UPDATES_CONFIRMATION.DESCRIPTION_INCOMPATIBLE"));

		for (const plugin of plugins) {
			expect(screen.getByText(plugin.title)).toBeInTheDocument();
			expect(screen.getByText(plugin.updateStatus.minimumVersion)).toBeInTheDocument();
		}

		expect(container).toMatchSnapshot();
	});
});
