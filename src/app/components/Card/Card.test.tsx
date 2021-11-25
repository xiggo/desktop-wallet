import React from "react";

import { fireEvent, render, screen } from "@/utils/testing-library";

import { Card } from "./Card";

describe("Card", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Card />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle click", () => {
		const handleClick = jest.fn();
		const { container, asFragment } = render(<Card onClick={() => handleClick()}>Test</Card>);

		expect(container).toBeInTheDocument();

		fireEvent.click(screen.getByText("Test"));

		expect(handleClick).toHaveBeenCalledWith();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should selected", () => {
		const { container, asFragment } = render(<Card isSelected={true} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
