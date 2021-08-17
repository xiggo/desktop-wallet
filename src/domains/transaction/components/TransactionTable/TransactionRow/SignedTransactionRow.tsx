import { Contracts, DTO } from "@payvo/profiles";
import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { TableCell, TableRow } from "app/components/Table";
import { Tooltip } from "app/components/Tooltip";
import { useTimeFormat } from "app/hooks/use-time-format";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BaseTransactionRowAmount } from "./TransactionRowAmount";
import { BaseTransactionRowMode } from "./TransactionRowMode";
import { BaseTransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";

const StatusLabel = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}) => {
	const { t } = useTranslation();

	const isMultiSignatureReady = useMemo(() => {
		try {
			return wallet.coin().multiSignature().isMultiSignatureReady(transaction.data());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	if (wallet.transaction().isAwaitingOurSignature(transaction.id())) {
		return (
			<Tooltip content={t("TRANSACTION.MULTISIGNATURE.AWAITING_OUR_SIGNATURE")}>
				<span className="p-1 text-theme-danger-400">
					<Icon name="Pencil" size="lg" />
				</span>
			</Tooltip>
		);
	}

	if (wallet.transaction().isAwaitingOtherSignatures(transaction.id())) {
		return (
			<Tooltip
				content={t("TRANSACTION.MULTISIGNATURE.AWAITING_OTHER_SIGNATURE_COUNT", {
					count: wallet.coin().multiSignature().remainingSignatureCount(transaction.data()),
				})}
			>
				<span className="p-1 text-theme-warning-300">
					<Icon name="ClockPencil" size="lg" />
				</span>
			</Tooltip>
		);
	}

	if (wallet.transaction().isAwaitingConfirmation(transaction.id())) {
		return (
			<Tooltip content={t("TRANSACTION.MULTISIGNATURE.AWAITING_CONFIRMATIONS")}>
				<span className="p-1 text-theme-warning-300">
					<Icon name="Clock" size="lg" />
				</span>
			</Tooltip>
		);
	}

	if (isMultiSignatureReady) {
		return (
			<Tooltip content={t("TRANSACTION.MULTISIGNATURE.READY")}>
				<span className="p-1 text-theme-success-500">
					<Icon name="DoubleArrowRight" />
				</span>
			</Tooltip>
		);
	}

	return (
		<Tooltip content={t("TRANSACTION.MULTISIGNATURE.AWAITING_FINAL_SIGNATURE")}>
			<span className="p-1 text-theme-success-500">
				<Icon name="CircleCheckMarkPencil" size="lg" />
			</span>
		</Tooltip>
	);
};

export const SignedTransactionRow = ({
	transaction,
	onSign,
	onRowClick,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	onSign?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRowClick?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();

	const timeFormat = useTimeFormat();

	const recipient = transaction.get<string>("recipientId");

	const canBeSigned = useMemo(() => {
		try {
			return wallet.transaction().canBeSigned(transaction.id());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	return (
		<TableRow onClick={() => onRowClick?.(transaction)}>
			<TableCell variant="start">
				<Tooltip content={transaction.id()}>
					<span className="text-theme-secondary-300 dark:text-theme-secondary-800">
						<Icon name="MagnifyingGlassId" />
					</span>
				</Tooltip>
			</TableCell>

			<TableCell innerClassName="text-theme-secondary-text">
				<span data-testid="TransactionRow__timestamp">{transaction.timestamp().format(timeFormat)}</span>
			</TableCell>

			<TableCell innerClassName="space-x-4">
				<BaseTransactionRowMode isSent={true} type={transaction.type()} recipient={recipient} />

				<BaseTransactionRowRecipientLabel type={transaction.type()} recipient={recipient} />
			</TableCell>

			<TableCell innerClassName="justify-center">
				{transaction.usesMultiSignature() && (
					<Tooltip content={t("COMMON.MULTISIGNATURE")}>
						<span className="p-1">
							<Icon data-testid="PendingTransactions__multiSignature" name="Multisignature" size="lg" />
						</span>
					</Tooltip>
				)}
			</TableCell>

			<TableCell className="w-16" innerClassName="justify-center truncate">
				<StatusLabel wallet={wallet} transaction={transaction} />
			</TableCell>

			<TableCell innerClassName="justify-end">
				<BaseTransactionRowAmount
					isSent={true}
					total={transaction.amount() + transaction.fee()}
					wallet={wallet}
				/>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				{canBeSigned ? (
					<Button
						data-testid="TransactionRow__sign"
						variant="secondary"
						onClick={() => onSign?.(transaction)}
					>
						<Icon name="Pencil" />
						<span>{t("COMMON.SIGN")}</span>
					</Button>
				) : null}
			</TableCell>
		</TableRow>
	);
};
