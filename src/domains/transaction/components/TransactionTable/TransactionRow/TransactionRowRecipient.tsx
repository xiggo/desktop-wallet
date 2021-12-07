import { Contracts, DTO } from "@payvo/sdk-profiles";
import React, { useMemo } from "react";

import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";
import { TransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { useWalletAlias } from "@/app/hooks/use-wallet-alias";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	isCompact: boolean;
}

export const TransactionRowRecipient = ({ transaction, profile, isCompact }: Properties) => {
	const { getWalletAlias } = useWalletAlias();

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.recipient(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	return (
		<>
			<TransactionRowRecipientIcon
				recipient={transaction.recipient()}
				type={transaction.type()}
				isCompact={isCompact}
			/>
			<div className="w-0 flex-1">
				<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
			</div>
		</>
	);
};
