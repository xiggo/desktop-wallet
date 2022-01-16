import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";

import { PluginInfo } from "./PluginInfo";
import { render, screen, within } from "@/utils/testing-library";

describe("PluginInfo", () => {
	it("should render properly", () => {
		const description = "Testing About text content";
		const permissions = ["PROFILE", "EVENTS"];

		const { asFragment } = render(
			<PluginInfo
				description={description}
				permissions={permissions}
				images={["https://payvo.com/screenshot.png"]}
			/>,
		);

		expect(screen.getByTestId("PluginInfo__description")).toHaveTextContent(description);
		expect(screen.getByTestId("PluginInfo__images--pagination")).toBeInTheDocument();
		expect(screen.getAllByTestId("PluginInfo__images--screenshot")).toHaveLength(1);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without permissions", () => {
		const description = "Testing About text content";

		const { asFragment } = render(<PluginInfo description={description} permissions={[]} />);

		expect(screen.queryByTestId("PluginInfo__permissions")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should not show the view permissions button with text less than 50 chars", () => {
		const permissions = ["EVENTS"];

		const { asFragment } = render(<PluginInfo permissions={permissions} />);

		const pluginPermissions = screen.getByTestId("PluginInfo__permissions");

		expect(within(pluginPermissions).queryByRole("button")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should open and close the plugin permissions modal", () => {
		const permissions = ["EVENTS", "PROFILE", "CUSTOM_PERMISSION"];

		const { asFragment } = render(<PluginInfo permissions={permissions} />);

		userEvent.click(within(screen.getByTestId("PluginInfo__permissions")).getByRole("button"));

		expect(screen.getByTestId("PluginPermissionsModal")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(screen.queryByTestId("PluginPermissionsModal")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with minimum version", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const minimumVersion = "3.0.1";

		const { container } = render(<PluginInfo minimumVersion={minimumVersion} />);

		expect(screen.getByTestId("PluginInfo__requirements")).toHaveTextContent(
			t("PLUGINS.PLUGIN_INFO.WALLET_VERSION", { minimumVersion }),
		);
		expect(container).toMatchSnapshot();
	});
});
