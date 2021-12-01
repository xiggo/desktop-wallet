import React, { useCallback, useMemo, useState, VFC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Column } from "react-table";

import { Button } from "@/app/components/Button";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Table } from "@/app/components/Table";
import { WalletListItem } from "@/app/components/WalletListItem";
import { WalletListItemSkeleton } from "@/app/components/WalletListItem/WalletListItemSkeleton";

import { GridWallet, WalletListProperties } from "./Wallets.contracts";

export const WalletsList: VFC<WalletListProperties> = ({
	hasWalletsMatchingOtherNetworks,
	isLoading = false,
	isVisible = true,
	onRowClick,
	wallets,
	walletsDisplayType = "all",
	isCompact = false,
	walletsPerPage,
}) => {
	const [viewMore, setViewMore] = useState(false);
	const hasMoreWallets = useMemo(
		() => wallets.length > walletsPerPage && !viewMore,
		[walletsPerPage, viewMore, wallets.length],
	);

	const { t } = useTranslation();

	const columns: Column<GridWallet>[] = [
		{
			Header: t("COMMON.WALLET_ADDRESS"),
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			accessor: ({ wallet }) => wallet?.alias() || wallet?.address(),
		},
		{
			Header: t("COMMON.WALLET_TYPE"),
			cellWidth: "w-40",
			className: "justify-center",
		},
		{
			Header: t("COMMON.BALANCE"),
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			accessor: ({ wallet }) => wallet?.balance?.(),
			cellWidth: "w-72",
			className: "flex-row-reverse justify-end",
		},
		{
			Header: t("COMMON.CURRENCY"),
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			accessor: ({ wallet }) => wallet?.convertedBalance?.(),
			cellWidth: "w-44",
			className: "flex-row-reverse justify-end",
		},
	];

	const tableRows = useMemo<GridWallet[]>(() => {
		if (!isLoading) {
			return wallets;
		}

		const skeletonRowsCount = () => {
			if (hasMoreWallets) {
				return walletsPerPage;
			}

			if (wallets.length > 0) {
				return wallets.length;
			}

			return 3;
		};

		return Array.from<GridWallet>({ length: skeletonRowsCount() }).fill({} as GridWallet);
	}, [hasMoreWallets, walletsPerPage, wallets, isLoading]);

	const emptyBlockContent = () => {
		if (walletsDisplayType !== "all") {
			return (
				<Trans
					i18nKey={
						hasWalletsMatchingOtherNetworks
							? "DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE_FILTERED"
							: "DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE"
					}
					values={{
						type: walletsDisplayType === "starred" ? t("COMMON.STARRED") : t("COMMON.LEDGER"),
					}}
					components={{ bold: <strong /> }}
				/>
			);
		}

		if (hasWalletsMatchingOtherNetworks) {
			return t("DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE_FILTERED");
		}

		return t("DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE");
	};

	const renderTableRow = useCallback(
		(rowData: GridWallet) =>
			isLoading ? (
				<WalletListItemSkeleton isCompact={isCompact} />
			) : (
				<WalletListItem {...rowData} onClick={onRowClick} isCompact={isCompact} />
			),
		[isLoading, isCompact, onRowClick],
	);

	if (!isVisible) {
		return <></>;
	}

	return (
		<div data-testid="WalletsList">
			{(wallets.length > 0 || isLoading) && (
				<div data-testid="WalletTable">
					<Table columns={columns} data={tableRows} rowsPerPage={viewMore ? undefined : walletsPerPage}>
						{renderTableRow}
					</Table>

					{hasMoreWallets && (
						<Button
							variant="secondary"
							className="mt-10 mb-5 w-full"
							data-testid="WalletsList__ViewMore"
							onClick={() => setViewMore(true)}
						>
							{t("COMMON.VIEW_MORE")}
						</Button>
					)}
				</div>
			)}

			{!isLoading && !hasMoreWallets && wallets.length === 0 && <EmptyBlock>{emptyBlockContent()}</EmptyBlock>}
		</div>
	);
};
