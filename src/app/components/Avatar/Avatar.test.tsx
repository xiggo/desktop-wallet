import React from "react";
import { Size } from "types";
import { render } from "utils/testing-library";

import { Avatar } from "./Avatar";

describe("Avatar", () => {
	it("should render", () => {
		const { getByTestId, asFragment } = render(<Avatar address="abc" />);

		expect(getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with highlight", () => {
		const { getByTestId, asFragment } = render(<Avatar address="abc" highlight />);

		expect(getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom shadow color", () => {
		const { getByTestId, asFragment } = render(<Avatar address="abc" shadowClassName="ring-theme-black" />);

		expect(getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with highlight and custom shadow color", () => {
		const { getByTestId, asFragment } = render(
			<Avatar address="abc" shadowClassName="ring-theme-black" highlight />,
		);

		expect(getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without shadow", () => {
		const { getByTestId, asFragment } = render(<Avatar address="abc" size="lg" noShadow />);

		expect(getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "lg", "xl"])("should render with size", (size) => {
		const { getByTestId, asFragment } = render(<Avatar address="abc" size={size as Size} />);

		expect(getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
