import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { UseDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets.contracts";

const groupWalletsByNetwork = (
	wallets: Contracts.IReadWriteWallet[],
): Map<Networks.Network, Contracts.IReadWriteWallet[]> => {
	const walletsByNetwork = new Map<Networks.Network, Contracts.IReadWriteWallet[]>();

	for (const wallet of wallets) {
		walletsByNetwork.set(wallet.network(), [...(walletsByNetwork.get(wallet.network()) ?? []), wallet]);
	}

	return walletsByNetwork;
};

export const useDisplayWallets: UseDisplayWallets = () => {
	const profile = useActiveProfile();

	const isRestored = profile.status().isRestored();
	const walletsCount = profile.wallets().count();
	const { walletsDisplayType, selectedNetworkIds } = useWalletFilters({ profile });

	const wallets = useMemo(
		() =>
			profile
				.wallets()
				.valuesWithCoin()
				.sort(
					(a, b) =>
						a.network().coinName().localeCompare(b.network().coinName()) ||
						Number(a.network().isTest()) - Number(b.network().isTest()) ||
						Number(b.isStarred()) - Number(a.isStarred()) ||
						(a.alias() ?? "").localeCompare(b.alias() ?? ""),
				),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[profile, isRestored, walletsCount],
	);

	const filteredByDisplayType = useMemo(
		() =>
			wallets.filter(
				(wallet) =>
					(walletsDisplayType === "starred" && wallet.isStarred()) ||
					(walletsDisplayType === "ledger" && wallet.isLedger()) ||
					walletsDisplayType === "all",
			),
		[walletsDisplayType, wallets],
	);

	const groupedByNetwork = useMemo(() => groupWalletsByNetwork(wallets), [wallets]);

	const availableNetworks = useMemo(() => [...groupedByNetwork.keys()], [groupedByNetwork]);

	const filteredGroupedByNetwork = useMemo(() => {
		const filteredByDisplayTypeAndNetwork = filteredByDisplayType.filter((wallet) =>
			selectedNetworkIds.includes(wallet.network().id()),
		);
		return [...groupWalletsByNetwork(filteredByDisplayTypeAndNetwork).entries()];
	}, [filteredByDisplayType, selectedNetworkIds]);

	const hasMatchingOtherNetworks = useMemo(
		() => filteredByDisplayType.some((wallet) => !selectedNetworkIds.includes(wallet.network().id())),
		[filteredByDisplayType, selectedNetworkIds],
	);

	return {
		availableNetworks,
		availableWallets: wallets,
		filteredWalletsGroupedByNetwork: filteredGroupedByNetwork,
		hasWalletsMatchingOtherNetworks: hasMatchingOtherNetworks,
		walletsGroupedByNetwork: groupedByNetwork,
	};
};
