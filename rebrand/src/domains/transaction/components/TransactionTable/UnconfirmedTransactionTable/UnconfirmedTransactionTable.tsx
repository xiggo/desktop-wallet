import { Contracts, DTO } from "@payvo/sdk-profiles";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { UnconfirmedTransactionRow } from "./UnconfirmedTransactionRow";
import { Table } from "@/app/components/Table";

interface Properties {
	transactions: DTO.ExtendedConfirmedTransactionData[];
	profile: Contracts.IProfile;
}

export const UnconfirmedTransactionTable = memo(({ transactions, profile }: Properties) => {
	const { t } = useTranslation();

	const columns: Column<DTO.ExtendedConfirmedTransactionData>[] = [
		{
			Header: t("COMMON.DATE"),
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			accessor: (transaction) => transaction.timestamp?.()?.toUNIX(),
			sortDescFirst: true,
		},
		{
			Header: t("COMMON.RECIPIENT"),
			cellWidth: "w-96",
		},
		{
			Header: t("COMMON.AMOUNT"),
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			accessor: (transaction) => transaction.total?.(),
			className: "justify-end",
		},
	];

	return (
		<div data-testid="TransactionTable" className="relative">
			<Table columns={columns} data={transactions}>
				{(row: DTO.ExtendedConfirmedTransactionData) => (
					<UnconfirmedTransactionRow transaction={row} profile={profile} />
				)}
			</Table>
		</div>
	);
});
