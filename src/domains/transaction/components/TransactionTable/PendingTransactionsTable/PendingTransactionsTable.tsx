import { DTO } from "@payvo/profiles";
import { Table } from "app/components/Table";
import React from "react";
import { useTranslation } from "react-i18next";

import { PendingTransferRow } from "../TransactionRow/PendingTransferRow";
import { SignedTransactionRow } from "../TransactionRow/SignedTransactionRow";
import { PendingTransaction, Properties } from "./PendingTransactionsTable.contracts";
import { usePendingTransactionTableColumns } from "./PendingTransactionsTable.helpers";

export const PendingTransactions = ({
	wallet,
	onClick,
	onPendingTransactionClick,
	pendingTransactions,
	isCompact,
}: Properties) => {
	const { t } = useTranslation();

	const showMemoColumn = wallet.network().usesMemo();

	const columns = usePendingTransactionTableColumns({ showMemoColumn });

	return (
		<div data-testid="PendingTransactions" className="relative">
			<h2 className="mb-6 text-2xl font-bold">{t("WALLETS.PAGE_WALLET_DETAILS.PENDING_TRANSACTIONS")}</h2>

			<Table columns={columns} data={pendingTransactions}>
				{(transaction: PendingTransaction) => {
					if (transaction.isPendingTransfer) {
						return (
							<PendingTransferRow
								isCompact={isCompact}
								wallet={wallet}
								transaction={transaction.transaction as DTO.ExtendedConfirmedTransactionData}
								onRowClick={onPendingTransactionClick}
								showMemoColumn={showMemoColumn}
							/>
						);
					}

					return (
						<SignedTransactionRow
							isCompact={isCompact}
							transaction={transaction.transaction as DTO.ExtendedSignedTransactionData}
							wallet={wallet}
							onSign={onClick}
							onRowClick={onClick}
							showMemoColumn={showMemoColumn}
						/>
					);
				}}
			</Table>
		</div>
	);
};
