import { Networks } from "@payvo/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { NetworkIcon } from "./NetworkIcon";
import { availableNetworksMock } from "@/tests/mocks/networks";
import { render, screen } from "@/utils/testing-library";

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

		userEvent.hover(screen.getByTestId(`NetworkIcon-${network.coin()}-${network.id()}`));

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
