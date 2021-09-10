import { Contracts } from "@payvo/profiles";
import { Networks } from "@payvo/sdk";
import { Icon } from "app/components/Icon";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { Tooltip } from "app/components/Tooltip";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { VoteDelegateProperties } from "./DelegateTable.models";

interface DelegateTableColumnsProperties {
	network: Networks.Network;
	isLoading?: boolean;
}

export const useDelegateTableColumns = ({ network, isLoading }: DelegateTableColumnsProperties) => {
	const { t } = useTranslation();

	return useMemo<TableColumn[]>(() => {
		const columnName: TableColumn = {
			Header: t("VOTE.DELEGATE_TABLE.NAME"),
			accessor: (delegate: Contracts.IReadOnlyWallet) => isLoading || delegate.username(),
			className: "justify-start",
		};

		const columnExplorer: TableColumn = {
			Header: t("COMMON.EXPLORER"),
			accessor: (delegate: Contracts.IReadOnlyWallet) => isLoading || delegate.explorerLink(),
			className: "justify-center",
			disableSortBy: true,
		};

		const columnVoteAmount: TableColumn = {
			Header: (
				<div className="flex items-center space-x-3 px-3">
					<p>{t("VOTE.DELEGATE_TABLE.VOTE_AMOUNT.TITLE")}</p>
					<Tooltip content={t("VOTE.DELEGATE_TABLE.VOTE_AMOUNT.TOOLTIP", { coinId: network.coin() })}>
						<span className="p-1 bg-theme-primary-100 text-theme-primary-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 rounded-full">
							<Icon name="QuestionMarkSmall" size="sm" />
						</span>
					</Tooltip>
				</div>
			),
			accessor: "voteAmount",
			className: "justify-end",
			disableSortBy: true,
		};

		const columnVote: TableColumn = {
			Header: t("VOTE.DELEGATE_TABLE.VOTE"),
			accessor: "onSelect",
			className: "justify-end",
			disableSortBy: true,
		};

		return [columnName, columnExplorer, network.votesAmountMinimum() > 0 && columnVoteAmount, columnVote].filter(
			Boolean,
		) as TableColumn[];
	}, [t, network, isLoading]);
};

export const delegateExistsInVotes = (
	votes: VoteDelegateProperties[],
	address: string,
): VoteDelegateProperties | undefined => votes.find(({ delegateAddress }) => delegateAddress === address);
