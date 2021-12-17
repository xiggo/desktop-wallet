import React, { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Page } from "@/app/components/Layout";
import { Pagination } from "@/app/components/Pagination";
import { WalletGroupWrapper } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.blocks";
import { WalletsGroupHeader } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { WalletsList } from "@/domains/wallet/components/WalletsList/WalletsList";
import { useDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets";

const MAX_WALLETS_ON_SINGLE_PAGE_LIST = 15;

export const WalletGroupPage: React.VFC = () => {
	const history = useHistory();
	const { networkId } = useParams<{ networkId: string }>();
	const { walletsGroupedByNetwork, availableNetworks } = useDisplayWallets();

	const [paginationPage, setPaginationPage] = useState(1);

	const network = useMemo(
		() => availableNetworks.find((network) => network.id() === networkId),
		[availableNetworks, networkId],
	);

	const wallets = useMemo(
		() => (network && walletsGroupedByNetwork.get(network)) ?? [],
		[walletsGroupedByNetwork, network],
	);
	const paginatedWallets = useMemo(() => {
		const startIndex = MAX_WALLETS_ON_SINGLE_PAGE_LIST * (paginationPage - 1);
		return wallets.slice(startIndex, startIndex + MAX_WALLETS_ON_SINGLE_PAGE_LIST);
	}, [wallets, paginationPage]);

	if (!networkId || !network) {
		history.push("/");
		return <></>;
	}

	return (
		<Page>
			<div className={"mb-4 mx-20 mt-8"} data-testid={"WalletGroup__Page"}>
				<WalletGroupWrapper data-testid="WalletsGroup_Header">
					<WalletsGroupHeader
						network={network}
						wallets={wallets}
						isSinglePageMode={true}
						isWalletsExpanded={false}
					/>
				</WalletGroupWrapper>
				<WalletsList wallets={paginatedWallets} />
				<Pagination
					className={"flex justify-center"}
					totalCount={wallets.length}
					itemsPerPage={MAX_WALLETS_ON_SINGLE_PAGE_LIST}
					onSelectPage={setPaginationPage}
					currentPage={paginationPage}
				/>
			</div>
		</Page>
	);
};
