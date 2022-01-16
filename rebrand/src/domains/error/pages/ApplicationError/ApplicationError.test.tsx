import userEvent from "@testing-library/user-event";
import React from "react";

import { ApplicationError } from "./ApplicationError";
import { translations } from "@/domains/error/i18n";
import { render, screen } from "@/utils/testing-library";

describe("ApplicationError", () => {
	it("should render", () => {
		const onResetErrorBoundary = jest.fn();
		const { asFragment, container } = render(<ApplicationError resetErrorBoundary={onResetErrorBoundary} />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(translations.APPLICATION.TITLE);
		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(translations.APPLICATION.DESCRIPTION);

		userEvent.click(screen.getByTestId("ApplicationError__button--reload"));

		expect(onResetErrorBoundary).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
