/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ContactForm } from "./ContactForm";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

const onSave = jest.fn();
const onCancel = jest.fn();
const onChange = jest.fn();

let profile: Contracts.IProfile;
let contact: Contracts.IContact;
let validArkDevnetAddress: string;

describe("ContactForm", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);

		const [wallet] = profile.wallets().values();
		validArkDevnetAddress = wallet.address();
		contact = profile.contacts().values()[0];
	});

	it("should render", async () => {
		const { asFragment } = render(
			<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />,
		);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with errors", async () => {
		const { asFragment } = render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onSave={onSave}
				onChange={onChange}
				errors={{ name: "Contact name error" }}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should clear errors when changing network", async () => {
		render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onSave={onSave}
				onChange={onChange}
				errors={{ address: "Contact address error" }}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).toBeDisabled();
		});

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeInTheDocument();
		});

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "name");

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.paste(screen.getByTestId("contact-form__address-input"), validArkDevnetAddress);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(validArkDevnetAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(1);
		});

		await waitFor(() => {
			expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).not.toBeDisabled();
		});
	});

	it("should handle onChange event", async () => {
		const name = "Sample name";

		const onChangeFunction = jest.fn();

		render(
			<ContactForm
				profile={profile}
				onCancel={onCancel}
				onChange={onChangeFunction}
				onSave={onSave}
				errors={{ name: "Contact name error" }}
			/>,
		);

		userEvent.paste(screen.getByTestId("contact-form__name-input"), name);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue(name);
		});

		await waitFor(() => {
			expect(onChangeFunction).toHaveBeenCalledWith("name");
		});
	});

	it("should select cryptoasset", async () => {
		render(<ContactForm profile={profile} onCancel={onCancel} onChange={onChange} errors={{}} onSave={onSave} />);

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));
	});

	it("should add a valid address successfully", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "name");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.paste(screen.getByTestId("contact-form__address-input"), validArkDevnetAddress);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(validArkDevnetAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(1);
		});
	});

	it("should not add invalid address and should display error message", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "name");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.paste(screen.getByTestId("contact-form__address-input"), "invalid address");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue("invalid address");
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();
	});

	it("should not add duplicate address and display error message", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "name");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		const contactAddress = contact.addresses().first().address();

		userEvent.paste(screen.getByTestId("contact-form__address-input"), contactAddress);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(contactAddress);
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();
	});

	it("should remove network from options", async () => {
		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "name");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK"));

		userEvent.type(screen.getByTestId("contact-form__address-input"), "AYuYnr7WwwLUc9rLpALwVFn85NFGGmsNK7");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue("AYuYnr7WwwLUc9rLpALwVFn85NFGGmsNK7");
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(1);
		});

		// Second addition

		userEvent.paste(selectNetworkInput, "ARK");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));
	});

	it("should remove an address", async () => {
		render(
			<ContactForm
				onChange={onChange}
				errors={{}}
				profile={profile}
				contact={contact}
				onCancel={onCancel}
				onSave={onSave}
			/>,
		);

		expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(contact.addresses().count());

		userEvent.click(screen.getAllByTestId("contact-form__remove-address-btn")[0]);

		await waitFor(() => {
			expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();
		});
	});

	it("should handle save", async () => {
		const onSave = jest.fn();

		render(<ContactForm onChange={onChange} errors={{}} profile={profile} onCancel={onCancel} onSave={onSave} />);

		userEvent.paste(screen.getByTestId("contact-form__name-input"), "name");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("name");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectNetworkInput, "ARK D");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.paste(screen.getByTestId("contact-form__address-input"), validArkDevnetAddress);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(validArkDevnetAddress);
		});

		await waitFor(() => {
			expect(screen.queryByTestId("contact-form__add-address-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__add-address-btn"));

		await waitFor(() => {
			expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(1);
		});

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__save-btn")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("contact-form__save-btn"));

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith({
				addresses: [
					{
						address: validArkDevnetAddress,
						coin: "ARK",
						name: validArkDevnetAddress,
						network: "ark.devnet",
					},
				],
				name: expect.any(String),
			});
		});
	});
});
