/* eslint-disable @typescript-eslint/require-await */
import React from "react";
import { fireEvent, render, screen, waitFor } from "utils/testing-library";

import { Clipboard } from "./Clipboard";

describe("ClipboardButton", () => {
	beforeAll(() => {
		(navigator as any).clipboard = {
			writeText: jest.fn().mockResolvedValue("test"),
		};
	});

	afterAll(() => {
		(navigator as any).clipboard.writeText.mockRestore();
	});

	it("should show checkmark when clicked", async () => {
		render(
			<Clipboard variant="button" data="">
				<span>Hello!</span>
			</Clipboard>,
		);

		expect(screen.queryByTestId("clipboard-button__checkmark")).not.toBeInTheDocument();

		fireEvent.click(screen.getByTestId("clipboard-button__wrapper"));

		expect(await screen.findByTestId("clipboard-button__checkmark")).toBeInTheDocument();
	});

	it("should hide checkmark", async () => {
		render(
			<Clipboard variant="button" data="">
				<span>Hello!</span>
			</Clipboard>,
		);

		expect(screen.queryByTestId("clipboard-button__checkmark")).not.toBeInTheDocument();

		fireEvent.click(screen.getByTestId("clipboard-button__wrapper"));

		expect(await screen.findByTestId("clipboard-button__checkmark")).toBeInTheDocument();

		await waitFor(() => expect(screen.queryByTestId("clipboard-button__checkmark")).not.toBeInTheDocument(), {
			timeout: 2000,
		});
	});
});
