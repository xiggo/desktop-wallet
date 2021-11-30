import { DTO } from "@payvo/sdk-profiles";

export interface BaseTransactionRowModeProperties {
	type: string;
	isSent: boolean;
	isReturn?: boolean;
	address: string;
	isCompact: boolean;
}

export interface TransactionRowModeProperties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	transactionType?: string;
	address?: string;
	isCompact: boolean;
}
