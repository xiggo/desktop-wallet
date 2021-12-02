import { Contracts } from "@payvo/sdk-profiles";

import { DropdownOption } from "@/app/components/Dropdown";

export interface WalletsProperties {
	title?: string;
	onCreateWallet?: () => void;
	onImportWallet?: () => void;
	onImportLedgerWallet?: () => void;
	listPagerLimit?: number;
	walletsCount?: number;
	isLoading?: boolean;
}

export interface WrappedWallet {
	isBlank?: boolean;
	displayType?: string;
	wallet?: Contracts.IReadWriteWallet;
}

export interface WalletGridProperties {
	actions?: DropdownOption[];
	isVisible?: boolean;
	isLoading?: boolean;
	sliderOptions?: Record<string, any>;
	wallets: WrappedWallet[];
	onWalletAction?: (action: string, wallet: Contracts.IReadWriteWallet) => void;
}

export interface WalletListProperties {
	hasWalletsMatchingOtherNetworks: boolean;
	isLoading?: boolean;
	isVisible?: boolean;
	onRowClick?: (walletId: string) => void;
	wallets: WrappedWallet[];
	walletsDisplayType?: string;
	isCompact?: boolean;
	walletsPerPage: number;
}

export interface UseWalletDisplayProperties {
	wallets?: Contracts.IReadWriteWallet[];
	selectedNetworkIds?: string[];
	displayType?: string;
}
