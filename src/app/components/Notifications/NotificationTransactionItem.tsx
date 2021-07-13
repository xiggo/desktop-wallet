import { TransactionCompactRow } from "domains/transaction/components/TransactionTable/TransactionRow/TransactionCompactRow";
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
			<TransactionCompactRow
				walletName={walletName}
				transaction={transaction}
				onClick={() => onTransactionClick?.(transaction)}
			/>
		</VisibilitySensor>
	);
};
