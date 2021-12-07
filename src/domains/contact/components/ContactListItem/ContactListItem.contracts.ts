import { Contracts } from "@payvo/sdk-profiles";

export interface ContactListItemOption {
	label: string;
	value: string | number;
}

export interface ContactListItemProperties {
	item: Contracts.IContact;
	options: ContactListItemOption[];
	useTestNetworks: boolean;
	onAction: (action: ContactListItemOption, address: string) => void;
	onSend: (address: Contracts.IContactAddress) => void;
}
