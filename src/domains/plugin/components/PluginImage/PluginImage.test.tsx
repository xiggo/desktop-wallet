import React from "react";
import { Size } from "types";
import * as utils from "utils/electron-utils";
import { fireEvent, render, screen } from "utils/testing-library";

import { PluginImage } from "./PluginImage";

describe("PluginImage", () => {
	it("should render image placeholder", () => {
		const { container } = render(<PluginImage />);

		expect(screen.getByTestId("PluginImage")).toHaveTextContent("plugin-logo-placeholder.svg");
		expect(container).toMatchSnapshot();
	});

	it("should render image logo", () => {
		const { container } = render(<PluginImage logoURL="https://payvo.com/logo.png" />);

		expect(screen.getByTestId("PluginImage")).not.toHaveTextContent("plugin-logo-placeholder.svg");
		expect(screen.getByTestId("PluginImage")).not.toHaveTextContent("exchange-logo-placeholder.svg");
		expect(container).toMatchSnapshot();
	});

	it.each(["dark", "light"])("should render updating element in %s mode", (theme) => {
		const utilsSpy = jest.spyOn(utils, "shouldUseDarkColors").mockImplementation(() => theme === "dark");

		const { container } = render(<PluginImage updatingProgress={25} isUpdating />);

		expect(screen.getByTestId("CircularProgressBar__percentage")).toBeInTheDocument();
		expect(container).toMatchSnapshot();

		utilsSpy.mockRestore();
	});

	it("should render updating with label", () => {
		const { container } = render(<PluginImage updatingProgress={25} isUpdating showUpdatingLabel />);

		expect(screen.getByTestId("PluginImage__updating__label")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it.each(["3xs", "2xs", "xs", "sm", "md", "lg"])("should render with size '%s'", (size) => {
		const { container } = render(<PluginImage size={size as Size} />);

		expect(screen.getByTestId("PluginImage")).toHaveTextContent("plugin-logo-placeholder.svg");
		expect(container).toMatchSnapshot();
	});

	it("should show placeholder as fallback", () => {
		const { container } = render(<PluginImage logoURL="https://payvo.com/logo.png" />);

		fireEvent.error(screen.getByRole("img"));

		expect(screen.getByTestId("PluginImage")).toHaveTextContent("plugin-logo-placeholder.svg");
		expect(container).toMatchSnapshot();
	});
});
