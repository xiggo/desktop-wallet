import React from "react";

import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { render } from "@/utils/testing-library";

describe("WalletsControls", () => {
	const filterProperties: FilterWalletsHookProperties = {
		defaultConfiguration: {
			selectedNetworkIds: [],
			walletsDisplayType: "all",
		},
		disabled: false,
		isFilterChanged: false,
		networks: [],
		selectedNetworkIds: [],
		update: jest.fn(),
		useTestNetworks: true,
		walletsDisplayType: "all",
	};

	it("should render", () => {
		const { container } = render(<WalletsControls filterProperties={filterProperties} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with networks selection", () => {
		const { container } = render(<WalletsControls filterProperties={filterProperties as any} />);

		expect(container).toMatchSnapshot();
	});
});
