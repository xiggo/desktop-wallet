import React from "react";
import { render } from "utils/testing-library";

import { Input } from "./Input";

describe("Input", () => {
	it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
		const { asFragment } = render(<Input isCompact={isCompact} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as custom element", () => {
		const { asFragment, getByTestId } = render(<Input as="select" />);
		const input = getByTestId("Input");

		expect(input.tagName).toEqual("SELECT");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with focus", () => {
		const { asFragment } = render(<Input isFocused />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with invalid", () => {
		const { asFragment, getByTestId } = render(<Input isInvalid={true} errorMessage="Field invalid" />);
		const input = getByTestId("Input__error");

		expect(input).toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with addons", () => {
		const { asFragment, getByText } = render(
			<Input
				addons={{
					end: {
						content: <span>end</span>,
						wrapperClassName: "some-class-name",
					},
					start: {
						content: <span>start</span>,
					},
				}}
			/>,
		);

		expect(getByText("end")).toBeTruthy();
		expect(getByText("end")?.parentElement?.parentElement?.classList.contains("some-class-name")).toBeTruthy();

		expect(getByText("start")).toBeTruthy();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with suggestion", () => {
		const { asFragment, getByTestId } = render(<Input suggestion="suggestion" />);

		expect(getByTestId("Input__suggestion")).toBeTruthy();

		expect(asFragment()).toMatchSnapshot();
	});
});
