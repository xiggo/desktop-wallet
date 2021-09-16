import { DTO } from "@payvo/profiles";
import { Modal } from "app/components/Modal";
import { useActiveProfile, useWalletAlias } from "app/hooks";
import {
	TransactionAmount,
	TransactionConfirmations,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionTimestamp,
} from "domains/transaction/components/TransactionDetail";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface Properties {
	isOpen: boolean;
	transaction: DTO.ExtendedConfirmedTransactionData;
	onClose: () => void;
}

export const UnlockTokenDetail: React.FC<Properties> = ({ transaction, isOpen, onClose }: Properties) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);
	const timestamp = useMemo(() => transaction.timestamp(), [transaction]);

	const { getWalletAlias } = useWalletAlias();

	const { alias, isDelegate } = useMemo(
		() =>
			getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		[getWalletAlias, profile, wallet],
	);

	return (
		<Modal title={t("TRANSACTION.TRANSACTION_TYPES.UNLOCK_TOKEN")} isOpen={isOpen} onClose={onClose}>
			<TransactionExplorerLink transaction={transaction} />

			<TransactionSender address={transaction.sender()} alias={alias} isDelegate={isDelegate} border={false} />

			<TransactionAmount
				amount={transaction.amount()}
				convertedAmount={transaction.convertedAmount()}
				currency={wallet.currency()}
				exchangeCurrency={wallet.exchangeCurrency()}
				isSent={transaction.isSent()}
			/>

			<TransactionFee
				currency={wallet.currency()}
				value={transaction.fee()}
				convertedValue={transaction.convertedFee()}
				exchangeCurrency={wallet.exchangeCurrency()}
			/>

			{!!timestamp && <TransactionTimestamp timestamp={timestamp} />}

			<TransactionConfirmations transaction={transaction} />
		</Modal>
	);
};
