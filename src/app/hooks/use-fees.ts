import { BigNumber } from "@payvo/helpers";
import { Contracts as ProfileContracts } from "@payvo/profiles";
import { Coins, Services } from "@payvo/sdk";
import { useEnvironmentContext } from "app/contexts";
import { Participant } from "domains/transaction/components/MultiSignatureRegistrationForm/components/AddParticipant/AddParticipant";
import { useCallback } from "react";
import { TransactionFees } from "types";
import { assertString } from "utils/assertions";

interface MusigFeesProperties {
	participants: Participant[];
	minParticipants: number;
	coin: Coins.Coin;
}

export const useFees = (profile: ProfileContracts.IProfile) => {
	const { env } = useEnvironmentContext();

	const createMuSigFeeStubTransaction = useCallback(
		async ({ participants, coin, minParticipants }: MusigFeesProperties) => {
			const { mnemonic, wallet } = await profile.walletFactory().generate({
				coin: coin.network().coin(),
				network: coin.network().id(),
			});

			const publicKey = wallet.publicKey();
			assertString(publicKey);

			const signatory = await coin.signatory().stub(mnemonic);

			const publicKeys = participants.map((participant) => participant.publicKey);
			// Some coins like ARK, throw error if signatory's public key is not included in musig participants public keys.
			publicKeys.splice(1, 1, publicKey);

			return coin.transaction().multiSignature({
				data: {
					mandatoryKeys: [],
					min: +minParticipants,
					numberOfSignatures: minParticipants,
					optionalKeys: publicKeys,
					publicKeys,
					senderPublicKey: publicKey,
				},
				nonce: "1",
				signatory,
			});
		},
		[profile],
	);

	const calculateMultiSignatureFee = useCallback(
		async ({ participants, coin, minParticipants }: MusigFeesProperties): Promise<BigNumber> => {
			// Provide a stub `SignedTransactionData` for coins that need it to calculate fees.
			const transaction = await createMuSigFeeStubTransaction({
				coin,
				minParticipants,
				participants,
			});

			return coin.fee().calculate(transaction);
		},
		[createMuSigFeeStubTransaction],
	);

	const calculateFeesByType = useCallback(
		async (coin: string, network: string, type: string): Promise<TransactionFees> => {
			let transactionFees: Services.TransactionFee;

			try {
				transactionFees = env.fees().findByType(coin, network, type);
			} catch {
				await env.fees().syncAll(profile);

				transactionFees = env.fees().findByType(coin, network, type);
			}

			if (type === "multiSignature") {
				const defaultMultiSignatureFee = await calculateMultiSignatureFee({
					// participants: [{ address: wallet.address(), alias: wallet.alias(), publicKey }],
					coin: profile.coins().get(coin, network),

					minParticipants: 2,

					participants: [],
				});

				return {
					avg: defaultMultiSignatureFee.toHuman(),
					isDynamic: transactionFees.isDynamic,
					max: defaultMultiSignatureFee.toHuman(),
					min: defaultMultiSignatureFee.toHuman(),
					static: defaultMultiSignatureFee.toHuman(),
				};
			}

			return {
				avg: transactionFees.avg.toHuman(),
				max: transactionFees.max.toHuman(),
				min: transactionFees.min.toHuman(),
				static: transactionFees.static.toHuman(),
			};
		},
		[env, profile, calculateMultiSignatureFee],
	);

	return { calculateFeesByType, calculateMultiSignatureFee };
};
