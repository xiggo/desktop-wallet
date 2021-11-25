import React from "react";

import { NavbarVariant } from "@/types";

export interface PageProperties {
	navbarVariant?: NavbarVariant;
	title?: string;
	isBackDisabled?: boolean;
	sidebar?: React.ReactNode;
	children: React.ReactNode;
}
