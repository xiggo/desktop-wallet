import userEvent from "@testing-library/user-event";
import React from "react";

import { ImportError } from "@/domains/profile/pages/ImportProfile/ErrorStep";
import { render, screen } from "@/utils/testing-library";

describe("Import Profile - Error Step", () => {
	const file = { content: "dfdf", extension: ".dwe", name: "filename" };

	it("should render", () => {
		const { container } = render(<ImportError file={file} />);

		expect(container).toMatchSnapshot();
	});

	it("should emit back event", () => {
		const onBack = jest.fn();
		render(<ImportError file={file} onBack={onBack} />);
		userEvent.click(screen.getByTestId("ImportError__back"));

		expect(onBack).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should emit retry event", () => {
		const onRetry = jest.fn();
		render(<ImportError file={file} onRetry={onRetry} />);
		userEvent.click(screen.getByTestId("ImportError__retry"));

		expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});
});
