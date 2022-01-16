import React from "react";

import { PluginPermissionsModal } from "./PluginPermissionsModal";
import { render, screen } from "@/utils/testing-library";

describe("PluginPermissionsModal", () => {
	it("should render", () => {
		const permissions = ["PROFILE", "EVENTS"];

		const { container } = render(<PluginPermissionsModal permissions={permissions} isOpen />);

		expect(screen.getByTestId("PluginPermissionsModal")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);

		for (const permission of permissions) {
			expect(screen.getByText(permission)).toBeInTheDocument();
		}

		expect(container).toMatchSnapshot();
	});
});
