/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/profiles";
import { Networks } from "@payvo/sdk";
import userEvent from "@testing-library/user-event";
import { buildTranslations } from "app/i18n/helpers";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
	env,
	fireEvent,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderWithRouter,
	screen,
	waitFor,
	within,
} from "utils/testing-library";

import { AddRecipient } from "./AddRecipient";

const translations = buildTranslations();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let network: Networks.Network;

const renderWithFormProvider = (children: any, defaultValues?: any) => {
	const Wrapper = () => {
		const form = useForm({
			defaultValues: {
				...{
					fee: 0,
					network,
					senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				},
				...defaultValues,
			},
			mode: "onChange",
			shouldUnregister: false,
		});

		return <FormProvider {...form}>{children}</FormProvider>;
	};

	return renderWithRouter(<Wrapper />);
};

describe("AddRecipient", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!;
		network = wallet.network();
	});

	it("should render", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render without recipients", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} recipients={undefined} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with single recipient data", async () => {
		const values = {
			amount: "1",
			displayAmount: "1",
			recipientAddress: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
		};

		const { getByTestId, container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} />,
			values,
		);

		await waitFor(() => {
			expect(getByTestId("AddRecipient__amount")).toHaveValue("1");
			expect(getByTestId("SelectDropdown__input")).toHaveValue("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		});

		expect(container).toMatchSnapshot();
	});

	it("should render with multiple recipients switch", async () => {
		const { getByTestId, container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" showMultiPaymentOption />,
		);

		await waitFor(() => expect(getByTestId("SelectDropdown__input")).toHaveValue(""));

		expect(container).toMatchSnapshot();
	});

	it("should render without the single & multiple switch", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" showMultiPaymentOption={false} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should set amount", async () => {
		const onChange = jest.fn();
		const findDelegateSpy = jest.spyOn(env.delegates(), "findByAddress").mockImplementation(
			() =>
				({
					username: () => "delegate username",
				} as any),
		);

		const { getByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" onChange={onChange} />,
		);

		fireEvent.input(getByTestId("AddRecipient__amount"), {
			target: {
				value: "1",
			},
		});

		await waitFor(() => expect(getByTestId("AddRecipient__amount")).toHaveValue("1"));

		fireEvent.input(getByTestId("SelectDropdown__input"), {
			target: {
				value: "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT",
			},
		});

		await waitFor(() =>
			expect(getByTestId("SelectDropdown__input")).toHaveValue("bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT"),
		);

		expect(onChange).toHaveBeenCalledWith([
			{
				address: "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT",
				alias: "delegate username",
				amount: 1,
				isDelegate: true,
			},
		]);

		findDelegateSpy.mockRestore();
	});

	it("should select recipient", async () => {
		const { getByTestId, findByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		userEvent.click(getByTestId("SelectRecipient__select-recipient"));

		await findByTestId("modal__inner");

		userEvent.click(getByTestId("RecipientListItem__select-button-0"));

		await waitFor(() => expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/));

		const selectedAddressValue = profile.wallets().first().address();

		expect(getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);
	});

	it("should set available amount", async () => {
		const { getByTestId, container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		fireEvent.click(getByTestId("AddRecipient__send-all"));

		await waitFor(() => expect(getByTestId("AddRecipient__amount")).toHaveValue(`${wallet.balance()}`));

		expect(container).toMatchSnapshot();
	});

	it("should show zero amount if wallet has zero or insufficient balance", async () => {
		const emptyProfile = env.profiles().create("Empty");

		const emptyWallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		jest.spyOn(emptyWallet, "balance").mockReturnValue(0);
		jest.spyOn(emptyWallet.network(), "isTest").mockReturnValue(false);

		emptyProfile.wallets().push(emptyWallet);

		const { getByTestId, container } = renderWithFormProvider(
			<AddRecipient profile={emptyProfile} wallet={emptyWallet} assetSymbol="ARK" />,
		);

		fireEvent.click(getByTestId("AddRecipient__send-all"));

		await waitFor(() => expect(getByTestId("AddRecipient__amount")).toHaveValue(""));

		expect(container).toMatchSnapshot();
	});

	it("should toggle between single and multiple recipients", async () => {
		const { getByText, queryByText, findByText } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		const singleButton = getByText(translations.TRANSACTION.SINGLE);
		const multipleButton = getByText(translations.TRANSACTION.MULTIPLE);

		const recipientLabel = "Recipient #1";

		expect(queryByText(recipientLabel)).not.toBeInTheDocument();

		userEvent.click(multipleButton);

		await findByText(recipientLabel);

		userEvent.click(singleButton);

		await waitFor(() => expect(queryByText(recipientLabel)).not.toBeInTheDocument());
	});

	it("should prevent adding invalid recipient address in multiple type", async () => {
		jest.useFakeTimers();

		const values = {
			amount: "1",
			displayAmount: "1",
			recipientAddress: "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
				shouldUnregister: false,
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<FormProvider {...form}>
					<AddRecipient
						profile={profile}
						wallet={wallet}
						assetSymbol="ARK"
						recipients={[
							{
								address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
								amount: undefined,
							},
							{
								address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
								amount: 1,
							},
							{
								address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ay",
								amount: 1,
							},
						]}
					/>
				</FormProvider>
			);
		};
		render(<Component />);

		fireEvent.input(screen.getByTestId("AddRecipient__amount"), {
			target: {
				value: values.displayAmount,
			},
		});

		// Invalid address
		fireEvent.input(screen.getByTestId("SelectDropdown__input"), {
			target: {
				value: values.recipientAddress,
			},
		});

		await waitFor(() => {
			expect(form.getValues("amount")).toEqual(values.amount);
			expect(form.getValues("displayAmount")).toEqual(values.displayAmount);
			expect(screen.getByTestId("AddRecipient__add-button")).toBeInTheDocument();
			expect(screen.getByTestId("AddRecipient__add-button")).toBeDisabled();
		});

		// Valid address
		fireEvent.input(screen.getByTestId("SelectDropdown__input"), {
			target: {
				value: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			},
		});

		await waitFor(() => expect(screen.getByTestId("AddRecipient__add-button")).not.toBeDisabled());

		fireEvent.click(screen.getByTestId("AddRecipient__add-button"));

		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(4));
	});

	it("should disable recipient fields if network is not filled", async () => {
		const values = {
			displayAmount: "1",
			network: null,
		};

		const { getByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
			values,
		);

		await waitFor(() => {
			expect(getByTestId("SelectDropdown__input")).toBeDisabled();
			expect(getByTestId("AddRecipient__amount")).toBeDisabled();
		});
	});

	it("should disable recipient fields if sender address is not filled", async () => {
		const values = {
			displayAmount: "1",
			senderAddress: null,
		};

		const { getByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
			values,
		);

		await waitFor(() => {
			expect(getByTestId("SelectDropdown__input")).toBeDisabled();
			expect(getByTestId("AddRecipient__amount")).toBeDisabled();
		});
	});

	it("should show wallet name in recipients' list for multiple type", async () => {
		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<FormProvider {...form}>
					<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" recipients={[]} />
				</FormProvider>
			);
		};

		render(<Component />);

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("");

		userEvent.click(screen.getByText(translations.TRANSACTION.MULTIPLE));

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		expect(screen.getByTestId("modal__inner")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));

		expect(() => screen.getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		await waitFor(() => expect(screen.getByTestId("SelectDropdown__input")).not.toHaveValue(""));

		fireEvent.input(screen.getByTestId("AddRecipient__amount"), {
			target: {
				value: 1,
			},
		});

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));

		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(1));

		expect(screen.getAllByTestId("Address__alias")).toHaveLength(1);
		expect(screen.getByText("ARK Wallet 1")).toBeInTheDocument();
	});

	it("should show error for low balance", async () => {
		const { getByTestId, findByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		userEvent.click(getByTestId("SelectRecipient__select-recipient"));

		await findByTestId("modal__inner");

		const firstAddress = getByTestId("RecipientListItem__select-button-0");

		userEvent.click(firstAddress);

		await waitFor(() => expect(() => getByTestId("Input__error")).toThrow(/Unable to find an element by/));

		fireEvent.change(getByTestId("AddRecipient__amount"), {
			target: {
				value: "10000000000",
			},
		});

		await findByTestId("Input__error");
	});

	it("should show error for zero balance", async () => {
		const mockWalletBalance = jest.spyOn(wallet, "balance").mockReturnValue(0);

		const { getByTestId, findByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		userEvent.click(getByTestId("SelectRecipient__select-recipient"));

		await findByTestId("modal__inner");

		const firstAddress = getByTestId("RecipientListItem__select-button-0");

		userEvent.click(firstAddress);

		await waitFor(() => expect(() => getByTestId("Input__error")).toThrow(/Unable to find an element by/));

		fireEvent.change(getByTestId("AddRecipient__amount"), {
			target: {
				value: "0.1",
			},
		});

		await findByTestId("Input__error");

		mockWalletBalance.mockRestore();
	});

	it("should show error for invalid address", async () => {
		const { getByTestId, getAllByTestId, findByTestId } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" />,
		);

		expect(() => getByTestId("modal__inner")).toThrow(/Unable to find an element by/);

		fireEvent.click(getByTestId("SelectRecipient__select-recipient"));

		await findByTestId("modal__inner");
		await waitFor(() => expect(() => getByTestId("Input__error")).toThrow(/Unable to find an element by/));

		fireEvent.click(getByTestId("RecipientListItem__select-button-0"));

		fireEvent.change(getByTestId("SelectDropdown__input"), {
			target: {
				value: "abc",
			},
		});

		await waitFor(() =>
			expect(getAllByTestId("Input__error")[0]).toHaveAttribute(
				"data-errortext",
				translations.COMMON.VALIDATION.RECIPIENT_INVALID,
			),
		);
	});

	it("should remove recipient in multiple tab", async () => {
		const values = {
			amount: "1",
			displayAmount: "1",
			recipientAddress: "DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<FormProvider {...form}>
					<AddRecipient
						profile={profile}
						wallet={wallet}
						assetSymbol="ARK"
						recipients={[
							{
								address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
								amount: 1,
							},
							{
								address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ay",
								amount: 1,
							},
						]}
					/>
				</FormProvider>
			);
		};
		render(<Component />);

		fireEvent.input(screen.getByTestId("AddRecipient__amount"), {
			target: {
				value: values.displayAmount,
			},
		});

		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(2));

		const removeButton = within(screen.getAllByTestId("recipient-list__recipient-list-item")[0]).getAllByTestId(
			"recipient-list__remove-recipient",
		);

		expect(removeButton[0]).toBeInTheDocument();

		fireEvent.click(removeButton[0]);

		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(1));
	});

	it("should not override default values in single tab", async () => {
		const values = {
			amount: "1",
			displayAmount: "1",
			recipientAddress: "DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", ...values },
				mode: "onChange",
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<FormProvider {...form}>
					<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" recipients={[]} />
				</FormProvider>
			);
		};

		render(<Component />);

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));
	});

	it("should fill inputs in the single tab if one recipient is added in the multiple tab", async () => {
		const values = {
			amount: 1,
			recipientAddress: "DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<FormProvider {...form}>
					<AddRecipient profile={profile} wallet={wallet} assetSymbol="ARK" recipients={[]} />
				</FormProvider>
			);
		};

		render(<Component />);

		fireEvent.click(screen.getByText(translations.TRANSACTION.MULTIPLE));

		fireEvent.input(screen.getByTestId("SelectDropdown__input"), {
			target: {
				value: values.recipientAddress,
			},
		});

		fireEvent.input(screen.getByTestId("AddRecipient__amount"), {
			target: {
				value: values.amount,
			},
		});

		fireEvent.click(screen.getByTestId("AddRecipient__add-button"));

		await waitFor(() => expect(screen.getAllByTestId("recipient-list__recipient-list-item")).toHaveLength(1));

		fireEvent.click(screen.getByText(translations.TRANSACTION.SINGLE));

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue(values.amount.toString()));
	});

	it("should prevent adding more recipients than the coin supports", async () => {
		const mockMultiPaymentRecipients = jest.spyOn(wallet.network(), "multiPaymentRecipients").mockReturnValue(1);

		renderWithFormProvider(
			<AddRecipient
				recipients={[
					{
						address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
						amount: 1,
					},
				]}
				profile={profile}
				wallet={wallet}
				assetSymbol="ARK"
			/>,
		);

		userEvent.click(screen.getByText(translations.TRANSACTION.MULTIPLE));

		await screen.findByTestId("SelectRecipient__select-recipient");

		userEvent.click(screen.getByTestId("SelectRecipient__select-recipient"));

		await screen.findByTestId("modal__inner");

		userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));

		fireEvent.change(screen.getByTestId("AddRecipient__amount"), {
			target: {
				value: "1",
			},
		});

		await waitFor(() => expect(screen.getByTestId("AddRecipient__add-button")).toBeDisabled());

		mockMultiPaymentRecipients.mockRestore();
	});
});
