import React from "react";
import { render } from "utils/testing-library";

import { Range } from "./Range";

describe("Range", () => {
	it("should render", () => {
		const onChange = jest.fn();
		const { getByTestId, asFragment } = render(<Range values={[10]} onChange={onChange} />);

		expect(getByTestId("Range")).toBeInTheDocument();
		expect(getByTestId("Range__track")).toBeInTheDocument();
		expect(getByTestId("Range__track__filled")).toBeInTheDocument();
		expect(getByTestId("Range__thumb")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render invalid", () => {
		const onChange = jest.fn();
		const { getByTestId, asFragment } = render(<Range values={[10]} isInvalid onChange={onChange} />);

		expect(getByTestId("Range")).toBeInTheDocument();
		expect(getByTestId("Range__track")).toBeInTheDocument();
		expect(getByTestId("Range__track__filled")).toBeInTheDocument();
		expect(getByTestId("Range__thumb")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
