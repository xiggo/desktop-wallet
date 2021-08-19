import { DTO } from "@payvo/profiles";
import { Table } from "app/components/Table";
import { useColumns } from "domains/transaction/components/TransactionTable/TransactionTable.helpers";
import React, { memo, useMemo } from "react";

import { TransactionRow } from "./TransactionRow/TransactionRow";

type Skeleton = Record<string, unknown>;

interface Properties {
	transactions: DTO.ExtendedConfirmedTransactionData[];
	exchangeCurrency?: string;
	showMemoColumn?: boolean;
	hideHeader?: boolean;
	isCompact?: boolean;
	onRowClick?: (row: DTO.ExtendedConfirmedTransactionData) => void;
	isLoading?: boolean;
	skeletonRowsLimit?: number;
}

export const TransactionTable = memo(
	({
		transactions,
		exchangeCurrency,
		showMemoColumn = false,
		isCompact = false,
		hideHeader = false,
		isLoading = false,
		skeletonRowsLimit = 8,
		onRowClick,
	}: Properties) => {
		const columns = useColumns({ exchangeCurrency, showMemoColumn });

		const initialState = {
			sortBy: [
				{
					desc: true,
					id: "date",
				},
			],
		};

		const showSkeleton = useMemo(() => isLoading && transactions.length === 0, [transactions, isLoading]);

		const data = useMemo(() => {
			const skeletonRows = new Array(skeletonRowsLimit).fill({});
			return showSkeleton ? skeletonRows : transactions;
		}, [showSkeleton, transactions, skeletonRowsLimit]);

		return (
			<div data-testid="TransactionTable" className="relative">
				<Table hideHeader={hideHeader} columns={columns} data={data} initialState={initialState}>
					{(row: DTO.ExtendedConfirmedTransactionData | Skeleton) => (
						<TransactionRow
							isLoading={showSkeleton}
							onClick={() => onRowClick?.(row as DTO.ExtendedConfirmedTransactionData)}
							transaction={row as DTO.ExtendedConfirmedTransactionData}
							exchangeCurrency={exchangeCurrency}
							showMemoColumn={showMemoColumn}
							isCompact={isCompact}
						/>
					)}
				</Table>
			</div>
		);
	},
);

TransactionTable.displayName = "TransactionTable";
