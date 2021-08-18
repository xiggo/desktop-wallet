import { Networks } from "@payvo/sdk";
import React from "react";
import { availableNetworksMock } from "tests/mocks/networks";
import { act, fireEvent, render, screen } from "utils/testing-library";

import { NetworkIcon } from "./NetworkIcon";

let network: Networks.Network;

describe("NetworkIcon", () => {
	beforeEach(() => {
		network = availableNetworksMock[0];
	});

	it("should render", () => {
		const { getByTestId } = render(<NetworkIcon network={network} />, {});

		expect(getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(getByTestId("NetworkIcon__icon")).toBeTruthy();
	});

	it("should render with tooltip in the dark mode", () => {
		render(<NetworkIcon network={network} tooltipDarkTheme />, {});

		act(() => {
			fireEvent.mouseEnter(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`));
		});

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");
	});

	it("should render with test network", () => {
		network = availableNetworksMock[1];

		const { getByTestId } = render(<NetworkIcon network={network} />, {});

		expect(getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(getByTestId("NetworkIcon__icon")).toBeTruthy();
	});

	it("should render network with custom classname", () => {
		const { getByTestId } = render(<NetworkIcon network={network} className="test" />, {});

		expect(getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(getByTestId("NetworkIcon__icon")).toBeTruthy();
	});
});
