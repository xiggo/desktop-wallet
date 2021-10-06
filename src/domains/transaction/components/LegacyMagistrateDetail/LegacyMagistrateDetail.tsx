import { Modal } from "app/components/Modal";
import {
	TransactionConfirmations,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionTimestamp,
} from "domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "domains/transaction/components/TransactionDetailModal/TransactionDetailModal.models";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const LegacyMagistrateDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	return (
		<Modal title={t("TRANSACTION.TRANSACTION_TYPES.MAGISTRATE")} isOpen={isOpen} onClose={onClose}>
			<TransactionExplorerLink transaction={transaction} />

			<TransactionSender wallet={wallet} border={false} />

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionConfirmations transaction={transaction} />
		</Modal>
	);
};

LegacyMagistrateDetail.defaultProps = {
	isOpen: false,
};
