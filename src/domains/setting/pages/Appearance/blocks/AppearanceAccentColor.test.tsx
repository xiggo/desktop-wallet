import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as reactHookForm from "react-hook-form";

import { translations } from "@/domains/setting/i18n";

import { AppearanceAccentColor } from "./AppearanceAccentColor";

describe("AppearanceAccentColor", () => {
	it("should render", () => {
		const watch = jest.fn();
		const setValue = jest.fn();

		jest.spyOn(reactHookForm, "useFormContext").mockImplementationOnce(() => ({ setValue, watch } as any));

		const { asFragment } = render(<AppearanceAccentColor />);

		expect(watch).toHaveBeenCalledWith("accentColor");
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["blue", "green"])("should allow to change the value", (color: string) => {
		const watch = jest.fn();
		const setValue = jest.fn();

		jest.spyOn(reactHookForm, "useFormContext").mockImplementationOnce(() => ({ setValue, watch } as any));

		render(<AppearanceAccentColor />);

		expect(screen.getAllByRole("radio")).toHaveLength(2);

		const ariaLabel = translations.APPEARANCE.OPTIONS.ACCENT_COLOR.COLORS[color.toUpperCase()];

		userEvent.click(screen.getByLabelText(ariaLabel));

		expect(setValue).toHaveBeenCalledWith("accentColor", color, {
			shouldDirty: true,
			shouldValidate: true,
		});
	});
});
