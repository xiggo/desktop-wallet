import React from "react";
import { renderWithoutRouter } from "utils/testing-library";

import { Image } from "./Image";

describe("Image", () => {
	it("should render", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="WelcomeBanner" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with domain", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="GenericError" domain="error" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render nothing if image can't be found", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="NotExistingImage" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with string", () => {
		const { container, asFragment } = renderWithoutRouter(<Image name="WelcomeModalStep1" domain="profile" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
