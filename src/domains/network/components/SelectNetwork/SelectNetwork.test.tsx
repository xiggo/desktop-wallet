import userEvent from "@testing-library/user-event";
import React from "react";

import { availableNetworksMock } from "@/tests/mocks/networks";
import { render, screen, waitFor, within } from "@/utils/testing-library";

import { itemToString, SelectNetwork } from "./SelectNetwork";

describe("SelectNetwork", () => {
	it("should render", () => {
		const { container } = render(<SelectNetwork />);

		expect(container).toMatchSnapshot();
	});

	it("should render with networks", () => {
		const { container } = render(<SelectNetwork networks={availableNetworksMock} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with hidden options", () => {
		const { container } = render(<SelectNetwork networks={availableNetworksMock} hideOptions />);

		expect(screen.getByTestId("SelectNetwork__options")).toHaveClass("hidden");
		expect(container).toMatchSnapshot();
	});

	it("should filter the network icons based on the input value", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.click(input);

		const availableNetworksLength = availableNetworksMock.filter((network) => network).length;

		expect(screen.getAllByTestId("SelectNetwork__NetworkIcon--container")).toHaveLength(availableNetworksLength);

		const value = "Ar";

		userEvent.paste(input, value);

		expect(input).toHaveValue(value);

		expect(screen.getByTestId("NetworkIcon-ARK-ark.devnet")).toBeInTheDocument();
		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toBeInTheDocument();

		userEvent.clear(input);

		expect(input).not.toHaveValue();

		expect(screen.getAllByTestId("SelectNetwork__NetworkIcon--container")).toHaveLength(availableNetworksLength);
	});

	it("should show suggestion when typing has found at least one match", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "ar");

		expect(input).toHaveValue("ar");

		expect(screen.getByTestId("Input__suggestion")).toHaveTextContent("arK");
	});

	it("should show call onInputChange callback when input value changed", () => {
		const onInputChange = jest.fn();

		render(<SelectNetwork networks={availableNetworksMock} onInputChange={onInputChange} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "ark");

		expect(input).toHaveValue("ark");

		expect(onInputChange).toHaveBeenCalledWith("ark", "ark");

		userEvent.clear(input);
		userEvent.paste(input, "no-match");

		expect(input).toHaveValue("no-match");

		expect(onInputChange).toHaveBeenCalledWith("no-match", "");

		userEvent.clear(input);

		expect(input).not.toHaveValue();

		expect(onInputChange).toHaveBeenCalledWith();
	});

	it("should select first matching asset with enter", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "ark");

		expect(input).toHaveValue("ark");

		userEvent.keyboard("{enter}");

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK");
	});

	it("should not select non-matching asset after key input and enter", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "Bot");

		expect(input).toHaveValue("Bot");

		userEvent.keyboard("{enter}");

		const networkInput = screen.getByTestId("SelectNetworkInput__network");

		expect(within(networkInput).queryByTestId("CoinIcon")).toBeNull();
	});

	it("should not select first matched asset after random key enter", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "Bitco");

		expect(input).toHaveValue("Bitco");

		userEvent.keyboard("A");

		const networkInput = screen.getByTestId("SelectNetworkInput__network");

		expect(within(networkInput).queryByTestId("CoinIcon")).toBeNull();
	});

	it("should clear selection when changing input", async () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "ark");

		await waitFor(() => {
			expect(input).toHaveValue("ark");
		});

		userEvent.keyboard("{enter}");

		await within(screen.getByTestId("SelectNetworkInput__network")).findByTestId("NetworkIcon__icon");

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK");

		userEvent.paste(input, "A");

		expect(() =>
			within(screen.getByTestId("SelectNetworkInput__network")).getByTestId("NetworkIcon__icon"),
		).toThrow(/Unable to find an element by/);

		expect(screen.getByTestId("SelectNetworkInput__network")).not.toHaveAttribute("aria-label");
	});

	it("should select an item by clicking on it", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(input, "ARK");

		expect(input).toHaveValue("ARK");
		expect(screen.getByTestId("Input__suggestion")).toBeInTheDocument();
		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.mainnet"));

		expect(screen.queryByTestId("Input__suggestion")).not.toBeInTheDocument();
		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK");
		expect(screen.getByTestId("NetworkIcon-ARK-ark.devnet")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.devnet"));

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK Devnet");
	});

	it("should toggle selection by clicking on network icon", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);

		userEvent.click(screen.getByTestId("SelectNetworkInput__input"));

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.mainnet"));

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", "ARK");

		userEvent.click(screen.getByTestId("SelectNetworkInput__input"));

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("NetworkIcon-ARK-ark.mainnet"));

		expect(screen.getByTestId("SelectNetworkInput__network")).not.toHaveAttribute("aria-label");
	});

	it("should show and hide development networks through toggle", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);

		expect(screen.getAllByRole("listbox")[1]).toHaveClass("hidden");

		userEvent.click(screen.getByTestId("SelectNetwork__developmentNetworks-toggle"));

		expect(screen.getAllByRole("listbox")[1]).not.toHaveClass("hidden");

		userEvent.click(screen.getByTestId("SelectNetwork__developmentNetworks-toggle"));

		expect(screen.getAllByRole("listbox")[1]).toHaveClass("hidden");
	});

	it("should show development networks if selected through input", () => {
		render(<SelectNetwork networks={availableNetworksMock} />);
		const input = screen.getByTestId("SelectNetworkInput__input");

		expect(screen.getAllByRole("listbox")[1]).toHaveClass("hidden");

		userEvent.paste(input, "ARK D");

		expect(input).toHaveValue("ARK D");

		userEvent.keyboard("{enter}");

		expect(screen.getAllByRole("listbox")[1]).not.toHaveClass("hidden");
	});

	it("should return empty if the item has not defined", () => {
		expect(itemToString(null)).toBe("");
	});
});
