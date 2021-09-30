import { Coins } from "@payvo/sdk";

interface BuildTransferDataProperties {
	coin: Coins.Coin;
	recipients?: { address: string; amount: number }[];
	memo?: string;
}

export const buildTransferData = async ({ coin, recipients, memo }: BuildTransferDataProperties) => {
	let data: Record<string, any> = {};

	if (recipients?.length === 1) {
		data = {
			amount: +recipients[0].amount,
			to: recipients[0].address,
		};
	}

	if (!!recipients?.length && recipients.length > 1) {
		data = {
			payments: recipients?.map(({ address, amount }: { address: string; amount: number }) => ({
				amount: +amount,
				to: address,
			})),
		};
	}

	if (memo) {
		data.memo = memo;
	}

	const expiration = await coin.transaction().estimateExpiration();

	if (expiration) {
		data.expiration = Number.parseInt(expiration);
	}

	return data;
};
