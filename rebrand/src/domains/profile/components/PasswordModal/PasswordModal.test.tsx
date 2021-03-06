/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { PasswordModal } from "./PasswordModal";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("PasswordModal", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	it("should not render if not open", () => {
		const { asFragment } = render(<PasswordModal isOpen={false} />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with title and description", async () => {
		const { asFragment } = render(
			<PasswordModal isOpen={true} title="Password title" description="Password description" />,
		);

		expect(screen.getByTestId("modal__inner")).toHaveTextContent("Password title");
		expect(screen.getByTestId("modal__inner")).toHaveTextContent("Password description");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should submit", async () => {
		const onSuccess = jest.fn();

		render(<PasswordModal isOpen={true} onSubmit={onSuccess} />);

		userEvent.paste(screen.getByTestId("PasswordModal__input"), "password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId("PasswordModal__submit-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("PasswordModal__submit-button"));

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalledWith("password");
		});
	});
});
