import { Contracts, DTO } from "@payvo/profiles";
import { env, getDefaultProfileId, getDefaultWalletMnemonic, syncDelegates } from "utils/testing-library";

import { getMultiSignatureInfo } from "./MultiSignatureDetail.helpers";

describe("MultiSignatureDetail Helpers", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transaction: DTO.ExtendedSignedTransactionData;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);

		wallet = profile.wallets().first();

		await wallet.synchroniser().identity();

		transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiSignature({
					data: {
						mandatoryKeys: [],
						min: 2,
						numberOfSignatures: 2,
						optionalKeys: [],
						publicKeys: [],
						senderPublicKey: wallet.publicKey(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet.coin().signatory().stub(getDefaultWalletMnemonic()),
				}),
			wallet,
		);
	});

	it("should extract multisignature info", () => {
		const { min, publicKeys } = getMultiSignatureInfo(transaction);

		expect(min).toEqual(2);
		expect(publicKeys).toHaveLength(0);
	});

	it("should extract multisignature info mapping mandatoryKeys and numberOfSignatures to min and publicKeys", () => {
		jest.spyOn(transaction, "get").mockReturnValue({
			mandatoryKeys: [],
			numberOfSignatures: 2,
			optionalKeys: [],
		});

		const { min, publicKeys } = getMultiSignatureInfo(transaction);

		expect(min).toEqual(2);
		expect(publicKeys).toHaveLength(0);
	});
});
