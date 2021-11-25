import React from "react";

import { Position, Size } from "@/types";

export interface DropdownOption {
	icon?: string;
	iconPosition?: "start" | "end";
	label: string;
	secondaryLabel?: string;
	value: string | number;
	disabled?: boolean;
	[key: string]: any;
}

export interface DropdownOptionGroup {
	key: string;
	title?: string;
	hasDivider?: boolean;
	options: DropdownOption[];
	onSelect?: (option: DropdownOption) => void;
}

export type DropdownVariantType = "options" | "custom" | "votesFilter";

export interface DropdownProperties {
	as?: React.ElementType;
	children?: React.ReactNode;
	onSelect?: (option: DropdownOption) => void;
	variant?: DropdownVariantType;
	options?: DropdownOption[] | DropdownOptionGroup[];
	position?: Position;
	dropdownClass?: string;
	toggleIcon?: "Gear" | "ChevronDownSmall";
	toggleSize?: Size;
	toggleContent?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
	disableToggle?: boolean;
}
