import { Contracts } from "@payvo/profiles";
import { Table } from "app/components/Table";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { NetworkIcon } from "domains/network/components/NetworkIcon";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AddressRow } from "./AddressRow";

interface AddressTableProperties {
	wallets: Contracts.IReadWriteWallet[];
	onSelect?: (address: string) => void;
	isCompact?: boolean;
}

export const AddressTable = ({ wallets, onSelect, isCompact = false }: AddressTableProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => wallets[0], [wallets]);
	const maxVotes = wallet.network().maximumVotesPerWallet();

	const commonColumns = [
		{
			Header: t("COMMON.MY_ADDRESS"),
			accessor: (wallet: Contracts.IReadWriteWallet) => wallet.alias() || wallet.address(),
			cellWidth: "w-80",
		},
		{
			Header: t("COMMON.WALLET_TYPE"),
			accessor: "wallet-type",
			className: "justify-center",
			disableSortBy: true,
		},
		{
			Header: t("COMMON.BALANCE"),
			accessor: (wallet: Contracts.IReadWriteWallet) => wallet.balance?.().toFixed(0),
			className: "justify-end",
		},
		{
			Header: maxVotes === 1 ? t("COMMON.DELEGATE") : t("COMMON.DELEGATES"),
			accessor: "delegate",
			className: maxVotes === 1 ? "ml-15" : "",
			disableSortBy: true,
		},
	];

	const columns: TableColumn[] = useMemo(() => {
		if (maxVotes === 1) {
			return [
				...commonColumns,
				{
					Header: t("COMMON.RANK"),
					accessor: "rank",
					className: "justify-center",
					disableSortBy: true,
				},
				{
					Header: t("COMMON.STATUS"),
					accessor: "status",
					className: "justify-center no-border",
					disableSortBy: true,
				},
				{
					accessor: "onSelect",
					disableSortBy: true,
				},
			];
		}

		return [
			...commonColumns,
			{
				Header: t("COMMON.VOTES"),
				accessor: "votes",
				className: "no-border",
				disableSortBy: true,
			},
			{
				accessor: "onSelect",
				disableSortBy: true,
			},
		];
	}, [commonColumns, maxVotes, t]);

	return (
		<div data-testid="AddressTable">
			<div className="flex items-center py-5 space-x-4">
				<NetworkIcon size="lg" network={wallet.network()} />
				<div className="flex">
					<h2 className="mb-0 text-2xl font-bold">{wallet.network().displayName()}</h2>
					<span className="ml-2 text-2xl font-bold text-theme-secondary-500 dark:text-theme-secondary-700">
						{wallets.length}
					</span>
				</div>
			</div>

			<Table columns={columns} data={wallets}>
				{(wallet: Contracts.IReadWriteWallet, index: number) => (
					<AddressRow
						index={index}
						maxVotes={maxVotes}
						wallet={wallet}
						onSelect={onSelect}
						isCompact={isCompact}
					/>
				)}
			</Table>
		</div>
	);
};

AddressTable.defaultProps = {
	wallets: [],
};
