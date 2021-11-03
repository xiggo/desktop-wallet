import { Contracts } from "@payvo/profiles";

export interface Option {
	label: string;
	value: string | number;
}

export interface ContactListItemProperties {
	item: any;
	options?: Option[];
	useTestNetworks: boolean;
	onAction?: (action: Option, address: any) => void;
	onSend?: (address: Contracts.IContactAddress) => void;
}
