import userEvent from "@testing-library/user-event";
import { ipcRenderer } from "electron";
import React from "react";

import { PluginSpecs } from "./PluginSpecs";
import { render, screen } from "@/utils/testing-library";

describe("PluginSpecs", () => {
	it("should render properly", async () => {
		const ipcRendererMock = jest.spyOn(ipcRenderer, "send").mockImplementation();

		const { asFragment } = render(
			<PluginSpecs
				author="Payvo"
				category="utility"
				url="https://github.com/arkecosystem/explorer"
				version="1.3.8"
				size="4.2 Mb"
			/>,
		);

		userEvent.click(screen.getByTestId("PluginSpecs__website"));

		expect(ipcRendererMock).toHaveBeenLastCalledWith("open-external", "https://github.com/arkecosystem/explorer");

		await expect(screen.findByText("Payvo")).resolves.toBeVisible();
		await expect(screen.findByText("Utility")).resolves.toBeVisible();
		await expect(screen.findByText("View")).resolves.toBeVisible();
		await expect(screen.findByText("1.3.8")).resolves.toBeVisible();
		await expect(screen.findByText("4.2 Mb")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		ipcRendererMock.mockRestore();
	});

	it("should render without url and size", async () => {
		const { asFragment } = render(<PluginSpecs author="Payvo" category="utility" version="1.3.8" />);

		await expect(screen.findByText("Payvo")).resolves.toBeVisible();
		await expect(screen.findByText("Utility")).resolves.toBeVisible();

		await expect(screen.findAllByText("N/A")).resolves.toHaveLength(2);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show loading state for size", () => {
		const { container } = render(<PluginSpecs author="Payvo" category="utility" version="1.3.8" isLoadingSize />);

		expect(screen.getByTestId("PluginSpecs__size-skeleton")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
