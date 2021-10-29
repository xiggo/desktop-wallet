import { Contracts } from "@payvo/profiles";
import { Table } from "app/components/Table";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { NetworkIcon } from "domains/network/components/NetworkIcon";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AddressRow } from "./AddressRow";

interface AddressTableProperties {
	wallets: Contracts.IReadWriteWallet[];
	onSelect?: (address: string, network: string) => void;
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
			cellWidth: "w-30",
			className: "justify-center",
			disableSortBy: true,
		},
		{
			Header: t("COMMON.BALANCE"),
			accessor: (wallet: Contracts.IReadWriteWallet) => wallet.balance?.(),
			cellWidth: "w-60",
			className: "justify-end",
		},
		{
			Header: maxVotes === 1 ? t("COMMON.DELEGATE") : t("COMMON.DELEGATES"),
			accessor: (wallet: Contracts.IReadWriteWallet) => {
				let votes: Contracts.VoteRegistryItem[];

				try {
					votes = wallet.voting().current();
				} catch {
					votes = [];
				}

				const [first] = votes;

				return first?.wallet?.username();
			},
			cellWidth: "w-60",
			className: maxVotes === 1 ? "ml-15" : "",
		},
	];

	const columns: TableColumn[] = useMemo(() => {
		if (maxVotes === 1) {
			return [
				...commonColumns,
				{
					Header: t("COMMON.RANK"),
					accessor: "rank",
					cellWidth: "w-20",
					className: "justify-center",
					disableSortBy: true,
				},
				{
					Header: t("COMMON.STATUS"),
					accessor: "status",
					cellWidth: "w-20",
					className: "justify-center",
					disableSortBy: true,
				},
				{
					accessor: "onSelect",
					className: "no-border",
					disableSortBy: true,
				},
			];
		}

		return [
			...commonColumns,
			{
				Header: t("COMMON.VOTES"),
				accessor: "votes",
				cellWidth: "w-20",
				className: "justify-center",
				disableSortBy: true,
			},
			{
				accessor: "onSelect",
				className: "no-border",
				disableSortBy: true,
			},
		];
	}, [commonColumns, maxVotes, t]);

	return (
		<div data-testid="AddressTable">
			<div className="flex items-center py-5 space-x-4">
				<NetworkIcon size="lg" network={wallet.network()} />
				<div className="flex space-x-2">
					<h2 className="mb-0 text-lg font-bold">{wallet.network().displayName()}</h2>
					<span className="text-lg font-bold text-theme-secondary-500 dark:text-theme-secondary-700">
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
