import React from "react";

import { ListDividedItem } from "./ListDividedItem";
import { render, screen } from "@/utils/testing-library";

describe("ListDividedItem", () => {
	it("should render an ListDividedItem", () => {
		const { container, asFragment } = render(<ListDividedItem />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as floating label", () => {
		const { asFragment } = render(<ListDividedItem isFloatingLabel />);

		expect(screen.getByTestId("list-divided-item__inner-wrapper")).toHaveClass("flex-col items-start");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the label", () => {
		const { asFragment } = render(<ListDividedItem label="Label" />);

		expect(screen.getByTestId("list-divided-item__label")).toHaveTextContent("Label");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the labelDescription", () => {
		const { asFragment } = render(<ListDividedItem labelDescription="Label Desc" />);

		expect(screen.getByTestId("list-divided-item__label--description")).toHaveTextContent("Label Desc");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the value", () => {
		const { asFragment } = render(<ListDividedItem value="Value" />);

		expect(screen.getByTestId("list-divided-item__value")).toHaveTextContent("Value");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the content", () => {
		const { asFragment } = render(<ListDividedItem content="Content" />);

		expect(screen.getByTestId("list-divided-item__content")).toHaveTextContent("Content");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with labelAddon", () => {
		const { asFragment } = render(<ListDividedItem labelAddon={<span>Test</span>} content="Content" />);

		expect(screen.getByTestId("list-divided-item__content")).toHaveTextContent("Content");
		expect(asFragment()).toMatchSnapshot();
	});
});
