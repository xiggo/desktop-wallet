type RecipientListLabel = "TRANSACTION.MULTISIGNATURE.PARTICIPANT_#";

export interface RecipientListItem {
	address: string;
	displayAmount?: string;
	amount?: number;
	exchangeAmount?: number;
	exchangeTicker?: string;
	assetSymbol?: string;
	isEditable?: boolean;
	label?: RecipientListLabel;
	listIndex?: number;
	variant?: "condensed";
	alias?: string;
	isDelegate?: boolean;
	showAmount?: boolean;
	tooltipDisabled?: string;
	disableButton?: (address: string) => boolean;
	onRemove?: (index: number) => void;
}

export interface RecipientList {
	network?: string;
	assetSymbol?: string;
	isEditable?: boolean;
	recipients?: RecipientListItem[];
	showAmount?: boolean;
	label?: RecipientListLabel;
	variant?: "condensed";
	tooltipDisabled?: string;
	disableButton?: (address: string) => boolean;
	onRemove?: (index: number) => void;
}
