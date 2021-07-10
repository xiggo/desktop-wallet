import { render, screen } from "@testing-library/react";
import React from "react";

import { AppearanceFooterButtons } from "./AppearanceFooterButtons";

describe("AppearanceFooterButtons", () => {
	it("should render", () => {
		const { asFragment } = render(<AppearanceFooterButtons isSaveDisabled={false} />);

		expect(screen.getByTestId("AppearanceFooterButtons__save")).not.toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { asFragment } = render(<AppearanceFooterButtons isSaveDisabled={true} />);

		expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});
});
