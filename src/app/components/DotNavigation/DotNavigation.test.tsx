import React from "react";
import { fireEvent, render } from "testing-library";

import { DotNavigation } from "./DotNavigation";

describe("DotNavigation", () => {
	it("should render", () => {
		const { container, asFragment } = render(<DotNavigation />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("handles click on a dot", () => {
		const clickMock = jest.fn();
		const { getByTestId } = render(<DotNavigation onClick={clickMock} />);

		fireEvent.click(getByTestId("DotNavigation-Step-1"));

		expect(clickMock).toHaveBeenCalledWith(1);
	});
});
