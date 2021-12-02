import { chunk } from "@payvo/sdk-helpers";
import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";

import { UseWalletDisplayProperties, WrappedWallet } from "./Wallets.contracts";

export const useWalletDisplay = ({
	wallets = [],
	selectedNetworkIds,
	displayType = "all",
}: UseWalletDisplayProperties) => {
	const sliderOptions = {
		slideHeight: 192,
		slidesPerColumn: 2,
		slidesPerGroup: 3,
		slidesPerView: 3,
		spaceBetween: 18,
	};

	const { listWallets, gridWallets, hasWalletsMatchingOtherNetworks } = useMemo(() => {
		const listWallets = wallets
			.filter((wallet: Contracts.IReadWriteWallet) => {
				if (!selectedNetworkIds?.includes(wallet.network().id())) {
					return false;
				}

				if (displayType === "starred") {
					return wallet.isStarred();
				}

				if (displayType === "ledger") {
					return wallet.isLedger();
				}

				return wallet;
			})
			.map((wallet) => ({ wallet }));

		const loadGridWallets = () => {
			const walletObjects: WrappedWallet[] = [...listWallets];

			if (walletObjects.length <= sliderOptions.slidesPerView) {
				return [
					...walletObjects,
					...Array.from({ length: sliderOptions.slidesPerView - walletObjects.length }, () => ({
						displayType,
						isBlank: true,
					})),
				] as WrappedWallet[];
			}

			const walletsPerPage = sliderOptions.slidesPerView * 2;
			const desiredLength = Math.ceil(walletObjects.length / walletsPerPage) * walletsPerPage;

			walletObjects.push(
				...Array.from({ length: desiredLength - walletObjects.length }, () => ({ displayType, isBlank: true })),
			);

			const result: WrappedWallet[] = [];

			for (const page of chunk(walletObjects, walletsPerPage)) {
				const firstHalf = page.slice(0, walletsPerPage / 2);
				const secondHalf = page.slice(walletsPerPage / 2, page.length);

				for (const [index, element] of firstHalf.entries()) {
					result.push(element, secondHalf[index]);
				}
			}

			return result;
		};

		const hasWalletsMatchingOtherNetworks = wallets
			.filter((wallet) => {
				if (displayType === "starred") {
					return wallet.isStarred();
				}

				if (displayType === "ledger") {
					return wallet.isLedger();
				}

				return true;
			})
			.some((wallet) => !selectedNetworkIds?.includes(wallet.network().id()));

		return {
			gridWallets: loadGridWallets(),
			hasWalletsMatchingOtherNetworks,
			listWallets,
		};
	}, [wallets, selectedNetworkIds, displayType, sliderOptions.slidesPerView]);

	return { gridWallets, hasWalletsMatchingOtherNetworks, listWallets, sliderOptions };
};
