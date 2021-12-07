import React from "react";

import { AppearanceForm } from "./AppearanceForm";
import { env, render, screen } from "@/utils/testing-library";

describe("AppearanceForm", () => {
	it("should render", () => {
		const profile = env.profiles().create("empty profile");

		const { asFragment } = render(<AppearanceForm profile={profile} />);

		expect(screen.getAllByRole("radiogroup")).toHaveLength(2);

		expect(screen.getByTestId("AppearanceFooterButtons__save")).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});
});
