import { Contracts } from "@payvo/profiles";
import { EmptyBlock } from "app/components/EmptyBlock";
import { Table } from "app/components/Table";
import React from "react";
import { useTranslation } from "react-i18next";

import { ExchangeTransactionsRow } from "./ExchangeTransactionsRow";

interface ExchangeTransactionsTableProperties {
	exchangeTransactions: Contracts.IExchangeTransaction[];
	isCompact: boolean;
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}

export const ExchangeTransactionsTable = ({
	exchangeTransactions,
	isCompact,
	onClick,
	onRemove,
}: ExchangeTransactionsTableProperties) => {
	const { t } = useTranslation();

	const initialState = {
		sortBy: [
			{
				desc: true,
				id: "createdAt",
			},
		],
	};

	const columns = [
		{
			Header: t("COMMON.ID"),
			minimumWidth: true,
		},
		{
			Header: t("COMMON.EXCHANGE"),
			accessor: "provider",
		},
		{
			Header: t("COMMON.DATE"),
			accessor: "createdAt",
		},
		{
			Header: t("COMMON.FROM"),
			accessor: (exchangeTransaction: Contracts.IExchangeTransaction) => exchangeTransaction.input().ticker,
		},
		{
			Header: t("COMMON.TO"),
			accessor: (exchangeTransaction: Contracts.IExchangeTransaction) => exchangeTransaction.output().ticker,
		},
		{
			Header: t("COMMON.STATUS"),
			cellWidth: "w-24",
			className: "justify-center",
		},
		{
			Header: "Actions",
			className: "hidden no-border",
			minimumWidth: true,
		},
	];

	if (exchangeTransactions.length === 0) {
		return (
			<EmptyBlock data-testid="ExchangeTransactionsTable__empty-message">
				{t("EXCHANGE.EMPTY_MESSAGE")}
			</EmptyBlock>
		);
	}

	return (
		<div data-testid="ExchangeTransactionsTable">
			<Table columns={columns} data={exchangeTransactions} initialState={initialState}>
				{(exchangeTransaction: Contracts.IExchangeTransaction) => (
					<ExchangeTransactionsRow
						exchangeTransaction={exchangeTransaction}
						isCompact={isCompact}
						onClick={onClick}
						onRemove={onRemove}
					/>
				)}
			</Table>
		</div>
	);
};
