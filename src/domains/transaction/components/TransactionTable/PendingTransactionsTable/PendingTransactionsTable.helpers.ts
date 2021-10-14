import { TableColumn } from "app/components/Table/TableColumn.models";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const usePendingTransactionTableColumns = ({ showMemoColumn }: { showMemoColumn: boolean }): TableColumn[] => {
	const { t } = useTranslation();

	return useMemo<TableColumn[]>(() => {
		const columnId: TableColumn = {
			Header: t("COMMON.ID"),
			minimumWidth: true,
		};

		const columnDate: TableColumn = {
			Header: t("COMMON.DATE"),
			accessor: "timestamp",
			cellWidth: "w-50",
			sortDescFirst: true,
		};

		const columnRecipient: TableColumn = {
			Header: t("COMMON.RECIPIENT"),
			cellWidth: "w-96",
		};

		const columnMemo: TableColumn = {
			Header: t("COMMON.MEMO"),
			cellWidth: "w-24",
			className: "justify-center",
		};

		const columnStatus: TableColumn = {
			Header: t("COMMON.STATUS"),
			cellWidth: "w-20",
			className: "justify-center",
		};

		const columnAmount: TableColumn = {
			Header: t("COMMON.AMOUNT"),
			accessor: "amount",
			className: "justify-end",
		};

		const columnSign: TableColumn = {
			Header: t("COMMON.SIGN"),
			cellWidth: "w-24",
			className: "hidden no-border",
		};

		return [
			columnId,
			columnDate,
			columnRecipient,
			showMemoColumn && columnMemo,
			columnStatus,
			columnAmount,
			columnSign,
		].filter(Boolean) as TableColumn[];
	}, [t, showMemoColumn]);
};

export { usePendingTransactionTableColumns };
