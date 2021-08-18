/* eslint-disable @typescript-eslint/require-await */
import React from "react";
import { act, fireEvent, render, screen } from "utils/testing-library";

import { translations } from "../../i18n/common/i18n";
import { Clipboard } from "./Clipboard";

describe("ClipboardIcon", () => {
	beforeAll(() => {
		(navigator as any).clipboard = {
			writeText: jest.fn().mockResolvedValue("test"),
		};
	});

	afterAll(() => {
		(navigator as any).clipboard.writeText.mockRestore();
	});

	it("should render with tooltip in the dark mode", async () => {
		render(
			<Clipboard variant="icon" data="" tooltipDarkTheme>
				<span>Hello!</span>
			</Clipboard>,
		);

		act(() => {
			fireEvent.mouseEnter(screen.getByTestId("clipboard-icon__wrapper"));
		});

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");
	});

	it("should change the tooltip content when clicked", async () => {
		const { baseElement, getByTestId } = render(
			<Clipboard variant="icon" data="">
				<span>Hello!</span>
			</Clipboard>,
		);

		act(() => {
			fireEvent.mouseEnter(getByTestId("clipboard-icon__wrapper"));
		});

		expect(baseElement).toHaveTextContent(translations.CLIPBOARD.TOOLTIP_TEXT);
		expect(baseElement).not.toHaveTextContent(translations.CLIPBOARD.SUCCESS);

		await act(async () => {
			fireEvent.click(getByTestId("clipboard-icon__wrapper"));
		});

		expect(baseElement).not.toHaveTextContent(translations.CLIPBOARD.TOOLTIP_TEXT);
		expect(baseElement).toHaveTextContent(translations.CLIPBOARD.SUCCESS);
	});
});
