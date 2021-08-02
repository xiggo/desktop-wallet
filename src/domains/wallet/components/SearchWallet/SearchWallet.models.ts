import { Contracts } from "@payvo/profiles";
import { Networks } from "@payvo/sdk";
import { Size } from "types";

export interface SelectedWallet {
	address: string;
	network: Networks.Network;
	name?: string;
}

export interface SearchWalletListItemProperties {
	address: string;
	balance: number;
	convertedBalance: number;
	currency: string;
	disabled?: boolean;
	exchangeCurrency: string;
	index: number;
	name?: string;
	network: Networks.Network;
	showConvertedValue?: boolean;
	showNetwork?: boolean;
	onAction: (wallet: SelectedWallet) => void;
	selectedAddress?: string;
}

export interface SearchWalletProperties {
	isOpen: boolean;
	title: string;
	description?: string;
	disableAction?: (wallet: Contracts.IReadWriteWallet) => boolean;
	wallets: Contracts.IReadWriteWallet[];
	searchPlaceholder?: string;
	size?: Size;
	showConvertedValue?: boolean;
	showNetwork?: boolean;
	onClose?: any;
	onSelectWallet: (wallet: SelectedWallet) => void;
	profile?: Contracts.IProfile;
	selectedAddress?: string;
}
