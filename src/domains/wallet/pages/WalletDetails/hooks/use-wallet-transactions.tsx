import { Contracts, DTO } from "@payvo/profiles";
import { useSynchronizer } from "app/hooks";
import { useTransaction } from "domains/transaction/hooks";
import { useCallback, useMemo, useState } from "react";

export const useWalletTransactions = (wallet: Contracts.IReadWriteWallet) => {
	const { fetchWalletUnconfirmedTransactions } = useTransaction();

	const [pendingTransfers, setPendingTransfers] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [pendingSigned, setPendingSigned] = useState<DTO.ExtendedSignedTransactionData[]>([]);

	const syncPending = useCallback(async () => {
		if (!wallet.hasBeenFullyRestored()) {
			return;
		}

		await wallet.transaction().sync();

		const sent = await fetchWalletUnconfirmedTransactions(wallet);

		setPendingTransfers(sent);

		setPendingSigned(
			Object.values({
				...wallet.transaction().signed(),
				...wallet.transaction().waitingForOtherSignatures(),
				...wallet.transaction().waitingForOurSignature(),
			}).filter((item) => !!item.get("multiSignature")),
		);
	}, [wallet, setPendingTransfers, setPendingSigned, fetchWalletUnconfirmedTransactions]);

	const pendingTransactions = useMemo(() => {
		const pending = [];
		wallet.transaction().restore();

		for (const transaction of [...pendingSigned, ...pendingTransfers]) {
			const id = transaction.id();

			const hasBeenSigned = wallet.transaction().hasBeenSigned(id);
			const isAwaitingConfirmation = wallet.transaction().isAwaitingConfirmation(id);
			const isAwaitingOurSignature = wallet.transaction().isAwaitingOurSignature(id);
			const isAwaitingOtherSignatures = wallet.transaction().isAwaitingOtherSignatures(id);
			const isMultisignature = !!wallet.transaction().transaction(id).get("multiSignature");
			const isPendingTransfer = !isMultisignature && (hasBeenSigned || isAwaitingConfirmation);

			pending.push({
				hasBeenSigned,
				isAwaitingConfirmation,
				isAwaitingOtherSignatures,
				isAwaitingOurSignature,
				isPendingTransfer,
				transaction,
			});
		}

		return pending;
	}, [pendingSigned, pendingTransfers, wallet]);

	const jobs = useMemo(
		() => [
			{
				callback: syncPending,
				interval: 5000,
			},
		],
		[syncPending],
	);

	const { start, stop } = useSynchronizer(jobs);

	return {
		pendingTransactions,
		startSyncingPendingTransactions: start,
		stopSyncingPendingTransactions: stop,
		syncPending,
	};
};
