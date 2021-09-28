import { DTO } from "@payvo/profiles";
import { Icon } from "app/components/Icon";
import { Link } from "app/components/Link";
import { TableCell, TableRow } from "app/components/Table";
import { useTimeFormat } from "app/hooks/use-time-format";
import cn from "classnames";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowAmount } from "./TransactionRowAmount";
import { TransactionRowConfirmation } from "./TransactionRowConfirmation";
import { TransactionRowMemo } from "./TransactionRowMemo";
import { TransactionRowMode } from "./TransactionRowMode";
import { TransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { TransactionRowSkeleton } from "./TransactionRowSkeleton";

type Properties = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	onClick?: () => void;
	walletName?: string;
	isLoading?: boolean;
	showMemoColumn?: boolean;
	isCompact?: boolean;
} & React.HTMLProps<any>;

export const TransactionRow = memo(
	({
		className,
		exchangeCurrency,
		transaction,
		onClick,
		walletName,
		isLoading = false,
		showMemoColumn = false,
		isCompact = false,
		...properties
	}: Properties) => {
		const { t } = useTranslation();
		const timeFormat = useTimeFormat();

		if (isLoading) {
			return <TransactionRowSkeleton showMemoColumn={showMemoColumn} isCompact={isCompact} />;
		}

		return (
			<TableRow onClick={onClick} className={cn("group", className)} {...properties}>
				<TableCell variant="start" isCompact={isCompact}>
					<Link
						data-testid="TransactionRow__ID"
						to={transaction.explorerLink()}
						tooltip={transaction.id()}
						showExternalIcon={false}
						isExternal
					>
						<Icon name="MagnifyingGlassId" />
					</Link>
				</TableCell>

				<TableCell innerClassName="text-theme-secondary-text" isCompact={isCompact}>
					<span data-testid="TransactionRow__timestamp" className="whitespace-nowrap">
						{transaction.timestamp()!.format(timeFormat)}
					</span>
				</TableCell>

				<TableCell innerClassName="flex space-x-4" isCompact={isCompact}>
					<TransactionRowMode transaction={transaction} iconSize={isCompact ? "xs" : "lg"} />
					<div className="w-40 flex-1">
						<TransactionRowRecipientLabel transaction={transaction} walletName={walletName} />
					</div>
				</TableCell>

				{showMemoColumn && (
					<TableCell innerClassName="justify-center" isCompact={isCompact}>
						<TransactionRowMemo memo={transaction.memo()} />
					</TableCell>
				)}

				<TableCell className="w-16" innerClassName="justify-center" isCompact={isCompact}>
					<TransactionRowConfirmation transaction={transaction} />
				</TableCell>

				<TableCell innerClassName="justify-end" isCompact={isCompact}>
					<TransactionRowAmount
						transaction={transaction}
						exchangeCurrency={exchangeCurrency}
						exchangeTooltip
						isCompact={isCompact}
					/>
				</TableCell>

				<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end" isCompact={isCompact}>
					{!exchangeCurrency || transaction.wallet().network().isTest() ? (
						<span
							data-testid="TransactionRow__currency"
							className="whitespace-nowrap text-theme-secondary-text"
						>
							{t("COMMON.NOT_AVAILABLE")}
						</span>
					) : (
						<span data-testid="TransactionRow__currency" className="whitespace-nowrap">
							<TransactionRowAmount transaction={transaction} exchangeCurrency={exchangeCurrency} />
						</span>
					)}
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
