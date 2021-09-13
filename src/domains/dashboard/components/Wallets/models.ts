import { Contracts } from "@payvo/profiles";

export interface GridWallet {
	isBlank?: boolean;
	wallet?: Contracts.IReadWriteWallet;
}

export interface WalletGridProperties {
	isVisible?: boolean;
	isLoading?: boolean;
	sliderOptions?: Record<string, any>;
	wallets: GridWallet[];
	onWalletAction?: any;
}

export interface WalletListProperties {
	hasWalletsMatchingOtherNetworks: boolean;
	hasMore?: boolean;
	isLoading?: boolean;
	isVisible?: boolean;
	onRowClick?: (walletId: string) => void;
	onViewMore?: any;
	wallets: GridWallet[];
	walletsDisplayType?: string;
	isCompact?: boolean;
}

export interface UseWalletDisplayProperties {
	wallets?: Contracts.IReadWriteWallet[];
	selectedNetworkIds?: string[];
	displayType?: string;
	viewMore?: boolean;
	listPagerLimit?: number;
}
