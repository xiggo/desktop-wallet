import "jest-extended";

import { Contracts } from "@payvo/profiles";
import { Signatories } from "@payvo/sdk";
import { renderHook } from "@testing-library/react-hooks";
import { env, getDefaultProfileId, MNEMONICS } from "utils/testing-library";

import { useWalletSignatory } from "./use-wallet-signatory";

describe("useWalletSignatory", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		wallet = profile.wallets().first();

		await profile.sync();
	});

	it("should sign with mnemonic", async () => {
		const { result } = renderHook(() => useWalletSignatory(wallet));

		await expect(result.current.sign({ mnemonic: MNEMONICS[0] })).resolves.toBeInstanceOf(Signatories.Signatory);

		const signatory = await result.current.sign({ mnemonic: MNEMONICS[0] });

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.actsWithMnemonic()).toBeTrue();
		expect(signatory.signingKey()).toBe(MNEMONICS[0]);
		expect(() => signatory.confirmKey()).toThrow();
	});

	it("should sign with secret", async () => {
		const { result } = renderHook(() => useWalletSignatory(wallet));

		await expect(result.current.sign({ secret: "secret" })).resolves.toBeInstanceOf(Signatories.Signatory);

		const signatory = await result.current.sign({ secret: "secret" });

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.actsWithSecret()).toBeTrue();
		expect(signatory.signingKey()).toBe("secret");
		expect(() => signatory.confirmKey()).toThrow();
	});

	it("should sign with secondMnemonic", async () => {
		const { result } = renderHook(() => useWalletSignatory(wallet));

		const signatory = await result.current.sign({ mnemonic: MNEMONICS[0], secondMnemonic: MNEMONICS[1] });

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.actsWithConfirmationMnemonic()).toBeTrue();
		expect(signatory.signingKey()).toBe(MNEMONICS[0]);
		expect(signatory.confirmKey()).toBe(MNEMONICS[1]);
	});

	it("should sign with WIF", async () => {
		const { result } = renderHook(() => useWalletSignatory(wallet));

		const signatory = await result.current.sign({ wif: "SGq4xLgZKCGxs7bjmwnBrWcT4C1ADFEermj846KC97FSv1WFD1dA" });

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.actsWithWIF()).toBeTrue();
		expect(signatory.signingKey()).toBe("SGq4xLgZKCGxs7bjmwnBrWcT4C1ADFEermj846KC97FSv1WFD1dA");
		expect(() => signatory.confirmKey()).toThrow();
	});

	it("should sign with private key", async () => {
		const { result } = renderHook(() => useWalletSignatory(wallet));

		const signatory = await result.current.sign({
			privateKey: "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712",
		});

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.actsWithPrivateKey()).toBeTrue();
		expect(signatory.signingKey()).toBe("d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712");
		expect(() => signatory.confirmKey()).toThrow();
	});

	it("should throw error if no input is provided", async () => {
		const { result } = renderHook(() => useWalletSignatory(wallet));

		await expect(result.current.sign({})).rejects.toThrow(
			"Signing failed. No mnemonic or encryption password provided",
		);
	});

	it("should sign with encryption password on wallet with second signature", async () => {
		jest.spyOn(wallet, "isSecondSignature").mockReturnValueOnce(true);

		wallet.signingKey().set(MNEMONICS[0], "password");
		wallet.confirmKey().set(MNEMONICS[1], "password");

		const { result } = renderHook(() => useWalletSignatory(wallet));

		const signatory = await result.current.sign({
			encryptionPassword: "password",
		});

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.signingKey()).toBe(MNEMONICS[0]);
		expect(signatory.confirmKey()).toBe(MNEMONICS[1]);
	});

	it("should sign with secret with encryption password", async () => {
		const walletFromSecretWithEncryption = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			password: "password",
			secret: "testing",
		});

		const { result } = renderHook(() => useWalletSignatory(walletFromSecretWithEncryption));

		const signatory = await result.current.sign({
			encryptionPassword: "password",
		});

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.signingKey()).toBe("testing");
	});

	it("should sign with ledger wallet using derivation path", async () => {
		const publicKey = wallet.publicKey();

		jest.spyOn(wallet, "isLedger").mockReturnValue(true);
		jest.spyOn(wallet, "publicKey").mockReturnValueOnce(undefined);
		jest.spyOn(wallet.data(), "get").mockReturnValue("m/44'/0'/0'/0/0");
		jest.spyOn(wallet, "ledger").mockImplementation(() => ({
			getPublicKey: () => publicKey,
		}));

		const { result } = renderHook(() => useWalletSignatory(wallet));

		const signatory = await result.current.sign({});

		expect(signatory).toBeInstanceOf(Signatories.Signatory);
		expect(signatory.actsWithLedger()).toBeTrue();
		expect(signatory.signingKey()).toBe("m/44'/0'/0'/0/0");
		expect(() => signatory.confirmKey()).toThrow();

		jest.clearAllMocks();
	});
});
