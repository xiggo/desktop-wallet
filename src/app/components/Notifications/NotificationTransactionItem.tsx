import React, { useMemo } from "react";
import VisibilitySensor from "react-visibility-sensor";

import { NotificationTransactionItemProperties } from "./Notifications.contracts";
import { TableCell, TableRow } from "@/app/components/Table";
import { useWalletAlias } from "@/app/hooks";
import { TransactionRowAmount } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowAmount";
import { TransactionRowMode } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowMode";
import { TransactionRowRecipientLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowRecipientLabel";

export const NotificationTransactionItem = ({
	transaction,
	profile,
	onVisibilityChange,
	containmentRef,
	onTransactionClick,
	isCompact,
}: NotificationTransactionItemProperties) => {
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
		<VisibilitySensor
			onChange={(isVisible) => onVisibilityChange?.(isVisible)}
			scrollCheck
			delayedCall
			containment={containmentRef?.current}
		>
			<TableRow onClick={() => onTransactionClick?.(transaction)}>
				<TableCell variant="start" className="w-3/5" innerClassName="flex space-x-3" isCompact={isCompact}>
					<TransactionRowMode
						transaction={transaction}
						address={transaction.recipient()}
						isCompact={isCompact}
					/>
					<div className="w-20 flex-1">
						<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
					</div>
				</TableCell>

				<TableCell variant="end" innerClassName="justify-end" isCompact={isCompact}>
					<TransactionRowAmount transaction={transaction} />
				</TableCell>
			</TableRow>
		</VisibilitySensor>
	);
};
