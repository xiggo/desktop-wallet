/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectRecipient } from "./SelectRecipient";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("SelectRecipient", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render empty", () => {
		const { container } = render(<SelectRecipient profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { container } = render(<SelectRecipient profile={profile} disabled />);

		expect(container).toMatchSnapshot();
	});

	it("should render invalid", () => {
		const { container } = render(<SelectRecipient profile={profile} isInvalid />);

		expect(container).toMatchSnapshot();
	});

	it("should update internal state when prop changes", () => {
		const { container, rerender } = render(<SelectRecipient profile={profile} />);

		rerender(<SelectRecipient profile={profile} address="bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT" />);

		expect(container).toMatchSnapshot();
	});

	it("should open and close contacts modal", async () => {
		render(<SelectRecipient profile={profile} address="bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT" />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("modal__close-btn"));

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();
	});

	it("should select address from contacts modal", async () => {
		render(<SelectRecipient profile={profile} address="bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT" />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await expect(screen.findByTestId("modal__inner")).resolves.toBeVisible();

		const firstContactAddress = screen.getByTestId("RecipientListItem__select-button-2");

		userEvent.click(firstContactAddress);

		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());

		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(
				profile.contacts().values()[0].addresses().values()[0].address(),
			),
		);
	});

	it("should not show select recipient button if showOptions is false", async () => {
		render(<SelectRecipient profile={profile} showOptions={false} />);

		expect(screen.queryByTestId("queryByTestId-recipient")).not.toBeInTheDocument();
	});

	it("should not open contacts modal if disabled", async () => {
		render(<SelectRecipient profile={profile} address="bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT" disabled />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await waitFor(() => expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument());
	});

	it("should call onChange prop when entered address in input", async () => {
		const address = "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT";

		const contactsSpy = jest.spyOn(profile.contacts(), "findByAddress").mockReturnValue([]);
		const onChange = jest.fn();

		render(<SelectRecipient profile={profile} onChange={onChange} />);
		const recipientInputField = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(recipientInputField, address);

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(address);

		expect(onChange).toHaveBeenCalledWith(address, {
			alias: undefined,
			isContact: false,
			isDelegate: false,
		});

		contactsSpy.mockRestore();
	});

	it("should call onChange prop if provided", async () => {
		const onChange = jest.fn();

		render(
			<SelectRecipient
				profile={profile}
				onChange={onChange}
				address="bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT"
			/>,
		);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("RecipientListItem__select-button-2");

		userEvent.click(firstAddress);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		const selectedAddressValue = profile.contacts().values()[0].addresses().values()[0].address();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);
		expect(onChange).toHaveBeenCalledWith(selectedAddressValue, expect.any(Object));
	});

	it("should call onChange prop only when values change", async () => {
		const onChange = jest.fn();

		render(<SelectRecipient profile={profile} onChange={onChange} address="D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib" />);

		const selectedAddressValue = profile.contacts().values()[0].addresses().values()[0].address();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		const lastAddress = screen.getByTestId("RecipientListItem__selected-button-2");

		userEvent.click(lastAddress);

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("should filter recipients list by network if provided", async () => {
		const function_ = jest.fn();

		const [wallet] = profile.wallets().findByCoinWithNetwork("ARK", "ark.devnet");

		render(
			<SelectRecipient
				profile={profile}
				onChange={function_}
				address="bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT"
				network={wallet.coin().network()}
			/>,
		);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await waitFor(() => expect(screen.queryByTestId("RecipientListItem__select-button")).not.toBeInTheDocument());
	});

	it("should filter recipients list by MultiSignature type", async () => {
		const { rerender } = render(<SelectRecipient profile={profile} />);

		expect(screen.queryByTestId("modal__inner")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("TableRow")).toHaveLength(6);

		const isMultiSignatureSpy = jest
			.spyOn(profile.wallets().first(), "isMultiSignature")
			.mockImplementation(() => true);

		rerender(<SelectRecipient profile={profile} exceptMultiSignature />);

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await waitFor(() => {
			expect(screen.getByTestId("modal__inner")).toBeInTheDocument();
		});

		expect(screen.getAllByTestId("TableRow")).toHaveLength(1);

		isMultiSignatureSpy.mockRestore();
	});
});
