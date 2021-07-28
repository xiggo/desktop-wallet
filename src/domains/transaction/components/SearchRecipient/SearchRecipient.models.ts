export interface RecipientProperties {
	id: string;
	address: string;
	alias?: string;
	network?: string;
	avatar: string;
	type: string;
}

export interface RecipientListItemProperties {
	recipient: RecipientProperties;
	onAction: (address: string) => void;
	selectedAddress: string | undefined;
}

export interface SearchRecipientProperties {
	title?: string;
	description?: string;
	isOpen: boolean;
	onClose?: () => void;
	onAction: (address: string) => void;
	recipients: RecipientProperties[];
	selectedAddress: string | undefined;
}
