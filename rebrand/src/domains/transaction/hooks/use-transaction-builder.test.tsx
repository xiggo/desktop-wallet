import { Services } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { act as actHook, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useTransactionBuilder } from "./use-transaction-builder";
import { LedgerProvider } from "@/app/contexts";
import {
	defaultNetMocks,
	env,
	getDefaultLedgerTransport,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	WithProviders,
} from "@/utils/testing-library";

describe("Use Transaction Builder Hook", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	const transport = getDefaultLedgerTransport();

	const wrapper = ({ children }: any) => (
		<WithProviders>
			<LedgerProvider transport={transport}>{children}</LedgerProvider>
		</WithProviders>
	);

	beforeAll(async () => {
		defaultNetMocks();
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await profile.sync();
	});

	it("should sign transfer", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());
		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			fee: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
		});

		expect(transaction.id()).toBe("bad2e9a02690d7cb0efdddfff1f7eacdf4685e22c0b5c3077e1de67511e2553d");
	});

	it("should sign transfer with multisignature wallet", async () => {
		const { result: builder } = renderHook(() => useTransactionBuilder(), { wrapper });

		jest.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		jest.spyOn(wallet.multiSignature(), "all").mockReturnValue({
			min: 2,
			publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
		});

		const signatory = await wallet.signatory().mnemonic(getDefaultWalletMnemonic());
		const input: Services.TransferInput = {
			data: {
				amount: 1,
				to: wallet.address(),
			},
			fee: 1,
			nonce: "1",
			signatory,
		};

		let transaction: any;

		await actHook(async () => {
			const result = await builder.current.build("transfer", input, wallet);
			transaction = result.transaction;
		});

		expect(transaction.id()).toBe("6c38de343321f7d853ff98c1669aecee429ed51c13a473f6d39e3037d6685da4");

		jest.clearAllMocks();
	});
});
