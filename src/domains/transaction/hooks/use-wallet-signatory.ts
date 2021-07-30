import { Contracts as ProfileContracts } from "@payvo/profiles";
import { Services, Signatories } from "@payvo/sdk";
import { useCallback } from "react";
import { assertString } from "utils/assertions";

export interface SignInput {
	encryptionPassword?: string;
	mnemonic?: string;
	secondMnemonic?: string;
	secret?: string;
	wif?: string;
	privateKey?: string;
}

export const useWalletSignatory = (
	wallet: ProfileContracts.IReadWriteWallet,
): {
	sign: ({
		mnemonic,
		secondMnemonic,
		encryptionPassword,
		wif,
		privateKey,
		secret,
	}: SignInput) => Promise<Signatories.Signatory>;
} => ({
	sign: useCallback(
		async ({ mnemonic, secondMnemonic, encryptionPassword, wif, privateKey, secret }: SignInput) => {
			if (mnemonic && secondMnemonic) {
				return wallet.signatory().confirmationMnemonic(mnemonic, secondMnemonic);
			}

			if (mnemonic) {
				return wallet.signatory().mnemonic(mnemonic);
			}

			if (encryptionPassword) {
				return wallet.signatory().wif(await wallet.wif().get(encryptionPassword));
			}

			if (wallet.isMultiSignature()) {
				return wallet.signatory().multiSignature(wallet.multiSignature().all() as Services.MultiSignatureAsset);
			}

			if (wallet.isLedger()) {
				const derivationPath = wallet.data().get(ProfileContracts.WalletData.DerivationPath);

				assertString(derivationPath);

				return wallet.signatory().ledger(derivationPath);
			}

			if (wif) {
				return wallet.signatory().wif(wif);
			}

			if (privateKey) {
				return wallet.signatory().privateKey(privateKey);
			}

			if (secret) {
				return wallet.signatory().secret(secret);
			}

			throw new Error("Signing failed. No mnemonic or encryption password provided");
		},
		[wallet],
	),
});
