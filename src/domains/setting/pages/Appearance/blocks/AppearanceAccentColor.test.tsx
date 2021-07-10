import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { translations } from "domains/setting/i18n";
import React from "react";
import * as reactHookForm from "react-hook-form";

import { AppearanceAccentColor } from "./AppearanceAccentColor";

describe("AppearanceAccentColor", () => {
	it("should render", () => {
		const { asFragment } = render(<AppearanceAccentColor />);

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

	it("should be disabled when form is not initialized", () => {
		jest.spyOn(reactHookForm, "useFormContext").mockReturnValue(null as any);

		render(<AppearanceAccentColor />);

		expect(screen.getAllByRole("radio")[0]).toBeDisabled();
		expect(screen.getAllByRole("radio")[1]).toBeDisabled();
	});
});
