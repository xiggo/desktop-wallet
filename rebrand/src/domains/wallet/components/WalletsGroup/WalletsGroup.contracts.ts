import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import React from "react";

export interface MaxWidthReferences {
	balance: React.MutableRefObject<number>;
	currency: React.MutableRefObject<number>;
}

export interface WalletsGroupProperties {
	network: Networks.Network;
	wallets: Contracts.IReadWriteWallet[];
	maxWidthReferences: MaxWidthReferences;
}

export interface WalletsGroupHeaderProperties {
	network: Networks.Network;
	wallets: Contracts.IReadWriteWallet[];
	toggleWalletsPanel?: (event: React.MouseEvent) => void;
	isWalletsExpanded: boolean;
	isSinglePageMode?: boolean;
	maxWidthReferences?: MaxWidthReferences;
}

export interface WalletsGroupHeaderSkeletonProperties {
	isPlaceholder?: boolean;
	isSinglePageMode?: boolean;
}

export interface LabelledTextProperties {
	label: string;
	children: ((textClassName: string) => JSX.Element) | JSX.Element;
	maxWidthReference?: React.MutableRefObject<number>;
}

export interface WalletsGroupNetworkIconProperties {
	network: Networks.Network;
	isWalletsCollapsed: boolean;
}

export interface WalletsGroupNetworkNameProperties {
	network: Networks.Network;
}

export interface WalletsGroupNetworkTotalProperties {
	network: Networks.Network;
	wallets: Contracts.IReadWriteWallet[];
	isSinglePageMode: boolean;
	maxWidthReferences?: MaxWidthReferences;
}

export interface WalletsGroupChevronTogglerProperties {
	isWalletsExpanded: boolean;
	toggleWalletsPanel?: (event: React.MouseEvent) => void;
}
