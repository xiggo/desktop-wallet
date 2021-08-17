import { DTO } from "@payvo/profiles";
import { Button } from "app/components/Button";
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
	onSign?: () => void;
	onClick?: () => void;
	walletName?: string;
	isLoading?: boolean;
	showExplorerLink?: boolean;
	showMemoColumn?: boolean;
	showSignColumn?: boolean;
	isCompact?: boolean;
} & React.HTMLProps<any>;

export const TransactionRow = memo(
	({
		className,
		exchangeCurrency,
		transaction,
		onSign,
		onClick,
		walletName,
		isLoading = false,
		showExplorerLink = true,
		showMemoColumn = false,
		showSignColumn = false,
		isCompact = false,
		...properties
	}: Properties) => {
		const { t } = useTranslation();
		const timeFormat = useTimeFormat();

		if (isLoading) {
			return (
				<TransactionRowSkeleton
					data-testid="TransactionRow__skeleton"
					showCurrencyColumn={!!exchangeCurrency}
					showSignColumn={showSignColumn}
					showMemoColumn={showMemoColumn}
					isCompact={isCompact}
				/>
			);
		}

		const isSignaturePending = showSignColumn && transaction.isMultiSignatureRegistration();

		let lastCellContent = undefined;

		if (isSignaturePending) {
			lastCellContent = (
				<Button data-testid="TransactionRow__sign" variant="secondary" onClick={onSign}>
					<Icon name="Pencil" />
					<span>{t("COMMON.SIGN")}</span>
				</Button>
			);
		}

		if (exchangeCurrency && !lastCellContent) {
			if (transaction.wallet().network().isTest()) {
				lastCellContent = (
					<span
						data-testid="TransactionRow__currency"
						className="whitespace-nowrap text-theme-secondary-text"
					>
						{t("COMMON.NOT_AVAILABLE")}
					</span>
				);
			} else {
				lastCellContent = (
					<span data-testid="TransactionRow__currency" className="whitespace-nowrap">
						<TransactionRowAmount transaction={transaction} exchangeCurrency={exchangeCurrency} />
					</span>
				);
			}
		}

		return (
			<TableRow onClick={onClick} className={cn("group", className)} {...properties}>
				{showExplorerLink && (
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
				)}

				<TableCell
					variant={showExplorerLink ? "middle" : "start"}
					innerClassName="text-theme-secondary-text"
					isCompact={isCompact}
				>
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
					/>
				</TableCell>

				<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end" isCompact={isCompact}>
					{lastCellContent}
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
