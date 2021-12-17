import { Contracts } from "@payvo/sdk-profiles";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

export interface WalletListItemSkeletonProperties {
	isCompact: boolean;
}

export interface WalletListItemProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
}

export interface WalletCellProperties {
	wallet: Contracts.IReadWriteWallet;
	handleToggleStar: ReturnType<typeof useWalletActions>["handleToggleStar"];
	isCompact: boolean;
}

export interface InfoCellProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
}

export interface BalanceCellProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	isSynced: boolean;
}

export interface CurrencyCellProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	isSynced: boolean;
}

export interface ButtonsCellProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	handleSend: ReturnType<typeof useWalletActions>["handleSend"];
	handleSelectOption: ReturnType<typeof useWalletActions>["handleSelectOption"];
}
