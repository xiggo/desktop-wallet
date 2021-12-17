import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Button } from "@/app/components/Button";
import { useActiveProfile } from "@/app/hooks";
import { WalletGroupWrapper } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.blocks";
import { WalletsGroupProperties } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { WalletsGroupHeader } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { WalletsList } from "@/domains/wallet/components/WalletsList";

const MAX_WALLETS_ON_DASHBOARD_LIST = 10;

export const WalletsGroup: React.VFC<WalletsGroupProperties> = ({ network, wallets, maxWidthReferences }) => {
	const { t } = useTranslation();
	const history = useHistory();
	const profile = useActiveProfile();

	const [isExpanded, setIsExpanded] = useState(false);
	const slicedWallets = useMemo(() => wallets.slice(0, MAX_WALLETS_ON_DASHBOARD_LIST), [wallets]);

	const goToCoinWallets = useCallback(() => {
		history.push(`/profiles/${profile.id()}/network/${network.id()}`);
	}, [history, network, profile]);

	const toggleWalletsPanel = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			setIsExpanded(!isExpanded);
		},
		[isExpanded],
	);

	return (
		<WalletGroupWrapper data-testid="WalletsGroup" isCollapsed={!isExpanded}>
			<WalletsGroupHeader
				network={network}
				wallets={wallets}
				toggleWalletsPanel={toggleWalletsPanel}
				isWalletsExpanded={isExpanded}
				maxWidthReferences={maxWidthReferences}
			/>
			{isExpanded && <WalletsList wallets={slicedWallets} />}
			{isExpanded && wallets.length > MAX_WALLETS_ON_DASHBOARD_LIST && (
				<Button
					variant="secondary"
					className="mx-4 mb-4"
					data-testid="WalletsList__ShowAll"
					onClick={goToCoinWallets}
				>
					{`${t("COMMON.SHOW_ALL")} (${wallets.length})`}
				</Button>
			)}
		</WalletGroupWrapper>
	);
};
