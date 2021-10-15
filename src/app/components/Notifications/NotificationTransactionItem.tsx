import { TableCell, TableRow } from "app/components/Table";
import { TransactionRowAmount } from "domains/transaction/components/TransactionTable/TransactionRow/TransactionRowAmount";
import { TransactionRowMode } from "domains/transaction/components/TransactionTable/TransactionRow/TransactionRowMode";
import { TransactionRowRecipientLabel } from "domains/transaction/components/TransactionTable/TransactionRow/TransactionRowRecipientLabel";
import React, { useEffect, useState } from "react";
import VisibilitySensor from "react-visibility-sensor";

import { NotificationTransactionItemProperties } from "./contracts";

export const NotificationTransactionItem = ({
	transaction,
	profile,
	onVisibilityChange,
	containmentRef,
	onTransactionClick,
}: NotificationTransactionItemProperties) => {
	const [walletName, setWalletName] = useState<string>();

	useEffect(() => {
		const senderWallet = profile.contacts().findByAddress(transaction?.sender());
		setWalletName(senderWallet[0]?.name());
	}, [profile, transaction]);

	return (
		<VisibilitySensor
			onChange={(isVisible) => onVisibilityChange?.(isVisible)}
			scrollCheck
			delayedCall
			containment={containmentRef?.current}
		>
			<TableRow onClick={() => onTransactionClick?.(transaction)}>
				<TableCell variant="start" className="w-3/5" innerClassName="flex space-x-3" isCompact>
					<TransactionRowMode transaction={transaction} isCompact />
					<div className="w-20 flex-1">
						<TransactionRowRecipientLabel transaction={transaction} walletName={walletName} />
					</div>
				</TableCell>

				<TableCell variant="end" innerClassName="justify-end" isCompact>
					<TransactionRowAmount transaction={transaction} />
				</TableCell>
			</TableRow>
		</VisibilitySensor>
	);
};
