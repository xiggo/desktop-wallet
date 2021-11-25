import React from "react";

import { FormFieldProvider } from "@/app/components/Form/useFormField";
import { fireEvent, render, screen } from "@/utils/testing-library";

import { InputPassword } from "./InputPassword";

describe("InputPassword", () => {
	it("should render as a password field", () => {
		const { asFragment } = render(<InputPassword />);
		const input = screen.getByTestId("InputPassword");

		expect(input).toHaveAttribute("type", "password");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should toggle the input type", () => {
		render(<InputPassword />);
		const input = screen.getByTestId("InputPassword");
		const toggle = screen.getByTestId("InputPassword__toggle");
		fireEvent.click(toggle);

		expect(input).toHaveAttribute("type", "text");

		fireEvent.click(toggle);

		expect(input).toHaveAttribute("type", "password");
	});

	it("should render as a password isInvalid", () => {
		const context = {
			errorMessage: "Error message for password",
			isInvalid: true,
			name: "test",
		};
		const tree = (
			<FormFieldProvider value={context}>
				<InputPassword />
			</FormFieldProvider>
		);
		const { asFragment } = render(tree);
		const input = screen.getByTestId("InputPassword");

		expect(input).toHaveAttribute("type", "password");
		expect(asFragment()).toMatchSnapshot();
	});
});
