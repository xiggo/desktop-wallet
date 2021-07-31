import { Contracts as ProfilesContracts } from "@payvo/profiles";
import { Contracts } from "@payvo/sdk";
import { renderHook } from "@testing-library/react-hooks";
import { Form } from "app/components/Form";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import multiSignatureFixture from "tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import { TransactionFees } from "types";
import { act, env, fireEvent, getDefaultProfileId, render, screen, syncFees, waitFor } from "utils/testing-library";

import { translations as transactionTranslations } from "../../i18n";
import { MultiSignatureRegistrationForm } from "./MultiSignatureRegistrationForm";

describe("MultiSignature Registration Form", () => {
	let profile: ProfilesContracts.IProfile;
	let wallet: ProfilesContracts.IReadWriteWallet;
	let wallet2: ProfilesContracts.IReadWriteWallet;
	let fees: TransactionFees;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		wallet2 = profile.wallets().last();
		fees = {
			avg: 1.354,
			max: 10,
			min: 0,
			static: 0,
		};

		await profile.sync();
		await syncFees(profile);
	});

	const Component = ({
		form,
		onSubmit = () => void 0,
		activeTab = 1,
	}: {
		form: ReturnType<typeof useForm>;
		onSubmit?: () => void;
		activeTab?: number;
	}) => (
		<Form context={form} onSubmit={onSubmit}>
			<MultiSignatureRegistrationForm.component
				profile={profile}
				activeTab={activeTab}
				fees={fees}
				wallet={wallet}
			/>
		</Form>
	);

	it("should render form step", async () => {
		const { result, waitForNextUpdate } = renderHook(() => useForm());
		const { asFragment } = render(<Component form={result.current} />);
		await waitForNextUpdate();
		await waitFor(() => expect(screen.queryAllByRole("row")).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should set fee", async () => {
		const { result, waitForNextUpdate } = renderHook(() => useForm());
		result.current.register("fee");
		result.current.register("inputFeeSettings");

		const { rerender } = render(<Component form={result.current} />);
		await waitForNextUpdate();

		fireEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		rerender(<Component form={result.current} />);

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toBeVisible());

		fireEvent.change(screen.getByTestId("InputCurrency"), {
			target: {
				value: "9",
			},
		});

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("9"));
	});

	it("should fill form", async () => {
		const { result, waitForNextUpdate } = renderHook(() => useForm());
		result.current.register("fee");
		result.current.register("participants");

		const { rerender } = render(<Component form={result.current} />);
		await waitForNextUpdate();

		act(() => {
			fireEvent.click(screen.getByText(transactionTranslations.FEES.AVERAGE));
		});

		act(() => {
			fireEvent.input(screen.getByTestId("MultiSignatureRegistrationForm__min-participants"), {
				target: {
					value: 3,
				},
			});
		});

		await waitForNextUpdate();
		await waitFor(() => expect(result.current.getValues("fee")).toBe("1.354"));
		await waitFor(() => expect(result.current.getValues("minParticipants")).toBe("3"));

		fireEvent.input(screen.getByTestId("SelectDropdown__input"), {
			target: {
				value: wallet2.address(),
			},
		});

		fireEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		rerender(<Component form={result.current} />);

		await waitFor(() => expect(result.current.getValues("minParticipants")).toBe("3"));
		await waitFor(() =>
			expect(result.current.getValues("participants")).toEqual([
				{
					address: wallet.address(),
					alias: wallet.alias(),
					publicKey: wallet.publicKey(),
				},
				{
					address: wallet2.address(),
					alias: wallet2.alias(),
					publicKey: wallet2.publicKey(),
				},
			]),
		);
	});

	it("should show name of wallets in form step", async () => {
		const { result, waitForNextUpdate } = renderHook(() => useForm());
		result.current.register("fee");
		result.current.register("participants");

		render(<Component form={result.current} />);

		fireEvent.input(screen.getByTestId("SelectDropdown__input"), {
			target: {
				value: wallet2.address(),
			},
		});

		fireEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitForNextUpdate();

		await waitFor(() => expect(result.current.getValues("participants")).toHaveLength(2));

		expect(screen.getByText("Participant #1")).toBeInTheDocument();
		expect(screen.getAllByTestId("recipient-list__recipient-list-item")[0]).toHaveTextContent("ARK Wallet 1");
		expect(screen.getByText("Participant #2")).toBeInTheDocument();
		expect(screen.getAllByTestId("recipient-list__recipient-list-item")[1]).toHaveTextContent("ARK Wallet 2");
	});

	it("should render review step", () => {
		const { result } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: fees.avg,
					minParticipants: 2,
					participants: [
						{
							address: wallet.address(),
							publicKey: wallet.publicKey()!,
						},
						{
							address: wallet2.address(),
							publicKey: wallet2.publicKey()!,
						},
					],
				},
			}),
		);

		const { asFragment } = render(<Component activeTab={2} form={result.current} />);

		expect(screen.getByText(transactionTranslations.MULTISIGNATURE.PARTICIPANTS)).toBeInTheDocument();
		expect(screen.getByText(transactionTranslations.MULTISIGNATURE.MIN_SIGNATURES)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show name of wallets in review step", () => {
		const { result } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: fees.avg,
					minParticipants: 2,
					participants: [
						{
							address: wallet.address(),
							alias: wallet.alias(),
							publicKey: wallet.publicKey()!,
						},
						{
							address: wallet2.address(),
							alias: wallet2.alias(),
							publicKey: wallet2.publicKey()!,
						},
					],
				},
			}),
		);

		render(<Component activeTab={2} form={result.current} />);

		expect(screen.getAllByTestId("recipient-list__recipient-list-item")[0]).toHaveTextContent("ARK Wallet 1");
		expect(screen.getAllByTestId("recipient-list__recipient-list-item")[1]).toHaveTextContent("ARK Wallet 2");
	});

	it("should render transaction details", async () => {
		const DetailsComponent = () => {
			const { t } = useTranslation();
			return (
				<MultiSignatureRegistrationForm.transactionDetails
					translations={t}
					transaction={transaction}
					wallet={wallet}
				/>
			);
		};
		const transaction = {
			amount: () => multiSignatureFixture.data.amount / 1e8,
			data: () => ({ data: () => multiSignatureFixture.data }),
			fee: () => multiSignatureFixture.data.fee / 1e8,
			id: () => multiSignatureFixture.data.id,
			recipient: () => multiSignatureFixture.data.recipient,
			sender: () => multiSignatureFixture.data.sender,
		} as Contracts.SignedTransactionData;
		const { asFragment } = render(<DetailsComponent />);

		await waitFor(() => expect(screen.getByTestId("TransactionFee")).toBeTruthy());
		await waitFor(() => expect(screen.getByTestId("TransactionDetail")).toBeTruthy());

		expect(asFragment()).toMatchSnapshot();
	});
});
