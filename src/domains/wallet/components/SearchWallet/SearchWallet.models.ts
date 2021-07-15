import { Networks } from "@payvo/sdk";

export interface SelectedWallet {
	address: string;
	network: Networks.Network;
	name?: string;
}
