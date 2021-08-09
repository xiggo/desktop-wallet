import { BigNumber } from "@payvo/helpers";
import { Contracts as ProfileContracts } from "@payvo/profiles";
import { Services } from "@payvo/sdk";
import { useEnvironmentContext } from "app/contexts";
import { useCallback } from "react";
import { TransactionFees } from "types";

export const useFees = (profile: ProfileContracts.IProfile) => {
	const { env } = useEnvironmentContext();

	const calculateMultiSignatureFee = useCallback(
		async ({
			coin,
			network,
			participants,
		}: {
			coin: string;
			network: string;
			participants: number;
		}): Promise<BigNumber> => {
			const activeCoin = profile.coins().get(coin, network);

			return activeCoin.fee().calculate({
				asset: { multiSignature: { publicKeys: new Array(participants).fill(null) } },
				// TODO: needs adjustments in sdk to support fee calculation if `SignedTransactionData` is not available
				//@ts-ignore
				type: "multiSignature",
			});
		},
		[profile],
	);

	const findByType = useCallback(
		async (coin: string, network: string, type: string): Promise<TransactionFees> => {
			let transactionFees: Services.TransactionFee;

			try {
				transactionFees = env.fees().findByType(coin, network, type);
			} catch {
				await env.fees().syncAll(profile);

				transactionFees = env.fees().findByType(coin, network, type);
			}

			if (type === "multiSignature") {
				const defaultMultiSignatureFee = await calculateMultiSignatureFee({ coin, network, participants: 1 });

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

	return { calculateMultiSignatureFee, findByType };
};
