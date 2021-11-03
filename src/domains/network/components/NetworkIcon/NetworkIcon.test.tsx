import { Networks } from "@payvo/sdk";
import React from "react";
import { availableNetworksMock } from "tests/mocks/networks";
import { fireEvent, render, screen } from "utils/testing-library";

import { NetworkIcon } from "./NetworkIcon";

let network: Networks.Network;

describe("NetworkIcon", () => {
	beforeEach(() => {
		network = availableNetworksMock[0];
	});

	it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
		const { asFragment } = render(<NetworkIcon network={network} size="lg" isCompact={isCompact} />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with tooltip in the dark mode", () => {
		render(<NetworkIcon network={network} size="lg" tooltipDarkTheme />, {});

		fireEvent.mouseEnter(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`));

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");
	});

	it("should render with test network", () => {
		network = availableNetworksMock[1];

		render(<NetworkIcon size="lg" network={network} />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});

	it("should render network with custom classname", () => {
		render(<NetworkIcon size="lg" network={network} className="test" />, {});

		expect(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`)).toHaveAttribute(
			"aria-label",
			network.displayName(),
		);
		expect(screen.getByTestId("NetworkIcon__icon")).toBeInTheDocument();
	});
});
