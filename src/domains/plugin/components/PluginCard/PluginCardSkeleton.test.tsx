import React from "react";

import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { render, screen } from "@/utils/testing-library";

import { PluginCardSkeleton } from "./PluginCardSkeleton";

describe("PluginCardSkeleton", () => {
	beforeAll(() => {
		jest.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	it("should render", async () => {
		const { asFragment } = render(<PluginCardSkeleton />);

		await expect(screen.findByTestId("PluginCardSkeleton")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
