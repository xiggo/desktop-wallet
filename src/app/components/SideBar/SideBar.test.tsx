import { screen } from "@testing-library/react";
import React from "react";
import { render } from "utils/testing-library";

import { Item, SideBar } from "./SideBar";

describe("SideBar", () => {
	const items: Item[] = [
		{
			icon: "Sliders",
			itemKey: "general",
			label: "General",
			route: "general",
		},
		{
			icon: "Lock",
			itemKey: "password",
			label: "Password",
			route: "password",
		},
		{
			icon: "ArrowUpTurnBracket",
			itemKey: "export",
			label: "Export",
			route: "export",
		},
	];

	it("should render", () => {
		const { asFragment } = render(
			<SideBar handleActiveItem={jest.fn()} activeItem={items[0].itemKey} items={items} />,
		);

		expect(screen.getAllByRole("listitem").length).toEqual(3);
		expect(asFragment()).toMatchSnapshot();
	});
});
