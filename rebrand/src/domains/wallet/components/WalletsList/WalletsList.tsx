import { Contracts } from "@payvo/sdk-profiles";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { Table } from "@/app/components/Table";
import { WalletListItem } from "@/app/components/WalletListItem";
import { WalletListItemSkeleton } from "@/app/components/WalletListItem/WalletListItemSkeleton";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { WalletsListProperties } from "@/domains/wallet/components/WalletsList/WalletsList.contracts";

export const WalletsList: React.VFC<WalletsListProperties> = ({ wallets }) => {
	const profile = useActiveProfile();
	const { t } = useTranslation();
	const { profileIsSyncing } = useConfiguration();
	const isCompact = !profile.appearance().get("useExpandedTables");
	const showSkeletons = profileIsSyncing && wallets.length === 0;

	const columns: Column<Contracts.IReadWriteWallet>[] = useMemo(
		() => [
			{
				Header: t("COMMON.WALLET"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet) => wallet.alias?.() || wallet.address?.(),
			},
			{
				Header: t("COMMON.INFO"),
				cellWidth: "w-36",
				className: "justify-center",
			},
			{
				Header: t("COMMON.BALANCE"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet) => wallet.balance?.(),
				cellWidth: "w-40",
				className: "flex-row-reverse justify-end",
			},
			{
				Header: t("COMMON.CURRENCY"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet) => wallet.convertedBalance?.(),
				cellWidth: "w-32",
				className: "justify-end",
			},
			{
				Header: "Actions",
				className: "hidden no-border",
				minimumWidth: true,
			},
		],
		[t],
	);

	const tableRows = useMemo<Contracts.IReadWriteWallet[]>(() => {
		const skeletonRows = Array.from<Contracts.IReadWriteWallet>({ length: 3 }).fill(
			{} as Contracts.IReadWriteWallet,
		);
		return showSkeletons ? skeletonRows : wallets;
	}, [showSkeletons, wallets]);

	const renderTableRow = useCallback(
		(wallet: Contracts.IReadWriteWallet) =>
			showSkeletons ? (
				<WalletListItemSkeleton isCompact={isCompact} />
			) : (
				<WalletListItem wallet={wallet} isCompact={isCompact} />
			),
		[showSkeletons, isCompact],
	);

	return (
		<div data-testid="WalletsList" className="pt-6 px-4 mb-2">
			{(wallets.length > 0 || showSkeletons) && (
				<div data-testid="WalletTable">
					<Table columns={columns} data={tableRows}>
						{renderTableRow}
					</Table>
				</div>
			)}
		</div>
	);
};
