import { Contracts, DTO } from "@payvo/profiles";

export interface TransactionAliases {
	sender: string | undefined;
	recipients: (string | undefined)[];
}

export interface TransactionDetailModalProperties {
	isOpen: boolean;
	transactionItem: DTO.ExtendedConfirmedTransactionData;
	profile?: Contracts.IProfile;
	onClose?: any;
}
