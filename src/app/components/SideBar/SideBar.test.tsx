import React from "react";
import { renderWithRouter } from "testing-library";

import { SideBar } from "./SideBar";

describe("SideBar", () => {
	it("should render empty", () => {
		const { container, asFragment } = renderWithRouter(<SideBar />);

		expect(container).toBeTruthy();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with items", () => {
		const items = [
			{
				icon: "Sliders",
				key: "general",
				label: "General",
			},
			{
				icon: "Lock",
				key: "password",
				label: "Password",
			},
			{
				icon: "ArrowUpTurnBracket",
				key: "export",
				label: "Export",
			},
		];

		const { container, asFragment, getAllByRole } = renderWithRouter(<SideBar items={items} />);

		expect(container).toBeTruthy();
		expect(getAllByRole("listitem").length).toEqual(3);
		expect(asFragment()).toMatchSnapshot();
	});
});
