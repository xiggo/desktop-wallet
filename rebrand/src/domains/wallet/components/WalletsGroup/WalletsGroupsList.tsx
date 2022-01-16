import React, { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Link } from "@/app/components/Link";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { WalletsGroup } from "@/domains/wallet/components/WalletsGroup/WalletsGroup";
import { WalletGroupWrapper } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.blocks";
import { WalletsGroupHeaderSkeleton } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { useDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets";

export const WalletsGroupsList: React.VFC = () => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const { profileIsSyncing } = useConfiguration();
	const { availableWallets, filteredWalletsGroupedByNetwork, hasWalletsMatchingOtherNetworks } = useDisplayWallets();
	const { walletsDisplayType } = useWalletFilters({ profile });
	const isRestored = profile.status().isRestored();

	const balanceMaxWidthReference = useRef(0);
	const currencyMaxWidthReference = useRef(0);

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

		const createLink = <Link to={`/profiles/${profile.id()}/wallets/create`}>{t("COMMON.CREATE")}</Link>;
		const importLink = <Link to={`/profiles/${profile.id()}/wallets/import`}>{t("COMMON.IMPORT")}</Link>;
		return (
			<Trans i18nKey={"DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE"}>
				Your portfolio is currently empty. {createLink} or {importLink} a wallet to get started.
			</Trans>
		);
	};

	return (
		<div data-testid="NetworkWalletsGroupList">
			{profileIsSyncing && availableWallets.length === 0 && (
				<WalletGroupWrapper>
					<WalletsGroupHeaderSkeleton />
				</WalletGroupWrapper>
			)}
			{isRestored && filteredWalletsGroupedByNetwork.length === 0 && (
				<>
					<EmptyBlock className={"mb-3"}>{emptyBlockContent()}</EmptyBlock>
					<WalletGroupWrapper isInactive>
						<WalletsGroupHeaderSkeleton isPlaceholder />
					</WalletGroupWrapper>
				</>
			)}
			{isRestored &&
				(!profileIsSyncing || availableWallets.length > 0) &&
				filteredWalletsGroupedByNetwork.map(([network, wallets]) => (
					<WalletsGroup
						key={network.id()}
						network={network}
						wallets={wallets}
						maxWidthReferences={{ balance: balanceMaxWidthReference, currency: currencyMaxWidthReference }}
					/>
				))}
		</div>
	);
};
