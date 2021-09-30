/* eslint-disable @typescript-eslint/require-await */
import { BIP39 } from "@payvo/cryptography";
import { Contracts as ProfilesContracts } from "@payvo/profiles";
import { Contracts } from "@payvo/sdk";
import { RenderResult, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "app/components/Form";
import { toasts } from "app/services";
import React, { useEffect } from "react";
import { useForm, UseFormMethods } from "react-hook-form";
import { useTranslation } from "react-i18next";
import secondSignatureFixture from "tests/fixtures/coins/ark/devnet/transactions/second-signature-registration.json";
import * as utils from "utils/electron-utils";
import { env, fireEvent, getDefaultProfileId, MNEMONICS, render, screen, waitFor } from "utils/testing-library";

import { translations as transactionTranslations } from "../../i18n";
import { SecondSignatureRegistrationForm, signSecondSignatureRegistration } from "./SecondSignatureRegistrationForm";

describe("SecondSignatureRegistrationForm", () => {
	const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
	let profile: ProfilesContracts.IProfile;
	let wallet: ProfilesContracts.IReadWriteWallet;

	const fees = { avg: 1.354, max: 10, min: 0, static: 0 };

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	const createTransactionMock = (wallet: ProfilesContracts.IReadWriteWallet) =>
		// @ts-ignore
		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
			amount: () => secondSignatureFixture.data.amount / 1e8,
			data: () => ({ data: () => secondSignatureFixture.data }),
			explorerLink: () => `https://dexplorer.ark.io/transaction/${secondSignatureFixture.data.id}`,
			fee: () => secondSignatureFixture.data.fee / 1e8,
			id: () => secondSignatureFixture.data.id,
			recipient: () => secondSignatureFixture.data.recipient,
			sender: () => secondSignatureFixture.data.sender,
		});

	const renderComponent = (properties?: any) => {
		let form: UseFormMethods | undefined;

		const defaultValues = properties?.defaultValues ?? { fees };
		const onSubmit = properties?.onSubmit ?? jest.fn();
		const activeTab = properties?.activeTab ?? 1;

		const Component = () => {
			form = useForm<any>({ defaultValues, mode: "onChange" });

			const { register } = form;

			useEffect(() => {
				register("fee");
				register("fees");
				register("inputFeeSettings");
			}, [register]);

			return (
				<Form context={form} onSubmit={onSubmit}>
					<SecondSignatureRegistrationForm.component
						profile={profile}
						activeTab={activeTab}
						wallet={wallet}
					/>
				</Form>
			);
		};

		const renderResult: RenderResult = render(<Component />);
		return { ...renderResult, form };
	};

	it("should render generation step", async () => {
		const passphrase = "mock bip39 passphrase";
		const bip39GenerateMock = jest.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		const { form, asFragment } = renderComponent();

		expect(asFragment()).toMatchSnapshot();

		await waitFor(() => expect(screen.getByTestId("SecondSignatureRegistrationForm__generation-step")));
		await waitFor(() => expect(form?.getValues("secondMnemonic")).toEqual(passphrase));

		expect(bip39GenerateMock).toHaveBeenCalled();

		bip39GenerateMock.mockRestore();
	});

	it("should not generate mnemonic if already set", async () => {
		const bip39GenerateMock = jest.spyOn(BIP39, "generate").mockImplementation();

		const { form, asFragment } = renderComponent({
			defaultValues: {
				fees,
				secondMnemonic: "test mnemonic",
			},
		});

		expect(asFragment()).toMatchSnapshot();

		await waitFor(() => expect(screen.getByTestId("SecondSignatureRegistrationForm__generation-step")));

		expect(form?.getValues("secondMnemonic")).toEqual("test mnemonic");

		expect(bip39GenerateMock).not.toHaveBeenCalled();

		bip39GenerateMock.mockRestore();
	});

	it("should set fee", async () => {
		renderComponent();

		// simple

		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);

		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// advanced

		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toBeVisible());

		fireEvent.change(screen.getByTestId("InputCurrency"), {
			target: {
				value: "9",
			},
		});

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("9"));
	});

	describe("backup step", () => {
		it("should render", async () => {
			const { asFragment } = renderComponent({
				activeTab: 2,
				defaultValues: {
					fees,
					secondMnemonic: "test mnemonic",
					wallet: {
						address: () => "address",
					},
				},
			});

			await waitFor(() =>
				expect(screen.getByTestId("SecondSignatureRegistrationForm__backup-step")).toBeTruthy(),
			);

			const writeTextMock = jest.fn();
			const clipboardOriginal = navigator.clipboard;
			(navigator as any).clipboard = { writeText: writeTextMock };

			fireEvent.click(screen.getByTestId("SecondSignature__copy"));

			await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith("test mnemonic"));

			(navigator as any).clipboard = clipboardOriginal;

			expect(asFragment()).toMatchSnapshot();
		});

		it("should show success toast on successful download", async () => {
			renderComponent({
				activeTab: 2,
				defaultValues: {
					fees,
					secondMnemonic: "test mnemonic",
					wallet: {
						address: () => "address",
					},
				},
			});

			jest.spyOn(utils, "saveFile").mockResolvedValueOnce("filePath");

			const toastSpy = jest.spyOn(toasts, "success");

			fireEvent.click(screen.getByTestId("SecondSignature__download"));

			await waitFor(() => expect(toastSpy).toHaveBeenCalled());

			toastSpy.mockRestore();
		});

		it("should not show success toast on cancelled download", async () => {
			renderComponent({
				activeTab: 2,
				defaultValues: {
					fees,
					secondMnemonic: "test mnemonic",
					wallet: {
						address: () => "address",
					},
				},
			});

			jest.spyOn(utils, "saveFile").mockResolvedValueOnce(undefined);

			const toastSpy = jest.spyOn(toasts, "success");

			fireEvent.click(screen.getByTestId("SecondSignature__download"));

			await waitFor(() => expect(toastSpy).not.toHaveBeenCalled());

			toastSpy.mockRestore();
		});

		it("should show error toast on error", async () => {
			renderComponent({
				activeTab: 2,
				defaultValues: {
					fees,
					secondMnemonic: "test mnemonic",
					wallet: {
						address: () => "address",
					},
				},
			});

			jest.spyOn(utils, "saveFile").mockRejectedValueOnce(new Error("Error"));

			const toastSpy = jest.spyOn(toasts, "error");

			fireEvent.click(screen.getByTestId("SecondSignature__download"));

			await waitFor(() => expect(toastSpy).toHaveBeenCalled());

			toastSpy.mockRestore();
		});
	});

	it("should render verification step", async () => {
		const { form } = renderComponent({
			activeTab: 3,
			defaultValues: {
				fees,
				secondMnemonic: passphrase,
			},
		});

		await waitFor(() =>
			expect(screen.getByTestId("SecondSignatureRegistrationForm__verification-step")).toBeTruthy(),
		);

		expect(form?.getValues("verification")).toBeUndefined();

		const walletMnemonic = passphrase.split(" ");

		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			fireEvent.click(screen.getByText(walletMnemonic[wordNumber - 1]));

			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The (\d+)/).length === 2 - index));
			}
		}

		await waitFor(() => expect(form?.getValues("verification")).toBe(true));
	});

	it("should render review step", async () => {
		renderComponent({
			activeTab: 4,
			defaultValues: {
				fee: 0,
				fees,
			},
		});

		await waitFor(() => expect(screen.getByTestId("SecondSignatureRegistrationForm__review-step")).toBeTruthy());
	});

	it("should render transaction details", async () => {
		const DetailsComponent = () => {
			const { t } = useTranslation();
			return (
				<SecondSignatureRegistrationForm.transactionDetails
					translations={t}
					transaction={transaction}
					wallet={wallet}
				/>
			);
		};
		const transaction = {
			amount: () => secondSignatureFixture.data.amount / 1e8,
			data: () => ({ data: () => secondSignatureFixture.data }),
			fee: () => secondSignatureFixture.data.fee / 1e8,
			id: () => secondSignatureFixture.data.id,
			recipient: () => secondSignatureFixture.data.recipient,
			sender: () => secondSignatureFixture.data.sender,
		} as Contracts.SignedTransactionData;
		const { asFragment } = render(<DetailsComponent />);

		await waitFor(() => expect(screen.getByTestId("TransactionFee")).toBeTruthy());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should sign transaction", async () => {
		const form = {
			clearErrors: jest.fn(),
			getValues: () => ({
				fee: "1",
				mnemonic: MNEMONICS[0],
				secondMnemonic: MNEMONICS[1],
				senderAddress: wallet.address(),
			}),
			setError: jest.fn(),
			setValue: jest.fn(),
		};
		const signMock = jest
			.spyOn(wallet.transaction(), "signSecondSignature")
			.mockReturnValue(Promise.resolve(secondSignatureFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [secondSignatureFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signSecondSignatureRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalled();
		expect(broadcastMock).toHaveBeenCalled();
		expect(transactionMock).toHaveBeenCalled();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should sign transaction using encryption password", async () => {
		const walletUsesWIFMock = jest.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = jest.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const form = {
			clearErrors: jest.fn(),
			getValues: () => ({
				encryptionPassword: "password",
				fee: "1",
				senderAddress: wallet.address(),
			}),
			setError: jest.fn(),
			setValue: jest.fn(),
		};
		const signMock = jest
			.spyOn(wallet.transaction(), "signSecondSignature")
			.mockReturnValue(Promise.resolve(secondSignatureFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [secondSignatureFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signSecondSignatureRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalled();
		expect(broadcastMock).toHaveBeenCalled();
		expect(transactionMock).toHaveBeenCalled();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});
});
