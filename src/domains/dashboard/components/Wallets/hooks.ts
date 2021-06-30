import { Contracts } from "@arkecosystem/platform-sdk-profiles";
import { chunk } from "@arkecosystem/utils";
import { useMemo } from "react";

import { GridWallet, UseWalletDisplayProperties } from ".";

export const useWalletDisplay = ({
	wallets = [],
	selectedNetworkIds,
	displayType = "all",
	viewMore = false,
	listPagerLimit = 10,
}: UseWalletDisplayProperties) => {
	const sliderOptions = {
		slideHeight: 192,
		slidesPerColumn: 2,
		slidesPerGroup: 3,
		slidesPerView: 3,
		spaceBetween: 18,
	};

	const { listWallets, gridWallets, listHasMore } = useMemo(() => {
		const listWallets = wallets
			.filter((wallet: any) => {
				if (displayType === "starred") {
					return wallet.isStarred();
				}
				if (displayType === "ledger") {
					return wallet.isLedger();
				}
				return wallet && !wallet.isBlank && selectedNetworkIds?.includes(wallet.network().id());
			})
			.map((wallet) => ({ wallet }));

		const loadGridWallets = () => {
			const walletObjects = wallets
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
				.map((wallet: Contracts.IReadWriteWallet) => ({ wallet }));

			if (walletObjects.length <= sliderOptions.slidesPerView) {
				return walletObjects.concat(
					new Array(sliderOptions.slidesPerView - walletObjects.length).fill({ displayType, isBlank: true }),
				);
			}

			const walletsPerPage = sliderOptions.slidesPerView * 2;
			const desiredLength = Math.ceil(walletObjects.length / walletsPerPage) * walletsPerPage;

			walletObjects.push(...new Array(desiredLength - walletObjects.length).fill({ displayType, isBlank: true }));

			const result: GridWallet[] = [];

			for (const page of chunk(walletObjects, walletsPerPage)) {
				const firstHalf = page.slice(0, walletsPerPage / 2);
				const secondHalf = page.slice(walletsPerPage / 2, page.length);

				for (const [index, element] of firstHalf.entries()) {
					result.push(element, secondHalf[index]);
				}
			}

			return result;
		};

		return {
			gridWallets: loadGridWallets(),
			listHasMore: wallets.length > 0 && listWallets.length > listPagerLimit && !viewMore,
			listWallets: viewMore ? listWallets : listWallets.slice(0, listPagerLimit),
		};
	}, [wallets, selectedNetworkIds, displayType, viewMore, sliderOptions.slidesPerView, listPagerLimit]);

	return { gridWallets, listHasMore, listWallets, sliderOptions };
};
